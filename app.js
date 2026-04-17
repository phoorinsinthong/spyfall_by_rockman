import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update, child, push, remove } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import { firebaseConfig } from './firebase-config.js';

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const DEFAULT_LOCATIONS = {
  'โรงพยาบาล': ['หมอ', 'พยาบาลมือเบา', 'ศัลยแพทย์', 'คนไข้อาการหนัก', 'พนักงานเข็นเตียง', 'คนกลัวเข็มจนสลบ'],
  'ชายหาด': ['ไลฟ์การ์ด', 'นักเซิร์ฟ', 'คนทาครีมกันแดดวอก', 'แม่ค้าส้มตำ', 'คนห่วงยางแตก', 'แก๊งค์ปาร์ตี้ริมรหาด'],
  'คาสิโน': ['ดีลเลอร์', 'รปภ.หน้าโหด', 'นักพนันหมดตัว', 'แจกไพ่ผิด', 'เสี่ยกระเป๋าหนัก', 'คนมาดูเฉยๆ'],
  'เครื่องบิน': ['นักบินพักผ่อนน้อย', 'แอร์โฮสเตสสุดเป๊ะ', 'ผู้โดยสารเมาเครื่องบิน', 'เด็กร้องไห้เสียงดัง 8 หลอด', 'กัปตัน'],
  'โรงเรียน': ['ครูฝ่ายปกครอง', 'นักเรียนโดดเรียน', 'ครูใหญ่ใจดี', 'ภารโรงรู้ทุกเรื่อง', 'ประธานนักเรียนสุดเนิร์ด'],
  'หมูกระทะ': ['พนักงานเปลี่ยนเตา', 'คนแย่งตักกุ้ง', 'โต๊ะข้างๆที่กินจุมาก', 'สายเน้นถ่ายรูปไม่เน้นกิน', 'เจ้าของร้าน', 'นักร้องสู้ชีวิต'],
  'วัดป่า': ['เจ้าอาวาส', 'เด็กวัด', 'มัคนายกขาประจำ', 'คนขายลอตเตอรี่', 'สัปเหร่อ', 'คุณป้าสายบุญ'],
  'สถานีตำรวจ': ['ร้อยเวร', 'ผู้ต้องหา', 'ญาติผู้ต้องหา', 'ทนายความ', 'สายสืบนอกเครื่องแบบ', 'นักข่าวช่องดัง'],
  'ร้านนวดแผนไทย': ['หมอนวดจับเส้น', 'ลูกค้าบ้าจี้', 'คนเฝ้าเคาน์เตอร์', 'ลูกค้าที่หลับกรนเสียงดัง', 'ฝรั่งมาลองนวดครั้งแรก']
};

let STATE = {
  playerName: '',
  playerId: null,
  roomId: null,
  isHost: false,
  roomData: null,
  voteTarget: null,
};

const viewHome = document.getElementById('view-home');
const viewRoom = document.getElementById('view-room');
const homeError = document.getElementById('home-error');

const subviewLobby = document.getElementById('subview-lobby');
const subviewPlaying = document.getElementById('subview-playing');
const subviewVoting = document.getElementById('subview-voting');
const subviewFinished = document.getElementById('subview-finished');

function generateId() { return Math.random().toString(36).substring(2, 10); }
function generateRoomCode() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }

function switchView(toRoom) {
  if (toRoom) { viewHome.classList.add('hidden'); viewRoom.classList.remove('hidden'); }
  else { viewRoom.classList.add('hidden'); viewHome.classList.remove('hidden'); }
}

function switchSubView(status) {
  subviewLobby.classList.add('hidden'); subviewPlaying.classList.add('hidden');
  subviewVoting.classList.add('hidden'); subviewFinished.classList.add('hidden');
  if (status === 'LOBBY') subviewLobby.classList.remove('hidden');
  else if (status === 'PLAYING') subviewPlaying.classList.remove('hidden');
  else if (status === 'VOTING') subviewVoting.classList.remove('hidden');
  else if (status === 'FINISHED') subviewFinished.classList.remove('hidden');
}

// Host UI toggles
document.getElementById('location-pack-select').addEventListener('change', (e) => {
  const customUi = document.getElementById('custom-locations-container');
  if(e.target.value === 'custom') customUi.classList.remove('hidden');
  else customUi.classList.add('hidden');
});

document.getElementById('btn-show-locations').addEventListener('click', () => {
  document.getElementById('location-reference-ui').classList.toggle('hidden');
});

// HOME ACTIONS
document.getElementById('btn-create-room').addEventListener('click', async () => {
  const name = document.getElementById('player-name').value.trim();
  if (!name) { homeError.innerText = "กรุณากรอกชื่อของคุณ"; homeError.classList.remove('hidden'); return; }
  
  STATE.playerName = name; STATE.playerId = generateId(); STATE.roomId = generateRoomCode(); STATE.isHost = true;
  
  const roomRef = ref(db, `rooms/${STATE.roomId}`);
  const initialRoom = {
    status: 'LOBBY', host: STATE.playerId, targetLocation: '', winner: '', allLocations: [],
    players: { [STATE.playerId]: { name: STATE.playerName, isReady: false, role: '', location: '', votedFor: '' } },
    chat: {}
  };

  try {
    await set(roomRef, initialRoom);
    subscribeToRoom();
    switchView(true);
  } catch (err) {
    homeError.innerText = "ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบ Firebase"; homeError.classList.remove('hidden');
  }
});

document.getElementById('btn-join-room').addEventListener('click', async () => {
  const name = document.getElementById('player-name').value.trim();
  const code = document.getElementById('room-id-input').value.trim().toUpperCase();
  if (!name || !code) { homeError.innerText = "กรุณากรอกชื่อและรหัสห้อง"; homeError.classList.remove('hidden'); return; }

  const roomRef = ref(db, `rooms/${code}`);
  try {
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) { homeError.innerText = "ไม่พบห้องนี้"; homeError.classList.remove('hidden'); return; }
    if (snapshot.val().status !== 'LOBBY' && snapshot.val().status !== 'FINISHED') {
      homeError.innerText = "ห้องนี้เริ่มเกมไปแล้ว"; homeError.classList.remove('hidden'); return;
    }
    STATE.playerName = name; STATE.playerId = generateId(); STATE.roomId = code; STATE.isHost = false;
    await update(ref(db, `rooms/${code}/players/${STATE.playerId}`), { name: STATE.playerName, isReady: false, role: '', location: '', votedFor: '' });
    subscribeToRoom();
    switchView(true);
  } catch (err) { homeError.innerText = "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล"; homeError.classList.remove('hidden'); }
});

// SUBSCRIPTION
let unsubscribe = null;
function subscribeToRoom() {
  const roomRef = ref(db, `rooms/${STATE.roomId}`);
  document.getElementById('display-room-id').innerText = STATE.roomId;
  unsubscribe = onValue(roomRef, (snapshot) => {
    if (!snapshot.exists()) { alert("ห้องถูกปิดลงแล้ว"); location.reload(); return; }
    STATE.roomData = snapshot.val();
    renderRoom(STATE.roomData);
  });
}

function renderRoom(data) {
  const players = data.players || {};
  const playerIds = Object.keys(players);
  let me = players[STATE.playerId];
  if (!me) { alert('คุณถูกเตะออกจากห้อง'); location.reload(); return; }
  
  STATE.isHost = (data.host === STATE.playerId);
  document.getElementById('room-state-title').innerText = data.status === 'LOBBY' ? 'ล็อบบี้รอกดพร้อม' : data.status === 'PLAYING' ? 'กำลังเล่นเผ็ดมันส์' : data.status === 'VOTING' ? 'ช่วงเวลาโหวต!' : 'จบเกมแล้ว';
  switchSubView(data.status);

  if (data.status === 'LOBBY') {
    document.getElementById('btn-ready').innerHTML = me.isReady ? '<span class="front-sec">❌ ยกเลิกพร้อม</span>' : '<span class="front-sec">✅ กดพร้อม</span>';
    const hostControls = document.getElementById('host-controls');
    if (STATE.isHost) {
      hostControls.classList.remove('hidden');
      const readyCount = playerIds.filter(id => players[id].isReady).length;
      const totalCount = playerIds.length;
      const allReady = readyCount === totalCount && totalCount >= 3;
      const btnStart = document.getElementById('btn-start');
      btnStart.disabled = !allReady;
      btnStart.querySelector('.front').innerText = allReady
        ? '🚀 เริ่มเกมได้เลย!'
        : totalCount < 3
          ? `🚀 เริ่มเกม (ต้องมี 3 คน+)`
          : `⏳ รอ ${totalCount - readyCount} คน กดพร้อม...`;
    } else hostControls.classList.add('hidden');
    
    document.getElementById('player-list').innerHTML = playerIds.map(id => `
      <div class="player-item">
        <span>${players[id].name} ${id === data.host ? '👑' : ''}</span>
        <span class="${players[id].isReady ? 'badge-ready' : 'badge-notready'}">${players[id].isReady ? '✅ พร้อม' : '⏳ ยังไม่พร้อม'}</span>
      </div>`).join('');
    document.getElementById('player-count').innerText = playerIds.length;
  }

  if (data.status === 'PLAYING') {
    document.getElementById('display-role').innerText = `บทบาท: ${me.role}`;
    let isSpyOrAccomplice = me.role === 'สายลับ' || me.role === 'ผู้สมรู้ร่วมคิด';
    
    if (me.role === 'ผู้สมรู้ร่วมคิด') {
      let spyName = Object.values(players).find(p => p.role === 'สายลับ')?.name;
      document.getElementById('display-location').innerText = `สายลับคือ: ${spyName}`;
    } else if (me.role === 'สายลับ') {
      document.getElementById('display-location').innerText = 'ตีเนียนเข้าไว้ หาที่นี่ให้เจอ!';
    } else {
      document.getElementById('display-location').innerText = `สถานที่: ${me.location}`;
    }

    if (me.role === 'สายลับ') document.getElementById('spy-guess-ui').classList.remove('hidden');
    else document.getElementById('spy-guess-ui').classList.add('hidden');

    if (data.allLocations) {
       document.getElementById('location-list').innerHTML = data.allLocations.map(l => 
         `<span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px;">${l}</span>`
       ).join('');
    }
  }

  if (data.status === 'VOTING') {
    if (me.votedFor) { document.getElementById('vote-status-text').innerText = "รอคนอื่นโหวต..."; document.getElementById('btn-submit-vote').disabled = true; }
    else { document.getElementById('vote-status-text').innerText = "เลือกผู้ต้องสงสัย"; document.getElementById('btn-submit-vote').disabled = !STATE.voteTarget; }
    document.getElementById('vote-grid').innerHTML = playerIds.filter(id => id !== STATE.playerId).map(id => {
      let isSel = STATE.voteTarget === id ? 'selected' : '';
      return `<button class="vote-btn ${isSel}" onclick="window.selectVote('${id}')">${players[id].name}</button>`;
    }).join('');
  }

  if (data.status === 'FINISHED') {
    let winnerText = data.winner === 'Spy' ? 'สายลับ 🎉' : 'ชาวบ้าน 🏘️';
    document.getElementById('display-winner').innerText = `ผู้ชนะ: ${winnerText}`;
    let spyName = Object.values(players).find(p=>p.role==='สายลับ')?.name;
    document.getElementById('display-spy-name').innerText = `สายลับคือ: ${spyName}`;
    document.getElementById('display-true-location').innerText = `สถานที่จริงคือ: ${data.targetLocation}`;
    if (STATE.isHost) document.getElementById('btn-back-home').classList.remove('hidden');
    else document.getElementById('btn-back-home').classList.add('hidden');
  }

  renderChat(data.chat);
  handleTimer(data.timerEnd);
}

// GAME ACTIONS
document.getElementById('btn-ready').addEventListener('click', async () => {
  const currReady = STATE.roomData.players[STATE.playerId].isReady;
  await update(ref(db, `rooms/${STATE.roomId}/players/${STATE.playerId}`), { isReady: !currReady });
});

document.getElementById('btn-start').addEventListener('click', async () => {
  const players = STATE.roomData.players;
  const ids = Object.keys(players);
  if (ids.length < 3) return;

  // Determine Location Pack
  let pool = [];
  const packType = document.getElementById('location-pack-select').value;
  if (packType === 'custom') {
    const raw = document.getElementById('custom-locations-input').value;
    pool = raw.split(',').map(s => s.trim()).filter(s => s);
    if(pool.length < 3) pool = Object.keys(DEFAULT_LOCATIONS);
  } else {
    pool = Object.keys(DEFAULT_LOCATIONS);
  }

  const targetLoc = pool[Math.floor(Math.random() * pool.length)];
  let availableRoles = DEFAULT_LOCATIONS[targetLoc] ? [...DEFAULT_LOCATIONS[targetLoc]] : [];

  // Determine Spy & Accompolice
  const enableSpecial = document.getElementById('enable-special-roles').checked;
  let shuffledIds = ids.sort(() => 0.5 - Math.random());
  const spyId = shuffledIds[0];
  let accompliceId = null;
  
  if (enableSpecial && ids.length >= 4) {
    accompliceId = shuffledIds[1];
  }

  let updates = { targetLocation: targetLoc, status: 'PLAYING', timerEnd: Date.now() + (8 * 60 * 1000), winner: '', chat: {}, allLocations: pool };
  
  ids.forEach(id => {
    updates[`players/${id}/votedFor`] = '';
    updates[`players/${id}/isReady`] = false;
    
    if (id === spyId) {
      updates[`players/${id}/role`] = 'สายลับ';
      updates[`players/${id}/location`] = '';
    } else if (id === accompliceId) {
      updates[`players/${id}/role`] = 'ผู้สมรู้ร่วมคิด';
      updates[`players/${id}/location`] = '';
    } else {
      let r = availableRoles.length > 0 ? availableRoles.splice(Math.floor(Math.random() * availableRoles.length), 1)[0] : 'ชาวบ้าน';
      updates[`players/${id}/role`] = r;
      updates[`players/${id}/location`] = targetLoc;
    }
  });

  await update(ref(db, `rooms/${STATE.roomId}`), updates);
});

document.getElementById('btn-back-home').addEventListener('click', async () => {
  if (STATE.isHost) await update(ref(db, `rooms/${STATE.roomId}`), { status: 'LOBBY' });
});

async function doLeaveRoom() {
  try {
    const playerRef = ref(db, `rooms/${STATE.roomId}/players/${STATE.playerId}`);
    await remove(playerRef);
    if (STATE.isHost) {
      const snapshot = await get(ref(db, `rooms/${STATE.roomId}/players`));
      const remaining = snapshot.val();
      if (remaining) {
        const newHostId = Object.keys(remaining)[0];
        await update(ref(db, `rooms/${STATE.roomId}`), { host: newHostId });
      } else {
        await remove(ref(db, `rooms/${STATE.roomId}`));
      }
    }
  } catch (e) { /* ignore */ }
  if (unsubscribe) unsubscribe();
  STATE = { playerName: '', playerId: null, roomId: null, isHost: false, roomData: null, voteTarget: null };
  document.getElementById('leave-modal').classList.add('hidden');
  switchView(false);
}

document.getElementById('btn-leave-room').addEventListener('click', () => {
  document.getElementById('leave-modal').classList.remove('hidden');
});
document.getElementById('btn-leave-cancel').addEventListener('click', () => {
  document.getElementById('leave-modal').classList.add('hidden');
});
document.getElementById('btn-leave-confirm').addEventListener('click', doLeaveRoom);


window.selectVote = function(targetId) {
  if (STATE.roomData.status !== 'VOTING') return;
  STATE.voteTarget = targetId; renderRoom(STATE.roomData);
}

document.getElementById('btn-submit-vote').addEventListener('click', async () => {
  if (!STATE.voteTarget) return;
  await update(ref(db, `rooms/${STATE.roomId}/players/${STATE.playerId}`), { votedFor: STATE.voteTarget });
  STATE.voteTarget = null;
  setTimeout(checkVotesEndGame, 1000);
});

document.getElementById('btn-call-vote').addEventListener('click', async () => {
  await update(ref(db, `rooms/${STATE.roomId}`), { status: 'VOTING' });
});

document.getElementById('btn-spy-guess').addEventListener('click', async () => {
  const guess = document.getElementById('spy-guess-input').value.trim();
  if(!guess) return;
  if (guess.toLowerCase() === STATE.roomData.targetLocation.toLowerCase()) endGame('Spy');
  else endGame('Players');
});

async function checkVotesEndGame() {
  let rData = (await get(ref(db, `rooms/${STATE.roomId}`))).val();
  const players = rData.players;
  let allVoted = true, votes = {};
  for(let id in players) {
    if (!players[id].votedFor) allVoted = false;
    else votes[players[id].votedFor] = (votes[players[id].votedFor] || 0) + 1;
  }
  
  if (allVoted && rData.status === 'VOTING') {
    let max = 0, targets = [];
    for (let target in votes) {
      if (votes[target] > max) { max = votes[target]; targets = [target]; }
      else if (votes[target] === max) targets.push(target);
    }
    await endGame((targets.length === 1 && players[targets[0]].role === 'สายลับ') ? 'Players' : 'Spy');
  }
}

async function endGame(winnerStr) {
  if (STATE.roomData.status === 'FINISHED') return; 
  await update(ref(db, `rooms/${STATE.roomId}`), { status: 'FINISHED', winner: winnerStr });
}

// CHAT & TIMER
document.getElementById('btn-send-chat').addEventListener('click', async (e) => {
  e.preventDefault();
  const inp = document.getElementById('chat-input'), txt = inp.value.trim();
  if (!txt) return;
  inp.value = '';
  await set(push(ref(db, `rooms/${STATE.roomId}/chat`)), { sender: STATE.playerName, text: txt });
});

function renderChat(chatObj) {
  if (!chatObj) { document.getElementById('chat-messages').innerHTML = ''; return; }
  let html = '';
  for(let key in chatObj) html += `<div><strong>${chatObj[key].sender}:</strong> ${chatObj[key].text}</div>`;
  const cont = document.getElementById('chat-messages');
  cont.innerHTML = html; cont.scrollTop = cont.scrollHeight;
}

let timerInterval;
function handleTimer(timerEndTs) {
  clearInterval(timerInterval);
  if (!timerEndTs || STATE.roomData.status !== 'PLAYING') return;
  timerInterval = setInterval(() => {
    let diff = Math.floor((timerEndTs - Date.now())/1000);
    if (diff <= 0) {
      clearInterval(timerInterval);
      document.getElementById('display-timer').innerText = "00:00";
      if (STATE.isHost) update(ref(db, `rooms/${STATE.roomId}`), { status: 'VOTING' });
    } else {
      let min = Math.floor(diff/60), sec = diff % 60;
      document.getElementById('display-timer').innerText = `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
    }
  }, 1000);
}

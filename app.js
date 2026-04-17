import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update, child, push, remove } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import { firebaseConfig } from './firebase-config.js';

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const DEFAULT_LOCATIONS = {
  // สถานที่เดิม (ปรับปรุงแล้ว)
  'โรงพยาบาล': ['หมอ', 'พยาบาลมือเบา', 'ศัลยแพทย์', 'คนไข้อาการหนัก', 'พนักงานเข็นเตียง', 'คนกลัวเข็มจนสลบ'],
  'ชายหาด': ['ไลฟ์การ์ด', 'นักเซิร์ฟ', 'คนทาครีมกันแดดวอก', 'แม่ค้าส้มตำ', 'คนห่วงยางแตก', 'แก๊งค์ปาร์ตี้ริมหาด'],
  'คาสิโน': ['ดีลเลอร์', 'รปภ.หน้าโหด', 'นักพนันหมดตัว', 'แจกไพ่ผิด', 'เสี่ยกระเป๋าหนัก', 'คนมาดูเฉยๆ'],
  'เครื่องบิน': ['นักบินพักผ่อนน้อย', 'แอร์โฮสเตสสุดเป๊ะ', 'ผู้โดยสารเมาเครื่องบิน', 'เด็กร้องไห้ 8 หลอด', 'กัปตัน'],
  'โรงเรียน': ['ครูฝ่ายปกครอง', 'นักเรียนโดดเรียน', 'ครูใหญ่ใจดี', 'ภารโรงรู้ทุกเรื่อง', 'ประธานนักเรียนเนิร์ด'],
  'หมูกระทะ': ['พนักงานเปลี่ยนเตา', 'คนแย่งตักกุ้ง', 'โต๊ะข้างๆ กินจุมาก', 'สายถ่ายรูปไม่เน้นกิน', 'เจ้าของร้าน', 'นักร้องสู้ชีวิต'],
  'วัดป่า': ['เจ้าอาวาส', 'เด็กวัด', 'มัคนายกขาประจำ', 'คนขายลอตเตอรี่', 'สัปเหร่อ', 'คุณป้าสายบุญ'],
  'สถานีตำรวจ': ['ร้อยเวร', 'ผู้ต้องหา', 'ญาติผู้ต้องหา', 'ทนายความ', 'สายสืบนอกเครื่องแบบ', 'นักข่าวช่องดัง'],
  'ร้านนวดแผนไทย': ['หมอนวดจับเส้น', 'ลูกค้าบ้าจี้', 'คนเฝ้าเคาน์เตอร์', 'ลูกค้าหลับกรนเสียงดัง', 'ฝรั่งมาลองนวดครั้งแรก'],
  // สถานที่ใหม่ 20 แห่ง
  'ตลาดนัด': ['พ่อค้าต่อราคาเก่ง', 'แม่ค้าไม่ลดแล้ว', 'คนงงราคา', 'คนแบกของหนัก', 'โจรล้วงกระเป๋า', 'คนตามหาของถูก'],
  'ร้านสะดวกซื้อ': ['แคชเชียร์ง่วงนอน', 'ลูกค้าซื้อบุหรี่กลางดึก', 'เด็กกินซาลาเปาหน้าร้าน', 'พนักงานไล่ให้ออก', 'คนมาขอชาร์จโทรศัพท์'],
  'สนามฟุตบอล': ['กองหน้าขิงมาก', 'กองหลังไม่วิ่ง', 'ผู้รักษาประตูมือใหม่', 'กองเชียร์ดังลั่น', 'ผู้ตัดสินโดน욕', 'คนขายน้ำข้างสนาม'],
  'ห้างสรรพสินค้า': ['พนักงานขับรถเข็น', 'แม่บ้านโปรโมชั่น', 'เด็กวิ่งหายในห้าง', 'คนต่อคิวฟู้ดคอร์ต', 'คนหาที่จอดรถไม่เจอ', 'พนักงานต้อนรับตึง'],
  'สวนสัตว์': ['ผู้ดูแลสัตว์', 'เด็กขว้างอาหารใส่ลิง', 'คนกลัวงู', 'ไกด์นำเที่ยวเสียงดัง', 'คนซื้อลูกโป่งแล้วหายไป', 'ช่างภาพสัตว์ป่า'],
  'ค่ายทหาร': ['นายพล', 'ทหารเกณฑ์ปีแรก', 'จ่าโหด', 'พลทหารหลับยืน', 'แม่ทัพ', 'พ่อครัวทหาร'],
  'ร้านอาหารหรู': ['เชฟมิชลิน', 'เสิร์ฟไวน์ผิดโต๊ะ', 'ลูกค้าอินสตาแกรม', 'คนกินครั้งแรกในชีวิต', 'โซมเมลิเย่', 'เด็กร้านขัดรองเท้า'],
  'ยิม': ['เทรนเนอร์แน่นมาก', 'คนยกเวทตะโกน', 'คนเดินสายพานดูโทรศัพท์', 'สาวเซลฟี่ทุก 5 นาที', 'คนขโมยที่นั่งพัก', 'คนเช็ดเหงื่อใส่เครื่อง'],
  'สนามบิน': ['พนักงานเช็คอิน', 'คนสายเครื่องตก', 'เจ้าหน้าที่ตรวจหนังสือเดินทาง', 'คนแพ็คกระเป๋าเกิน', 'ตำรวจตรวจศุลกากร', 'ผู้โดยสาร VIP'],
  'โรงภาพยนตร์': ['คนโทรศัพท์ไม่ปิดเสียง', 'คนทานป๊อปคอร์นเสียงดัง', 'พนักงานฉายหนัง', 'คู่รักแอบจูบกัน', 'คนตัวสูงนั่งหน้า', 'แม่พาลูกเข้าหนังผู้ใหญ่'],
  'ตลาดปลา': ['พ่อค้าปลาตะโกน', 'คนซื้อปลาต่อราคา', 'แมวขโมยปลา', 'แม่ค้าทำน้ำปลาหก', 'คนแพ้กลิ่นปลา', 'ชาวประมง'],
  'โรงแรม 5 ดาว': ['คอนเซียร์จสุดเป๊ะ', 'แม่บ้านตรวจความสะอาด', 'แขกนักธุรกิจ', 'บาร์เทนเดอร์เลานจ์', 'คนลืมกุญแจห้อง', 'พนักงาน Spa'],
  'ร้านเกม': ['เจ้าของร้านอ้วน', 'เด็กเล่น PUBG ด่าเพื่อน', 'คนทำเครื่องพัง', 'แม่มาตาม', 'คนหัดเล่นครั้งแรก', 'โปรเกมเมอร์ฝึกซ้อม'],
  'ไนต์คลับ': ['ดีเจ', 'ซีเคียวริตี้ใหญ่โต', 'คนเมาสุดๆ', 'สาวไฮโซ VIP', 'บาร์เทนเดอร์มือเร็ว', 'คนเต้นสุดฮา'],
  'ฟาร์มหมู': ['เกษตรกรสุดแกร่ง', 'สัตวแพทย์บ้านนอก', 'หมูแสนรู้', 'คนซื้อหมูส่งตลาด', 'ลูกหมูหนี', 'นักวิทยาศาสตร์เก็บตัวอย่าง'],
  'ออฟฟิศ': ['ซีอีโอหน้าบึ้ง', 'พนักงานฝ่าย HR', 'เด็กฝึกงานงง', 'คนหลับในประชุม', 'คนล็อคหน้าจอไว้', 'แม่บ้านออฟฟิศรู้ทุกเรื่อง'],
  'คอนเสิร์ต': ['นักร้องดัง', 'สตาฟฟ์แบกอุปกรณ์', 'แฟนคลับกรี๊ดดัง', 'คนถ่ายวิดีโอตลอด', 'รปภ.ดันคนออก', 'คนซื้อตั๋วปลอม'],
  'สิ่งขนส่งสาธารณะ (BTS)': ['คนไม่ยอมขยับเข้าไป', 'นักเรียนแย่งที่นั่ง', 'คนฟังเพลงเสียงดัง', 'คนสวมหน้ากากมิดชิด', 'พ่อค้าขายของในรถไฟ', 'ตำรวจตรวจตั๋ว'],
  'ตลาดนัดกลางคืน (Jodd Fair)': ['คนขายของวินเทจ', 'อินฟลูเอนเซอร์ถ่ายคอนเทนต์', 'คนหาที่จอดรถ 1 ชั่วโมง', 'พ่อครัวสตรีทฟู้ด', 'ดีเจเปิดเพลง', 'นักท่องเที่ยวต่างชาติ'],
  'สปา / อ่างน้ำร้อน': ['แพทย์ทางเลือก', 'ลูกค้าเครียดสุดๆ', 'พนักงานเจ้าของนิ้ว', 'คนหลับตลอด 2 ชั่วโมง', 'เซลล์ขายแพ็คเกจ', 'คนแพ้น้ำมันหอม'],
  // 10 สถานที่ใหม่กวนๆ
  'ห้องน้ำสาธารณะ': ['คนเคาะประตูถี่มาก', 'คนกระดาษหมดพอดี', 'แม่บ้านถือไม้ม็อปจ้อง', 'คนโทรคุยในห้องน้ำ', 'คนลืมรูดซิป'],
  'งานแต่งงาน': ['เจ้าบ่าวตื่นเต้นจนเป็นลม', 'เจ้าสาวไม่มา', 'แขกกินบุฟเฟ่ต์ยกที่', 'DJ เปิดเพลงผิด', 'ป้าถ่ายรูปขวางช่างภาพ', 'แฟนเก่าแอบมา'],
  'ร้านตัดผม': ['ช่างตัดผมมือสั่น', 'ลูกค้าโชว์รูปดาราแล้วผิดหวัง', 'เด็กร้องไห้ไม่ยอมตัด', 'คนรอนานจนหลับ', 'ช่างโกนหนวดหน้าตาเฉย', 'ลูกค้าบ่นไม่หยุด'],
  'ห้องสอบ': ['นักเรียนลอกข้างๆ', 'อาจารย์คุมสอบง่วงนอน', 'คนเขียนจนหมดหน้ากระดาษ', 'คนส่งข้อสอบแล้วเดินออกมาดีใจ', 'คนลืมดินสอ', 'นักเรียนนั่งสั่นขาตลอด'],
  'รถเมล์ตีห้า': ['คนขับแข่งกับเวลา', 'ป้าแม่ค้าตะกร้าเต็มคัน', 'ลูกจ้างง่วงจนหัวทิ่ม', 'คนนับเหรียญค่าโดยสาร', 'กระเป๋ารถด่าทอด', 'คนวิ่งตามรถไม่ทัน'],
  'ร้านขายยา': ['เภสัชกรถามซักประวัติยาว', 'ลูกค้าซื้อยาตามติ๊กต๊อก', 'คนซื้อถุงยางตาขวาง', 'คนมาขอยาแก้เมาค้าง', 'ลูกค้าแย้งว่าหมอสั่งผิด', 'คนซื้อวิตามินทั้งร้าน'],
  'ค่ายดาวเทียม (Camp)': ['ผู้นำค่ายสุดฮาร์ดคอร์', 'น้องใหม่ร้องไห้คิดถึงบ้าน', 'คนกลัวแมลง', 'คืนแรกนอนไม่หลับ', 'แม่ทัพทีมเชียร์', 'คนแอบเอาโทรศัพท์มา'],
  'ห้อง ICU': ['หมอทำหน้าตรึง', 'พยาบาลวิ่งทุก 5 นาที', 'ญาติร้องไห้หน้าห้อง', 'เครื่องบีบหัวใจดังตลอด', 'คนไข้แอบดูฟีด IG', 'นักศึกษาแพทย์ฝึกงาน'],
  'ปาร์ตี้วันเกิด': ['เจ้าของวันเกิดร้องไห้โดนเซอร์ไพรส์', 'คนตัดเค้กแบ่งผิด', 'แขกที่ไม่ได้รับเชิญแต่มาเอง', 'คนเหล้าหมดก่อนทุกคน', 'ดีเจเปิดเพลงสปีดเร็วผิดงาน', 'คนถ่ายรูปแต่ไม่กิน'],
  'ราชวัง / พระบรมมหาราชวัง': ['นักท่องเที่ยวไม่รู้กฎการแต่งกาย', 'ไกด์เล่าประวัติศาสตร์ไม่หยุด', 'เจ้าหน้าที่ยืนนิ่งเหมือนหุ่น', 'คนแอบถ่ายรูปในเขตห้าม', 'แฟชั่นนิสต้าใส่ชุดสั้น', 'พระราชวงศ์เสด็จ'],
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
  if (e.target.value === 'custom') customUi.classList.remove('hidden');
  else customUi.classList.add('hidden');
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
function showKickedToast() {
  const toast = document.createElement('div');
  toast.className = 'kicked-toast';
  toast.innerHTML = '🥾 คุณถูกหัวหน้าห้องเตะออกแล้ว!';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

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
  if (!me) {
    // Player was removed — show kicked notification and go home
    if (unsubscribe) unsubscribe();
    STATE = { playerName: '', playerId: null, roomId: null, isHost: false, roomData: null, voteTarget: null };
    showKickedToast();
    switchView(false);
    return;
  }
  // Check if this player was marked as kicked (before removal)
  if (me.kicked) {
    return; // wait for the remove to come through
  }

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
        <span style="display:flex; align-items:center; gap:0.5rem;">
          <span class="${players[id].isReady ? 'badge-ready' : 'badge-notready'}">${players[id].isReady ? '✅ พร้อม' : '⏳ ยังไม่พร้อม'}</span>
          ${STATE.isHost && id !== STATE.playerId ? `<button class="kick-btn" onclick="window.kickPlayer('${id}', '${players[id].name}')">🥾 เตะ</button>` : ''}
        </span>
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

    // Show spy-revealing banner to ALL players
    const banner = document.getElementById('spy-revealing-banner');
    if (data.spyRevealing) {
      banner.classList.remove('hidden');
      document.getElementById('spy-banner-text').innerText =
        me.role === 'สายลับ'
          ? '🔮 คุณกำลังจะประกาศตัว! เลือกสถานที่ให้ดีๆ...'
          : `🚨 "${data.spyRevealing}" ประกาศตัวเป็นสายลับแล้ว! กำลังทายสถานที่...`;
    } else {
      banner.classList.add('hidden');
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
    let spyName = Object.values(players).find(p => p.role === 'สายลับ')?.name;
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
    if (pool.length < 3) pool = Object.keys(DEFAULT_LOCATIONS);
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


window.selectVote = function (targetId) {
  if (STATE.roomData.status !== 'VOTING') return;
  STATE.voteTarget = targetId; renderRoom(STATE.roomData);
}

window.kickPlayer = async function (targetId, targetName) {
  if (!STATE.isHost) return;
  // Mark player as kicked in Firebase (the player's own listener will pick it up and redirect them)
  await update(ref(db, `rooms/${STATE.roomId}/players/${targetId}`), { kicked: true });
  // Wait briefly then remove from DB
  setTimeout(async () => {
    await remove(ref(db, `rooms/${STATE.roomId}/players/${targetId}`));
  }, 1500);
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

// Spy reveal flow
document.getElementById('btn-spy-reveal').addEventListener('click', () => {
  const allLocations = STATE.roomData.allLocations || Object.keys(DEFAULT_LOCATIONS);
  const sel = document.getElementById('spy-location-select');
  sel.innerHTML = '<option value="">— เลือกสถานที่ —</option>';
  allLocations.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc; opt.innerText = loc;
    sel.appendChild(opt);
  });
  document.getElementById('spy-reveal-name-text').innerText = `"${STATE.playerName}" กำลังประกาศตัวเป็นสายลับ!`;
  document.getElementById('spy-reveal-modal').classList.remove('hidden');
  // Broadcast to all that spy is revealing
  update(ref(db, `rooms/${STATE.roomId}`), { spyRevealing: STATE.playerName });
});

document.getElementById('btn-spy-cancel-reveal').addEventListener('click', () => {
  document.getElementById('spy-reveal-modal').classList.add('hidden');
  update(ref(db, `rooms/${STATE.roomId}`), { spyRevealing: '' });
});

document.getElementById('btn-spy-guess-confirm').addEventListener('click', async () => {
  const guess = document.getElementById('spy-location-select').value;
  if (!guess) { document.getElementById('spy-location-select').style.border = '3px solid #ef4444'; return; }
  document.getElementById('spy-reveal-modal').classList.add('hidden');
  await update(ref(db, `rooms/${STATE.roomId}`), { spyRevealing: '' });
  if (guess === STATE.roomData.targetLocation) endGame('Spy');
  else endGame('Players');
});


async function checkVotesEndGame() {
  let rData = (await get(ref(db, `rooms/${STATE.roomId}`))).val();
  const players = rData.players;
  let allVoted = true, votes = {};
  for (let id in players) {
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
  for (let key in chatObj) html += `<div><strong>${chatObj[key].sender}:</strong> ${chatObj[key].text}</div>`;
  const cont = document.getElementById('chat-messages');
  cont.innerHTML = html; cont.scrollTop = cont.scrollHeight;
}

let timerInterval;
function handleTimer(timerEndTs) {
  clearInterval(timerInterval);
  if (!timerEndTs || STATE.roomData.status !== 'PLAYING') return;
  timerInterval = setInterval(() => {
    let diff = Math.floor((timerEndTs - Date.now()) / 1000);
    if (diff <= 0) {
      clearInterval(timerInterval);
      document.getElementById('display-timer').innerText = "00:00";
      if (STATE.isHost) update(ref(db, `rooms/${STATE.roomId}`), { status: 'VOTING' });
    } else {
      let min = Math.floor(diff / 60), sec = diff % 60;
      document.getElementById('display-timer').innerText = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

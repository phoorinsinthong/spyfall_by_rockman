import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update, child, push, remove } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import { firebaseConfig } from './firebase-config.js';
import { CATS } from './categories.js';

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

const NON_STANDARD_LOCATIONS = {
  'กกมง.กง.กห.': ['ผอ.', 'รอง ผอ.', 'พี่โย', 'โตน้อย', 'พี่เชียร', 'นิว', 'กัน', 'พี่นัท'],
  'กจก.กง.กห.': ['ผอ.', 'รอง กอล์ฟ', 'รอง หญิง', 'พี่นัท', 'พี่โอ๋', 'พี่หนู', 'พี่ใหม่', 'โอปอ', 'พี่หมวย',]
};

let STATE = {
  playerName: '',
  playerId: null,
  roomId: null,
  isHost: false,
  roomData: null,
  voteTarget: null,
};

// SESSION MANAGEMENT
function saveSession() {
  localStorage.setItem('spyfall_session', JSON.stringify({
    playerId: STATE.playerId,
    playerName: STATE.playerName,
    roomId: STATE.roomId
  }));
}

function clearSession() {
  localStorage.removeItem('spyfall_session');
}

async function checkSessionOnLoad() {
  const sessionData = localStorage.getItem('spyfall_session');
  if (!sessionData) return;

  try {
    const session = JSON.parse(sessionData);
    if (session.roomId && session.playerId && session.playerName) {
      const roomRef = ref(db, `rooms/${session.roomId}`);
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const room = snapshot.val();
        if (room.players && room.players[session.playerId]) {
          // Session is valid and player is still in the room
          document.getElementById('rejoin-room-id-text').innerText = session.roomId;
          document.getElementById('rejoin-player-name-text').innerText = session.playerName;
          document.getElementById('rejoin-banner').classList.remove('hidden');

          // Add listeners for rejoin buttons
          document.getElementById('btn-rejoin').onclick = () => {
            STATE.playerId = session.playerId;
            STATE.playerName = session.playerName;
            STATE.roomId = session.roomId;
            document.getElementById('rejoin-banner').classList.add('hidden');
            subscribeToRoom();
            switchView(true);
          };

          document.getElementById('btn-rejoin-dismiss').onclick = () => {
            clearSession();
            document.getElementById('rejoin-banner').classList.add('hidden');
          };
          return;
        }
      }
    }
    // If not valid, clear it
    clearSession();
  } catch (e) {
    clearSession();
  }
}
// Run on load
checkSessionOnLoad();

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
  if (toRoom) {
    // Stop the room list listener when entering a room
    if (roomsUnsubscribe) { roomsUnsubscribe(); roomsUnsubscribe = null; }
    viewHome.classList.add('hidden');
    viewRoom.classList.remove('hidden');
  } else {
    viewRoom.classList.add('hidden');
    viewHome.classList.remove('hidden');
    // Restart room list listener when going back home
    loadRoomList();
  }
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

// ADMIN ACTIONS
const ADMIN_PASSWORD = 'admin'; // <--- Change this to the actual password requested

document.getElementById('btn-open-admin').addEventListener('click', () => {
  document.getElementById('admin-modal').classList.remove('hidden');
  document.getElementById('admin-password-input').value = '';
  document.getElementById('admin-error').classList.add('hidden');
  document.getElementById('admin-confirm-zone').classList.add('hidden');
});

document.getElementById('btn-admin-close').addEventListener('click', () => {
  document.getElementById('admin-modal').classList.add('hidden');
});

document.getElementById('btn-admin-reset').addEventListener('click', () => {
  const pwd = document.getElementById('admin-password-input').value;
  if (pwd === ADMIN_PASSWORD) {
    document.getElementById('admin-error').classList.add('hidden');
    document.getElementById('admin-confirm-zone').classList.remove('hidden');
  } else {
    document.getElementById('admin-error').innerText = "รหัสผ่านไม่ถูกต้อง";
    document.getElementById('admin-error').classList.remove('hidden');
  }
});

document.getElementById('btn-admin-cancel-reset').addEventListener('click', () => {
  document.getElementById('admin-confirm-zone').classList.add('hidden');
});

document.getElementById('btn-admin-confirm-reset').addEventListener('click', async () => {
  try {
    await remove(ref(db, 'rooms'));
    document.getElementById('admin-modal').classList.add('hidden');
    showToast("ลบห้องทั้งหมดเรียบร้อยแล้ว", "success");
  } catch (err) {
    document.getElementById('admin-error').innerText = "เกิดข้อผิดพลาดในการลบห้อง";
    document.getElementById('admin-error').classList.remove('hidden');
  }
});


// ROOM LIST LOGIC
let roomsUnsubscribe = null;

function loadRoomList() {
  const listLoading = document.getElementById('room-list-loading');
  const listEmpty = document.getElementById('room-list-empty');
  const listItems = document.getElementById('room-list-items');
  const btnRefresh = document.getElementById('btn-refresh-rooms');

  btnRefresh.classList.add('spin-anim');
  
  if (roomsUnsubscribe) roomsUnsubscribe();

  listLoading.classList.remove('hidden');
  listEmpty.classList.add('hidden');
  listItems.classList.add('hidden');

  roomsUnsubscribe = onValue(ref(db, 'rooms'), (snapshot) => {
    listLoading.classList.add('hidden');
    btnRefresh.classList.remove('spin-anim');

    if (!snapshot.exists()) {
      listEmpty.classList.remove('hidden');
      listItems.innerHTML = '';
      return;
    }

    const rooms = snapshot.val();
    const openRooms = Object.entries(rooms).filter(([id, room]) => room.status === 'LOBBY' || room.status === 'PLAYING');

    if (openRooms.length === 0) {
      listEmpty.classList.remove('hidden');
      listItems.innerHTML = '';
      return;
    }

    listEmpty.classList.add('hidden');
    listItems.classList.remove('hidden');
    
    listItems.innerHTML = openRooms.map(([id, room]) => {
      const pCount = room.players ? Object.keys(room.players).length : 0;
      const statusIcon = room.status === 'LOBBY' ? '🏠' : '🔥';
      const statusText = room.status === 'LOBBY' ? 'ล็อบบี้' : 'กำลังเล่น';
      const isJoinable = room.status === 'LOBBY';

      return `
        <div class="room-list-item ${isJoinable ? '' : 'disabled'}" onclick="${isJoinable ? `window.joinFromList('${id}')` : ''}">
          <div class="room-list-info">
            <span class="room-list-id">${id}</span>
            <span class="room-list-count">👥 ${pCount} คน</span>
            <span class="room-list-status">${statusIcon} ${statusText}</span>
          </div>
          ${isJoinable ? '<button class="btn-join-sm">เข้าร่วม</button>' : '<span class="status-full">เข้าไม่ได้</span>'}
        </div>
      `;
    }).join('');
  }, (error) => {
    console.error('Room list error:', error);
    listLoading.classList.add('hidden');
    listEmpty.classList.remove('hidden');
  }); // real-time listener
}

document.getElementById('btn-refresh-rooms').addEventListener('click', loadRoomList);
// Initial load
loadRoomList();


// JOIN FROM LIST
window.joinFromList = async function(code) {
  const name = document.getElementById('player-name').value.trim();
  if (!name) { 
    homeError.innerText = "กรุณากรอกชื่อของคุณก่อนเข้าร่วมห้อง"; 
    homeError.classList.remove('hidden'); 
    document.getElementById('player-name').focus();
    return; 
  }

  homeError.classList.add('hidden');
  const roomRef = ref(db, `rooms/${code}`);
  try {
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) { homeError.innerText = "ไม่พบห้องนี้"; homeError.classList.remove('hidden'); return; }
    if (snapshot.val().status !== 'LOBBY') {
      homeError.innerText = "ห้องนี้เริ่มเกมไปแล้ว"; homeError.classList.remove('hidden'); return;
    }
    STATE.playerName = name; STATE.playerId = generateId(); STATE.roomId = code; STATE.isHost = false;
    await update(ref(db, `rooms/${code}/players/${STATE.playerId}`), { name: STATE.playerName, isReady: false, role: '', location: '', votedFor: '', wantsToVote: false });
    
    saveSession();
    subscribeToRoom();
    switchView(true);
  } catch (err) { homeError.innerText = "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล"; homeError.classList.remove('hidden'); }
};

// HOME ACTIONS
document.getElementById('btn-create-room').addEventListener('click', async () => {
  const name = document.getElementById('player-name').value.trim();
  if (!name) { homeError.innerText = "กรุณากรอกชื่อของคุณ"; homeError.classList.remove('hidden'); return; }

  STATE.playerName = name; STATE.playerId = generateId(); STATE.roomId = generateRoomCode(); STATE.isHost = true;

  const roomRef = ref(db, `rooms/${STATE.roomId}`);
  const initialRoom = {
    status: 'LOBBY', host: STATE.playerId, targetLocation: '', winner: '', allLocations: [],
    players: { [STATE.playerId]: { name: STATE.playerName, isReady: false, role: '', location: '', votedFor: '', wantsToVote: false } },
    chat: {}
  };

  try {
    await set(roomRef, initialRoom);
    saveSession();
    subscribeToRoom();
    switchView(true);
  } catch (err) {
    homeError.innerText = "ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบ Firebase"; homeError.classList.remove('hidden');
  }
});

// SUBSCRIPTION
let unsubscribe = null;
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast-notif ${type} animate-fade-in`;

  const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastFade 0.5s ease forwards';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function handleCopyRoomId() {
  const text = STATE.roomId;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast(`คัดลอกรหัสห้อง ${text} แล้ว!`, 'success');
    const btn = document.getElementById('display-room-id');
    btn.classList.add('click-effect');
    setTimeout(() => btn.classList.remove('click-effect'), 200);
  });
}

async function addSystemMessage(text) {
  if (!STATE.roomId) return;
  await set(push(ref(db, `rooms/${STATE.roomId}/chat`)), {
    sender: 'ระบบ',
    text: text,
    isSystem: true
  });
}

function subscribeToRoom() {
  const roomRef = ref(db, `rooms/${STATE.roomId}`);
  const idDisplay = document.getElementById('room-id-text');
  if (idDisplay) idDisplay.innerText = STATE.roomId;

  // Add copy listener
  document.getElementById('display-room-id').onclick = handleCopyRoomId;

  unsubscribe = onValue(roomRef, (snapshot) => {
    if (!snapshot.exists()) {
      showToast("ห้องถูกปิดลงแล้ว", "warning");
      clearSession();
      setTimeout(() => location.reload(), 1500);
      return;
    }
    const prevStatus = STATE.roomData?.status;
    STATE.roomData = snapshot.val();

    // Detect status changes for system messages
    if (prevStatus && prevStatus !== STATE.roomData.status && STATE.isHost) {
      if (STATE.roomData.status === 'PLAYING') addSystemMessage('🚀 เริ่มเกมแล้ว! หาตัวสายลับให้เจอ');
      if (STATE.roomData.status === 'VOTING') addSystemMessage('⚖️ เริ่มการโหวต! เลือกคนที่คุณสงสัย');
    }

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
    clearSession();
    showToast('🥾 คุณถูกหัวหน้าห้องเตะออกแล้ว!', 'warning');
    switchView(false);
    return;
  }
  // Check if this player was marked as kicked (before removal)
  if (me.kicked) {
    return; // wait for the remove to come through
  }

  STATE.isHost = (data.host === STATE.playerId);
  const badge = document.getElementById('room-state-badge');
  if (badge) {
    if (data.status === 'LOBBY') { badge.className = 'state-badge lobby'; badge.innerText = '🏠 ล็อบบี้'; }
    else if (data.status === 'PLAYING') { badge.className = 'state-badge playing'; badge.innerText = '🔥 กำลังเล่น'; }
    else if (data.status === 'VOTING') { badge.className = 'state-badge voting'; badge.innerText = '⚖️ โหวต'; }
    else { badge.className = 'state-badge'; badge.innerText = '🏁 จบเกม'; }
  }
  switchSubView(data.status);

  if (data.status === 'LOBBY') {
    document.getElementById('btn-ready').innerHTML = me.isReady ? '<span class="front-sec" style="background:rgba(255,255,255,0.1); color:var(--text-primary); border-color:var(--border-medium);">❌ ยกเลิกพร้อม</span>' : '<span class="front-sec">✅ กดพร้อม</span>';
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
    const roleElem = document.getElementById('display-role');
    const locElem = document.getElementById('display-location');
    const locLabel = document.getElementById('location-label-text');

    roleElem.innerText = me.role;
    if (me.role === 'สายลับ') roleElem.classList.add('spy-role');
    else roleElem.classList.remove('spy-role');

    let isSpyOrAccomplice = me.role === 'สายลับ' || me.role === 'ผู้สมรู้ร่วมคิด';

    if (me.role === 'ผู้สมรู้ร่วมคิด') {
      let spyName = Object.values(players).find(p => p.role === 'สายลับ')?.name;
      locLabel.innerText = 'สายลับคือ';
      locElem.innerText = spyName;
    } else if (me.role === 'สายลับ') {
      locLabel.innerText = 'เป้าหมาย';
      locElem.innerHTML = 'หาที่นี่ให้เจอ! <div class="spy-hint">แฝงตัวและฟังให้ดี..</div>';
    } else {
      locLabel.innerText = 'สถานที่';
      locElem.innerText = me.location;
    }

    if (me.role === 'สายลับ') document.getElementById('spy-guess-ui').classList.remove('hidden');
    else document.getElementById('spy-guess-ui').classList.add('hidden');

    // Wants to vote logic
    let wantsToVoteCount = 0;
    for (let id in players) {
      if (players[id].wantsToVote) wantsToVoteCount++;
    }
    const requiredVotes = Math.ceil((playerIds.length * 2) / 3);

    const btnCallVote = document.getElementById('btn-call-vote');
    if (me.wantsToVote) {
      btnCallVote.innerHTML = `<span class="front-sec" style="background:rgba(255,255,255,0.1); color:var(--text-primary); border-color:var(--border-medium);">❌ ยกเลิกขอเปิดโหวต (${wantsToVoteCount}/${requiredVotes})</span>`;
    } else {
      btnCallVote.innerHTML = `<span class="front-sec">⚠️ ขอเปิดโหวตจับสายลับ ${wantsToVoteCount > 0 ? `(${wantsToVoteCount}/${requiredVotes})` : ''}</span>`;
    }

    if (STATE.isHost && wantsToVoteCount >= requiredVotes && data.status === 'PLAYING') {
      update(ref(db, `rooms/${STATE.roomId}`), { status: 'VOTING' });
    }

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

    const resultCard = document.getElementById('result-card');
    const winnerDisplay = document.getElementById('display-winner');
    if (data.winner === 'Spy') {
      resultCard.classList.add('spy-won');
      winnerDisplay.classList.add('spy-won');
    } else {
      resultCard.classList.remove('spy-won');
      winnerDisplay.classList.remove('spy-won');
    }

    let spyName = Object.values(players).find(p => p.role === 'สายลับ')?.name;
    document.getElementById('display-spy-name').innerText = spyName;
    document.getElementById('display-true-location').innerText = data.targetLocation;

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
  let packDict = {};

  if (packType === 'all_cats') {
    CATS.forEach(c => c.places.forEach(p => packDict[p.n] = p.r));
    pool = Object.keys(packDict);
  } else if (packType.startsWith('cat_')) {
    const catId = packType.replace('cat_', '');
    const category = CATS.find(c => c.id === catId);
    if (category) {
      category.places.forEach(p => packDict[p.n] = p.r);
    }
    pool = Object.keys(packDict);
    if (pool.length < 3) { packDict = DEFAULT_LOCATIONS; pool = Object.keys(packDict); } // Fallback
  } else if (packType === 'custom') {
    const raw = document.getElementById('custom-locations-input').value;
    pool = raw.split(',').map(s => s.trim()).filter(s => s);
    if (pool.length < 3) pool = Object.keys(DEFAULT_LOCATIONS);
  } else if (packType === 'non_standard') {
    packDict = NON_STANDARD_LOCATIONS;
    pool = Object.keys(packDict);
  } else {
    packDict = DEFAULT_LOCATIONS;
    pool = Object.keys(packDict);
  }

  const targetLoc = pool[Math.floor(Math.random() * pool.length)];
  let availableRoles = packDict[targetLoc] ? [...packDict[targetLoc]] : [];

  // Determine Spy & Accompolice
  const enableSpecial = document.getElementById('enable-special-roles').checked;
  let shuffledIds = ids.sort(() => 0.5 - Math.random());
  const spyId = shuffledIds[0];
  let accompliceId = null;

  if (enableSpecial && ids.length >= 4) {
    accompliceId = shuffledIds[1];
  }

  let updates = { targetLocation: targetLoc, status: 'PLAYING', timerEnd: Date.now() + (8 * 60 * 1000), winner: '', allLocations: pool };

  ids.forEach(id => {
    updates[`players/${id}/votedFor`] = '';
    updates[`players/${id}/isReady`] = false;
    updates[`players/${id}/wantsToVote`] = false;

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
  showToast("เกมเริ่มแล้ว!", "success");
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
  clearSession();
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
  const currWantsToVote = STATE.roomData.players[STATE.playerId].wantsToVote;
  await update(ref(db, `rooms/${STATE.roomId}/players/${STATE.playerId}`), { wantsToVote: !currWantsToVote });
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
  if (guess === STATE.roomData.targetLocation) {
    showToast("สายลับทายถูก!", "warning");
    endGame('Spy');
  } else {
    showToast("สายลับทายผิด!", "success");
    endGame('Players');
  }
});

// Location Modal Logic
document.getElementById('btn-show-locations').addEventListener('click', () => {
  const modal = document.getElementById('locations-modal');
  const container = document.getElementById('locations-grid-list');
  const pool = STATE.roomData.allLocations || Object.keys(DEFAULT_LOCATIONS);

  container.innerHTML = pool.map(loc => `
    <div class="location-list-item">
      <span>📍</span>
      <span>${loc}</span>
    </div>
  `).join('');

  modal.classList.remove('hidden');
});

document.getElementById('btn-close-locations').addEventListener('click', () => {
  document.getElementById('locations-modal').classList.add('hidden');
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
  for (let key in chatObj) {
    let m = chatObj[key];
    if (m.isSystem) {
      html += `<div class="chat-msg system-msg">
        <div class="msg-text">${m.text}</div>
      </div>`;
    } else {
      html += `<div class="chat-msg">
        <span class="sender">${m.sender}</span>
        <div class="msg-text">${m.text}</div>
      </div>`;
    }
  }
  const cont = document.getElementById('chat-messages');
  cont.innerHTML = html; cont.scrollTop = cont.scrollHeight;
}

let timerInterval;
function handleTimer(timerEndTs) {
  clearInterval(timerInterval);
  if (!timerEndTs || STATE.roomData.status !== 'PLAYING') return;

  const timerBar = document.getElementById('timer-bar-fill');
  const timerContainer = document.getElementById('display-timer');
  const totalTimeMs = 8 * 60 * 1000;

  timerInterval = setInterval(() => {
    let diffMs = timerEndTs - Date.now();
    let diff = Math.floor(diffMs / 1000);

    if (timerBar && timerContainer) {
      let progress = Math.max(0, Math.min(100, (diffMs / totalTimeMs) * 100));
      timerBar.style.width = `${progress}%`;

      if (progress < 15) {
        timerBar.style.background = 'var(--grad-danger)';
        timerContainer.classList.add('warning');
      } else {
        timerBar.style.background = 'var(--grad-primary)';
        timerContainer.classList.remove('warning');
      }
    }

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

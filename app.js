import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, serverTimestamp, setDoc, limitToLast, getDocs, limit, endBefore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDig5IqgBD1vj8godQYd5bzMErESkePCwI",
  authDomain: "jay-and-millie.firebaseapp.com",
  projectId: "jay-and-millie",
  storageBucket: "jay-and-millie.firebasestorage.app",
  messagingSenderId: "458162909286",
  appId: "1:458162909286:web:90814571d8c82e8f93fda7",
  measurementId: "G-0565NWVG2T"
    };
  // ==============================

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const messaging = getMessaging(app);
  let currentUser = null;
  let calDate = new Date();
  let selectedDay = new Date();
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['S','M','T','W','T','F','S'];

  function dateKey(d) { return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
  function fmtTime(ts) {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  }
  function fmtDateShort(ts) {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString([], {month:'short', day:'numeric'});
  }

  window.selectUser = function(user) {
    currentUser = user;
    const pinRow = document.getElementById('pin-row');
    const confirmBtn = document.getElementById('pin-confirm-btn');
    pinRow.classList.add('show');
    confirmBtn.className = 'pin-confirm pin-confirm-' + (user === 'Jay' ? 'j' : 'm');
    document.getElementById('pin-input').focus();
    document.getElementById('pin-error').style.display = 'none';
  };

  window.confirmPin = async function() {
  const entered = document.getElementById('pin-input').value;
  const res = await fetch('/api/verify-pin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: currentUser, pin: entered })
  });
  const data = await res.json();
  if (data.success) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('logged-in-as').textContent = 'signed in as ' + currentUser;
    document.getElementById('typing-as-name').textContent = currentUser;
    const sendBtn = document.getElementById('chat-send-btn');
    sendBtn.className = 'chat-send chat-send-' + (currentUser === 'Jay' ? 'j' : 'm');
    document.getElementById('rem-from-sel').value = currentUser;
    document.getElementById('ev-who-sel').value = currentUser;
    setupNotifications();
    startListeners();
    renderCal();
  } else {
    document.getElementById('pin-error').style.display = 'block';
    document.getElementById('pin-input').value = '';
  }
  async function setupNotifications() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: 'BOU94obBxIxszMHiFOulYexORLu7-aVb8N-V-HqbXLlNJR-cP_nR0U9MkAw-LS0z2Em8DbhfEZrS9UP-DkJda90',
      serviceWorkerRegistration: registration
    });
    if (token) {
      await setDoc(doc(db, 'tokens', currentUser), { token, updatedAt: serverTimestamp() });
    }
  } catch (err) {
    console.error('Notification setup failed:', err);
  }
}
};

  window.logout = function() {
    currentUser = null;
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    document.getElementById('pin-input').value = '';
    document.getElementById('pin-row').classList.remove('show');
  };

  window.switchTab = function(name, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + name).classList.add('active');
    btn.classList.add('active');
    if (name === 'calendar') renderCal();
    if (name === 'game') renderGame();
  };

let oldestDoc = null;
let allMessages = [];
function startListeners() {
  // Messages
const msgsQ = query(collection(db, 'messages'), orderBy('timestamp', 'asc'), limitToLast(50));
onSnapshot(msgsQ, snap => {
  const box = document.getElementById('chat-msgs');
  if (snap.empty) {
    box.innerHTML = '<div class="empty-state">No messages yet. Say something.</div>';
    return;
  }
  if (!oldestDoc) {
    oldestDoc = snap.docs[0];
    document.getElementById('load-older-btn').style.display = 'block';
  }
  allMessages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderMessages(allMessages);
});
};

window.loadOlderMessages = async function() {
  if (!oldestDoc) return;
  const olderQ = query(collection(db, 'messages'), orderBy('timestamp', 'asc'), endBefore(oldestDoc), limitToLast(50));
  const snap = await getDocs(olderQ);
  if (snap.empty) {
    document.getElementById('load-older-btn').style.display = 'none';
    return;
  }
  oldestDoc = snap.docs[0];
  const olderMessages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  allMessages = [...olderMessages, ...allMessages];
  const box = document.getElementById('chat-msgs');
  const prevHeight = box.scrollHeight;
  renderMessages(allMessages);
  box.scrollTop = box.scrollHeight - prevHeight;
  if (snap.docs.length < 50) document.getElementById('load-older-btn').style.display = 'none';
};

function renderMessages(messages) {
  const box = document.getElementById('chat-msgs');
  box.innerHTML = [...messages].reverse().map(m => {
    const isMe = m.from === currentUser;
    const bubbleCls = m.from === 'Jay' ? 'bubble bubble-j' : 'bubble bubble-m';
    const avCls = m.from === 'Jay' ? 'msg-av-sm h-av-j' : 'msg-av-sm h-av-m';
    return `<div class="msg-row ${isMe ? 'me' : ''}">
      <div class="${avCls}">${m.from === 'Jay' ? 'J' : 'M'}</div>
      <div class="msg-content">
        <div class="${bubbleCls}">
          ${m.mediaUrl ? m.mediaType === 'video'
            ? `<video class="media-preview" src="${m.mediaUrl}" controls></video>`
            : `<img class="media-preview" src="${m.mediaUrl}" alt="">`
            : m.text}
        </div>
        <div class="msg-meta">
          ${m.from} &middot; ${fmtTime(m.timestamp)}
          ${isMe ? `<button class="msg-delete" onclick="deleteMessage('${m.id}')" title="Delete message" aria-label="Delete message">&times;</button>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

window.deleteMessage = async function(id) {
  if (!confirm('Delete this message?')) return;
  await deleteDoc(doc(db, 'messages', id));
};


    // Reminders
    const remsQ = query(collection(db, 'reminders'), orderBy('timestamp', 'desc'));
    onSnapshot(remsQ, snap => {
      const list = document.getElementById('rem-list');
      if (snap.empty) {
        list.innerHTML = '<div class="empty-state">No reminders yet.</div>';
        return;
      }
      list.innerHTML = snap.docs.map(d => {
        const r = d.data();
        const iconCls = r.from === 'Jay' ? 'rem-icon rem-j' : 'rem-icon rem-m';
        const avatar = r.from === 'Jay' ? 'J' : 'M';
        return `<div class="rem-card">
          <div class="${iconCls}">${avatar}</div>
          <div class="rem-body">
            <div class="rem-text">${r.text}</div>
            <div class="rem-meta">From ${r.from} &middot; ${fmtDateShort(r.timestamp)}</div>
          </div>
          <button class="rem-del" onclick="deleteReminder('${d.id}')" aria-label="Delete reminder">&times;</button>
        </div>`;
      }).join('');
    });

    // Events
    onSnapshot(collection(db, 'events'), snap => {
      window._events = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderCal();
      renderEvents();
    });

    // Game
    onSnapshot(doc(db, 'game', 'tictactoe'), snap => {
      if (!snap.exists()) {
        setDoc(doc(db, 'game', 'tictactoe'), freshGameState());
        return;
      }
      window._game = snap.data();
      renderGame();
    });
  

  window.sendMessage = async function() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  await addDoc(collection(db, 'messages'), { from: currentUser, text, timestamp: serverTimestamp() });
  const other = currentUser === 'Jay' ? 'Millie' : 'Jay';
  try {
  const res = await fetch('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: other, from: currentUser, message: text })
  });
  if (!res.ok) console.error('Notify failed:', res.status);
} catch (err) {
  console.error('Notify error:', err);
};
};

   window.sendMedia = async function(file) {
  if (!file || !currentUser) return;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'jaykaugi');
  
  const res = await fetch('https://api.cloudinary.com/v1_1/dpw1ypxiv/auto/upload', {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  const mediaType = file.type.startsWith('video') ? 'video' : 'image';
  
  await addDoc(collection(db, 'messages'), {
    from: currentUser,
    text: '',
    mediaUrl: data.secure_url,
    mediaType: mediaType,
    timestamp: serverTimestamp()
  });
};

document.getElementById('media-input').addEventListener('change', (e) => {
  if (e.target.files[0]) sendMedia(e.target.files[0]);
});
  window.addReminder = async function() {
    const text = document.getElementById('rem-input').value.trim();
    const from = document.getElementById('rem-from-sel').value;
    if (!text) return;
    document.getElementById('rem-input').value = '';
    await addDoc(collection(db, 'reminders'), { from, text, timestamp: serverTimestamp() });
  };

  window.deleteReminder = async function(id) {
    await deleteDoc(doc(db, 'reminders', id));
  };

  window.addEvent = async function() {
    const text = document.getElementById('ev-input').value.trim();
    const from = document.getElementById('ev-who-sel').value;
    if (!text) return;
    document.getElementById('ev-input').value = '';
    await addDoc(collection(db, 'events'), { text, from, date: dateKey(selectedDay) });
    renderEvents();
  };

  window.deleteEvent = async function(id) {
    await deleteDoc(doc(db, 'events', id));
  };

  window.changeMonth = function(d) {
    calDate = new Date(calDate.getFullYear(), calDate.getMonth() + d, 1);
    renderCal();
  };

  window.selectDay = function(y, m, d) {
    selectedDay = new Date(y, m, d);
    renderCal();
    renderEvents();
  };

  function renderCal() {
    document.getElementById('cal-label').textContent = MONTHS[calDate.getMonth()] + ' ' + calDate.getFullYear();
    const today = new Date();
    const y = calDate.getFullYear(), mo = calDate.getMonth();
    const first = new Date(y, mo, 1).getDay();
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    const prevDays = new Date(y, mo, 0).getDate();
    const events = window._events || [];

    let html = DAYS.map(d => `<div class="cal-day-name">${d}</div>`).join('');
    for (let i = 0; i < first; i++) {
      html += `<div class="cal-day other-month">${prevDays - first + 1 + i}</div>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const k = y + '-' + (mo + 1) + '-' + d;
      const isToday = today.getFullYear()===y && today.getMonth()===mo && today.getDate()===d;
      const isSel = selectedDay.getFullYear()===y && selectedDay.getMonth()===mo && selectedDay.getDate()===d;
      const hasEv = events.some(e => e.date === k);
      const cls = ['cal-day', isToday?'today':'', isSel?'selected':'', hasEv?'has-event':''].filter(Boolean).join(' ');
      html += `<div class="${cls}" onclick="selectDay(${y},${mo},${d})">${d}</div>`;
    }
    document.getElementById('cal-grid').innerHTML = html;
    renderEvents();
  }
  window.toggleTheme = function() {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  updateThemeButton();
}

function updateThemeButton() {
  const themeBtn = document.getElementById('theme-btn');
  if (!themeBtn) return;
  themeBtn.textContent = document.body.classList.contains('light') ? 'Dark' : 'Light';
}

// Load saved theme on startup.
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  document.body.classList.add('light');
}
updateThemeButton();

  function renderEvents() {
    const events = window._events || [];
    const k = dateKey(selectedDay);
    const label = selectedDay.toLocaleDateString([], {weekday:'long', month:'long', day:'numeric'});
    document.getElementById('cal-events-title').textContent = 'Plans for ' + label;
    const evs = events.filter(e => e.date === k);
    const list = document.getElementById('events-list');
    if (!evs.length) {
      list.innerHTML = '<div class="empty-state compact">Nothing planned yet. Add something.</div>';
      return;
    }
    list.innerHTML = evs.map(e => `<div class="ev-card">
      <div class="ev-dot ${e.from==='Jay'?'ev-dot-j':'ev-dot-m'}"></div>
      <div class="ev-body"><div class="ev-text">${e.text}</div><div class="ev-who">by ${e.from}</div></div>
      <button class="ev-del" onclick="deleteEvent('${e.id}')" aria-label="Delete event">&times;</button>
    </div>`).join('');
  }

  window._events = [];

  // ===== TIC TAC TOE =====
  const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function freshGameState() {
    return { board: Array(9).fill(null), turn: 'Jay', winner: null, winLine: null };
  }

  function findWinner(board) {
    for (const line of WIN_LINES) {
      const [a,b,c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line };
      }
    }
    if (board.every(c => c)) return { winner: 'draw', line: null };
    return null;
  }

  window.playMove = async function(i) {
    const game = window._game;
    if (!game || game.winner) return;
    if (game.board[i]) return;
    if (game.turn !== currentUser) return;
    const board = [...game.board];
    board[i] = currentUser;
    const result = findWinner(board);
    const next = currentUser === 'Jay' ? 'Millie' : 'Jay';
    await setDoc(doc(db, 'game', 'tictactoe'), {
      board,
      turn: result ? game.turn : next,
      winner: result ? result.winner : null,
      winLine: result ? result.line : null
    });
  };

  window.resetGame = async function() {
    await setDoc(doc(db, 'game', 'tictactoe'), freshGameState());
  };

  function renderGame() {
    const game = window._game;
    const grid = document.getElementById('ttt-grid');
    const status = document.getElementById('game-status');
    if (!grid || !status || !game) return;

    grid.innerHTML = game.board.map((val, i) => {
      const isWinCell = game.winLine && game.winLine.includes(i);
      const markCls = val === 'Jay' ? 'cell-j' : val === 'Millie' ? 'cell-m' : '';
      const filledCls = val ? 'filled' : '';
      const disabledCls = (game.winner || (val ? true : false) || game.turn !== currentUser) ? 'disabled' : '';
      const winCls = isWinCell ? 'win-cell' : '';
      const mark = val === 'Jay' ? 'X' : val === 'Millie' ? 'O' : '';
      return `<button class="ttt-cell ${markCls} ${filledCls} ${disabledCls} ${winCls}" onclick="playMove(${i})" ${val || game.winner ? 'disabled' : ''}>${mark}</button>`;
    }).join('');

    if (game.winner === 'draw') {
      status.textContent = "It's a draw!";
    } else if (game.winner) {
      status.textContent = (game.winner === currentUser ? 'You win! 🎉' : game.winner + ' wins! 🎉');
    } else if (game.turn === currentUser) {
      status.textContent = 'Your turn (' + (currentUser === 'Jay' ? 'X' : 'O') + ')';
    } else {
      status.textContent = "Waiting for " + game.turn + "...";
    }
  }

  window._game = null;

  // Enter to send
  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.sendMessage(); }
  });
  document.getElementById('pin-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') window.confirmPin();
  });

// Service worker + install prompt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('install-btn').style.display = 'inline-block';
});

document.getElementById('install-btn').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById('install-btn').style.display = 'none';
});
// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  collection, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQsh2KAXZP_7WfSC_YUJnrUTgL_qKJmdc",  // copy mới nếu khác
  authDomain: "phamngocbach-10a0c.firebaseapp.com",
  projectId: "phamngocbach-10a0c",
  storageBucket: "phamngocbach-10a0c.firebasestorage.app",
  messagingSenderId: "554907446263",
  appId: "1:554907446263:web:839299a8b2b500dc3c9cf2",  // copy mới nếu khác
  measurementId: "G-0H222HXRCN"  // copy mới nếu khác
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elements
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const userEmailDisplay = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const errorMsg = document.getElementById('auth-error');
const scoreForm = document.getElementById('score-form');
const scoresList = document.getElementById('scores-list');

let currentUser = null;

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    userEmailDisplay.textContent = user.email;
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    loadScores();
    errorMsg.textContent = '';
  } else {
    currentUser = null;
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    scoresList.innerHTML = '';
  }
});

// Toggle giữa login và register
showRegisterLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
  showRegisterLink.classList.add('hidden');
  showLoginLink.classList.remove('hidden');
  errorMsg.textContent = '';
});

showLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  showLoginLink.classList.add('hidden');
  showRegisterLink.classList.remove('hidden');
  errorMsg.textContent = '';
});

// Đăng nhập
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.textContent = 'Đang đăng nhập...';
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    errorMsg.textContent = getFriendlyError(err.code);
  }
});

// Đăng ký
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.textContent = 'Đang tạo tài khoản...';
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  if (password.length < 6) {
    errorMsg.textContent = 'Mật khẩu phải ít nhất 6 ký tự!';
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    errorMsg.textContent = getFriendlyError(err.code);
  }
});

// Đăng xuất
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
});

// Helper hiển thị lỗi thân thiện
function getFriendlyError(code) {
  const errors = {
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/user-not-found': 'Tài khoản không tồn tại.',
    'auth/wrong-password': 'Mật khẩu không đúng.',
    'auth/email-already-in-use': 'Email này đã được đăng ký.',
    'auth/weak-password': 'Mật khẩu quá yếu (ít nhất 6 ký tự).',
    'auth/too-many-requests': 'Quá nhiều lần thử, vui lòng chờ một lát.',
  };
  return errors[code] || 'Đã có lỗi xảy ra: ' + code;
}

// ------------------- Quản lý điểm -------------------
scoreForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const subject = document.getElementById('subject').value.trim();
  const score = parseFloat(document.getElementById('score').value);

  if (!subject || isNaN(score) || score < 0 || score > 10) {
    alert('Vui lòng nhập môn học và điểm hợp lệ (0-10)!');
    return;
  }

  try {
    const scoreRef = doc(db, "scores", currentUser.uid, "subjects", subject);
    await setDoc(scoreRef, {
      subject,
      score,
      updatedAt: serverTimestamp()
    });
    scoreForm.reset();
    loadScores();
  } catch (err) {
    alert('Lỗi lưu điểm: ' + err.message);
  }
});

async function loadScores() {
  scoresList.innerHTML = '<p class="text-gray-500 text-center">Đang tải...</p>';
  try {
    const q = query(collection(db, "scores", currentUser.uid, "subjects"), orderBy("subject"));
    const querySnapshot = await getDocs(q);
    scoresList.innerHTML = '';

    if (querySnapshot.empty) {
      scoresList.innerHTML = '<p class="text-gray-500 text-center">Chưa có điểm nào.</p>';
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const div = document.createElement('div');
      div.className = 'flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm';
      div.innerHTML = `
        <div>
          <span class="font-semibold text-lg">${data.subject}</span>
          <span class="ml-6 text-blue-700 font-bold text-xl">${data.score} điểm</span>
        </div>
        <button class="delete-btn text-red-600 hover:text-red-800 font-medium" data-id="${docSnap.id}">Xóa</button>
      `;
      scoresList.appendChild(div);
    });

    // Xử lý xóa
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Xác nhận xóa điểm môn này?')) return;
        try {
          await deleteDoc(doc(db, "scores", currentUser.uid, "subjects", btn.dataset.id));
          loadScores();
        } catch (err) {
          alert('Lỗi xóa: ' + err.message);
        }
      });
    });

  } catch (err) {
    scoresList.innerHTML = `<p class="text-red-600 text-center">Lỗi: ${err.message}</p>`;
  }
}
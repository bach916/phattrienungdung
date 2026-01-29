// fund-script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQsh2KAXZP_7WfSC_YUJnrUTgL_qKJmdc",
  authDomain: "phamngocbach-10a0c.firebaseapp.com",
  projectId: "phamngocbach-10a0c",
  storageBucket: "phamngocbach-10a0c.firebasestorage.app",
  messagingSenderId: "554907446263",
  appId: "1:554907446263:web:839299a8b2b500dc3c9cf2",
  measurementId: "G-0H222HXRCN"
  // Nếu config thay đổi, copy lại từ Firebase Console → Project settings → Your apps
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const userEmailDisplay = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const fundForm = document.getElementById('fund-form');
const fundType = document.getElementById('fund-type');
const fundDesc = document.getElementById('fund-desc');
const fundAmount = document.getElementById('fund-amount');
const fundList = document.getElementById('fund-list');

// Auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    userEmailDisplay.textContent = user.email;
    loadFund();
  } else {
    alert("Vui lòng đăng nhập trước!");
    window.location.href = "index.html"; // Quay về trang điểm thi để login
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// Thêm khoản
fundForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const type = fundType.value;
  const description = fundDesc.value.trim();
  const amountInput = parseFloat(fundAmount.value);

  if (!type || !description || isNaN(amountInput) || amountInput <= 0) {
    alert("Vui lòng điền đầy đủ và số tiền > 0!");
    return;
  }

  const amount = type === 'thu' ? amountInput : -amountInput;

  try {
    await addDoc(collection(db, "class-fund", auth.currentUser.uid, "transactions"), {
      type,
      description,
      amount,
      createdAt: serverTimestamp()
    });
    fundForm.reset();
    loadFund();
  } catch (err) {
    alert("Lỗi thêm khoản: " + err.message);
  }
});

// Load danh sách + tính tổng
async function loadFund() {
  fundList.innerHTML = '<p class="text-center text-gray-500 py-10">Đang tải dữ liệu...</p>';

  try {
    const q = query(collection(db, "class-fund", auth.currentUser.uid, "transactions"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    fundList.innerHTML = '';

    let totalIncome = 0;
    let totalExpense = 0;

    if (snapshot.empty) {
      fundList.innerHTML = '<p class="text-center text-gray-500 py-10">Chưa có giao dịch nào trong quỹ lớp.</p>';
      updateSummary(0, 0);
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const div = document.createElement('div');
      div.className = 'flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition';

      const amountClass = data.amount > 0 ? 'text-green-600' : 'text-red-600';
      const amountSign = data.amount > 0 ? '+' : '';

      div.innerHTML = `
        <div class="mb-3 sm:mb-0">
          <p class="font-semibold text-lg">${data.description}</p>
          <p class="text-sm text-gray-500">${data.type === 'thu' ? 'Thu' : 'Chi'} • ${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString('vi-VN') : 'Không xác định'}</p>
        </div>
        <div class="flex items-center gap-6">
          <span class="text-xl font-bold ${amountClass}">${amountSign}${Math.abs(data.amount).toLocaleString('vi-VN')} ₫</span>
          <button class="delete-btn text-red-600 hover:text-red-800 font-medium" data-id="${docSnap.id}">Xóa</button>
        </div>
      `;
      fundList.appendChild(div);

      if (data.amount > 0) totalIncome += data.amount;
      else totalExpense += Math.abs(data.amount);
    });

    updateSummary(totalIncome, totalExpense);

    // Xử lý xóa
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm("Xác nhận xóa khoản này?")) {
          try {
            await deleteDoc(doc(db, "class-fund", auth.currentUser.uid, "transactions", btn.dataset.id));
            loadFund();
          } catch (err) {
            alert("Lỗi xóa: " + err.message);
          }
        }
      });
    });

  } catch (err) {
    fundList.innerHTML = `<p class="text-red-600 text-center py-10">Lỗi tải dữ liệu: ${err.message}</p>`;
  }
}

function updateSummary(income, expense) {
  const balance = income - expense;
  document.getElementById('total-income').textContent = `${income.toLocaleString('vi-VN')} ₫`;
  document.getElementById('total-expense').textContent = `${expense.toLocaleString('vi-VN')} ₫`;
  const balanceEl = document.getElementById('balance');
  balanceEl.textContent = `${balance.toLocaleString('vi-VN')} ₫`;
  balanceEl.className = balance >= 0 
    ? 'text-4xl font-bold text-blue-700 mt-2' 
    : 'text-4xl font-bold text-red-700 mt-2';
}
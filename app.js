import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQsh2KAXZP_7WfSC_YUJnrUTgL_qKJmdc",
  authDomain: "phamngocbach-10a0c.firebaseapp.com",
  projectId: "phamngocbach-10a0c",
  storageBucket: "phamngocbach-10a0c.firebasestorage.app",
  messagingSenderId: "554907446263",
  appId: "1:554907446263:web:839299a8b2b500dc3c9cf2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const studentsRef = collection(db, "students");

window.addStudent = async function() {
    const name = document.getElementById("name").value;
    const math = Number(document.getElementById("math").value);
    const literature = Number(document.getElementById("literature").value);
    const english = Number(document.getElementById("english").value);

    await addDoc(studentsRef, {
        name, math, literature, english
    });

    loadData();
}

async function loadData() {
    const data = document.getElementById("data");
    data.innerHTML = "";

    const snapshot = await getDocs(studentsRef);
    snapshot.forEach(docSnap => {
        const s = docSnap.data();
        const avg = ((s.math + s.literature + s.english) / 3).toFixed(2);

        data.innerHTML += `
        <tr>
            <td>${s.name}</td>
            <td>${s.math}</td>
            <td>${s.literature}</td>
            <td>${s.english}</td>
            <td>${avg}</td>
            <td><button onclick="deleteStudent('${docSnap.id}')">❌</button></td>
        </tr>`;
    });
}

window.deleteStudent = async function(id){
    await deleteDoc(doc(db,"students",id));
    loadData();
}

loadData();

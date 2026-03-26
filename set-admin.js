const admin = require('firebase-admin');

// Đọc file service account
const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = "g5w5puD0XfgHRtvGkM3saK6xdla2";

admin.auth().setCustomUserClaims(uid, { role: "admin" })
  .then(() => {
    console.log("✅ THÀNH CÔNG!");
    console.log("Tài khoản đã được chuyển thành ADMIN");
    console.log("Email:", "phambachdz2005@gmail.com");
    console.log("UID:", uid);
  })
  .catch(error => {
    console.error("❌ Lỗi:", error.message);
  });
const admin = require('firebase-admin');

admin.initializeApp({
  projectId: "watch-store-8330b"
});

const uid = "g5w5puD0XfgHRtvGkM3saK6xdla2";

admin.auth().setCustomUserClaims(uid, { role: "admin" })
  .then(() => {
    console.log("✅ Thành công! Đã set quyền ADMIN cho tài khoản.");
    console.log("Email:", "phambachdz2005@gmail.com");
    console.log("UID:", uid);
  })
  .catch((error) => {
    console.error("❌ Lỗi:", error.message);
  });
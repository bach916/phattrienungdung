const functions = require("firebase-functions");
const axios = require("axios");
const crypto = require("crypto");

const vnp_TmnCode = "VGHXP2UC";           // Thay bằng code của bạn
const vnp_HashSecret = "R2H8GHH6S0JUYZRXMUU4011NXUYKJP9Z";     // Thay bằng HashSecret của bạn
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "https://watch-store-8330b.web.app/payment-success.html"; // Trang trả về sau thanh toán

exports.createPaymentUrl = functions.https.onCall(async (data, context) => {
  const { amount, orderId, orderInfo } = data;

  const date = new Date();
  const vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "billpayment",
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: vnp_ReturnUrl,
    vnp_IpAddr: "127.0.0.1",
    vnp_CreateDate: date.getFullYear() + 
      ("0" + (date.getMonth() + 1)).slice(-2) + 
      ("0" + date.getDate()).slice(-2) + 
      ("0" + date.getHours()).slice(-2) + 
      ("0" + date.getMinutes()).slice(-2) + 
      ("0" + date.getSeconds()).slice(-2)
  };

  // Tạo chữ ký
  const sortedParams = Object.keys(vnp_Params).sort().reduce((acc, key) => {
    acc[key] = vnp_Params[key];
    return acc;
  }, {});

  const signData = Object.keys(sortedParams).map(key => `${key}=${sortedParams[key]}`).join('&');
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(signData).digest("hex");

  vnp_Params.vnp_SecureHash = signed;

  const paymentUrl = vnp_Url + "?" + Object.keys(vnp_Params)
    .map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`)
    .join('&');

  return { paymentUrl };
});
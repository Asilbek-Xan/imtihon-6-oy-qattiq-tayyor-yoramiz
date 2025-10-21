import { showToast } from "./toast.js";

export function checkAuth() {
  const token = localStorage.getItem("token");

  // ❌ Token yo‘q bo‘lsa
  if (!token) {
    showToast("⚠️ Token mavjud emas! Iltimos, qayta tizimga kiring.");
    setTimeout(() => location.href = "/pages/login.html", 1000);
    return false;
  }

  // ✅ Token JWT bo‘lsa – muddatini tekshiramiz
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      showToast("⏳ Token muddati tugagan! Qayta tizimga kiring.");
      localStorage.removeItem("token");
      setTimeout(() => location.href = "/pages/login.html", 1000);
      return false;
    }
  } catch (error) {
    showToast("❌ Token noto‘g‘ri! Qayta tizimga kiring.");
    localStorage.removeItem("token");
    setTimeout(() => location.href = "/pages/login.html", 1000);
    return false;
  }

  return true; // ✅ Hammasi yaxshi bo‘lsa
}

import { showToast } from "./toast.js";

export function checkAuth() {
  const token = localStorage.getItem("token");

  // ❌ Token yo'q bo'lsa
  if (!token) {
    showToast("⚠️ Token mavjud emas! Iltimos, qayta tizimga kiring.");
    setTimeout(() => {
      // LocalStorage ni tozalash
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Login sahifasiga yo'naltirish
      location.href = "/pages/login.html";
    }, 1500);
    return false;
  }

  // ✅ Token JWT bo'lsa - muddatini tekshiramiz
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      showToast("⏳ Token muddati tugagan! Qayta tizimga kiring.");
      // Token muddati tugagan bo'lsa, tozalash
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setTimeout(() => {
        location.href = "/pages/login.html";
      }, 1500);
      return false;
    }

    // ✅ Token hali ham yaroqli
    return true;

  } catch (error) {
    // ❌ Token noto'g'ri formatda
    showToast("❌ Token noto'g'ri! Qayta tizimga kiring.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setTimeout(() => {
      location.href = "/pages/login.html";
    }, 1500);
    return false;
  }
}

// Qo'shimcha: Foydalanuvchi ma'lumotlarini olish
export function getUserInfo() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      exp: payload.exp
    };
  } catch (error) {
    return null;
  }
}

// Qo'shimcha: Role based access control
export function hasRole(requiredRole) {
  if (!checkAuth()) return false;

  const userInfo = getUserInfo();
  if (!userInfo || !userInfo.role) return false;

  return userInfo.role === requiredRole || userInfo.role === 'admin';
}

// Qo'shimcha: Logout funksiyasi
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showToast("👋 Tizimdan chiqildi");
  setTimeout(() => {
    location.href = "/pages/login.html";
  }, 1000);
}

// Qo'shimcha: Token yangilash (agar kerak bo'lsa)
export function refreshToken() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const timeUntilExpiry = payload.exp * 1000 - Date.now();

    // Agar token 5 daqiqadan kam qolgan bo'lsa, yangilash
    if (timeUntilExpiry < 5 * 60 * 1000) {
      // Bu yerda yangi token so'rash logikasi
      // Masalan: refresh token API ga so'rov
      showToast("🔄 Token yangilanmoqda...");
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

// Qo'shimcha: Auth holatini tekshirish va kerak bo'lsa yangilash
export function checkAndRefreshAuth() {
  if (!checkAuth()) {
    return false;
  }

  // Token yangilash kerak bo'lsa
  refreshToken();
  return true;
}
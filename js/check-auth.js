import { showToast } from "./toast.js";

export function checkAuth() {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast("⚠️ Token mavjud emas! Iltimos, qayta tizimga kiring.");
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      location.href = "/pages/login.html";
    }, 1500);
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      showToast("⏳ Token muddati tugagan! Qayta tizimga kiring.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setTimeout(() => {
        location.href = "/pages/login.html";
      }, 1500);
      return false;
    }

    return true;

  } catch (error) {
    showToast("❌ Token noto'g'ri! Qayta tizimga kiring.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setTimeout(() => {
      location.href = "/pages/login.html";
    }, 1500);
    return false;
  }
}

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

export function hasRole(requiredRole) {
  if (!checkAuth()) return false;

  const userInfo = getUserInfo();
  if (!userInfo || !userInfo.role) return false;

  return userInfo.role === requiredRole || userInfo.role === 'admin';
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showToast("👋 Tizimdan chiqildi");
  setTimeout(() => {
    location.href = "/pages/login.html";
  }, 1000);
}

export function refreshToken() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const timeUntilExpiry = payload.exp * 1000 - Date.now();

    if (timeUntilExpiry < 5 * 60 * 1000) {
      showToast("🔄 Token yangilanmoqda...");
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

export function checkAndRefreshAuth() {
  if (!checkAuth()) {
    return false;
  }

  refreshToken();
  return true;
}
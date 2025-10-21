import { showToast } from "/js/toast.js";

const elForm = document.getElementById("form");

async function register(user) {
  const req = await fetch("https://json-api.uz/api/project/fn44/auth/register", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!req.ok) {
    if (req.status === 400) {
      throw new Error("Bunday foydalanuvchi allaqachon mavjud");
    } else if (req.status === 405) {
      throw new Error("Uzur, serverni APIga ulash kerak");
    } else {
      throw new Error("Ro'yxatdan o'tishda xatolik, qayta urunib ko'ring");
    }
  }

  return await req.json();
}

// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    if (savedTheme === 'dark') {
        html.classList.add('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }

    themeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');

        if (html.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            localStorage.setItem('theme', 'light');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    });
});

elForm.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const formData = new FormData(elForm);
    const username = formData.get('username')?.trim() || "";
    const email = formData.get('email')?.trim() || "";
    const password = formData.get('password')?.trim() || "";
    const confirmPassword = formData.get('confirmPassword')?.trim() || "";

    // Validatsiya
    if (!username) {
        showToast("Foydalanuvchi nomini kiriting!");
        return;
    } else if (!email) {
        showToast("Elektron pochtani kiriting!");
        return;
    } else if (!password) {
        showToast("Parolni kiriting!");
        return;
    } else if (password.length < 4) {
        showToast("Parol kamida 4 ta belgidan iborat bo'lishi kerak!");
        return;
    } else if (password !== confirmPassword) {
        showToast("Parollar mos kelmadi!");
        return;
    }

    showToast("⏳ Ro'yxatdan o'tilmoqda...");

    try {
        const res = await register({ username, email, password });
        localStorage.setItem("token", res.access_token);
        showToast("✅ Muvaffaqiyatli ro'yxatdan o'tdingiz!");
        setTimeout(() => window.location.href = "../../index.html", 1500);
    } catch (error) {
        showToast(`❌ ${error.message}`);
    }
});
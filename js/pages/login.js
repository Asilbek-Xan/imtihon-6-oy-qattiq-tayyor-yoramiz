import { showToast } from "/js/toast.js";

const elForm = document.getElementById("form");

async function login(user) {
  const req = await fetch("https://json-api.uz/api/project/fn44/auth/login", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!req.ok) {
    // Barcha xatolik holatlarida bir xil xabar
    throw new Error("Parol yoki username noto'g'ri, qayta urunib ko'ring");
  }

  return await req.json();
}

elForm.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const formData = new FormData(elForm);
    const username = formData.get('username')?.trim() || "";
    const password = formData.get('password')?.trim() || "";

    // Validatsiya
    if (!username) {
        showToast("Ismingizni kiriting!");
        return;
    } else if (!password) {
        showToast("Parolni kiriting!");
        return;
    } else if (password.length < 4) {
        showToast("Parol kamida 4 ta belgidan iborat bo'lishi kerak!");
        return;
    }

    showToast("⏳ Tekshirilmoqda...");

    try {
        const res = await login({ username, password });
        localStorage.setItem("token", res.access_token);
        showToast("✅ Muvaffaqiyatli kirish!");
        setTimeout(() => window.location.href = "../../index.html", 1000);
    } catch (error) {
        showToast(`❌ ${error.message}`);
    }
}); 
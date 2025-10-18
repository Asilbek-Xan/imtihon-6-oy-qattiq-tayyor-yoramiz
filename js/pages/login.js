import { showToast } from "/js/toast.js";

const elForm = document.getElementById("form");
const elUsernameInput = document.getElementById("username");
const elPasswordInput = document.getElementById("password");


async function login(user) {
  try {
    const req = await fetch("https://json-api.uz/api/project/fn44/auth/login", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(user),
    });
    const res = await req.json();
    return res;
  } catch {
    throw new Error("Ro'yxatdan o'tishda xatolik bo'ldi!");
  }
}



elForm.addEventListener("submit", (evt) => {
    evt.preventDefault();

    const formData = new FormData(elForm);
    const result = {};

    formData.forEach((value, key) => {
        result[key] = value.trim();
    });

    const username = result.username || "";
    const password = result.password || "";

    if (username === "") {
        showToast("Ismingizni kiriting!");
    } else if (password === "") {
        showToast("Parolni kiriting!");
    } else if (password.length < 3) {
        showToast("Parol kamida 4 ta belgidan iborat bo‘lishi kerak!");
    } else {
        showToast("Barcha ma'lumot to'liq bo'ldi, kuting!");
    }

    login(result)
    .then((res) => {
        localStorage.setItem("token", res.access_token);
        window.location.href = "../../index.html"
    })
    .catch(() => {})
    .finally(() => {})
});

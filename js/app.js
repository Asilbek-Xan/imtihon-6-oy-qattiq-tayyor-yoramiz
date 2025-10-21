// js/app.js - Asosiy ilova logikasi

import { checkAuth } from "./check-auth.js";
import { deleteElementLocal, editElementLocal } from "./crud.js";
import { changeLocalData, localData } from "./local-data.js";
import { getAll, deleteElement, editElement as editElementServer } from "./request.js";
import { showToast } from "./toast.js";
import { pagination, ui } from "./ui.js";

// Dark Mode funktsiyalari
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');

  const savedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }

  themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
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
}

// Animatsiyalar qo'shish
function initAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
}

// Skeleton loader yaratish
function createSkeletonLoader() {
  const skeletonLoader = document.getElementById('skeletonLoader');
  const skeletonCount = 12; // 3x4 grid uchun

  for (let i = 0; i < skeletonCount; i++) {
    const skeletonCard = document.createElement('div');
    skeletonCard.className = 'card bg-base-100 dark:bg-gray-800 shadow-sm animate-pulse';
    skeletonCard.innerHTML = `
      <div class="card-body">
        <div class="skeleton h-6 w-3/4 mb-4"></div>
        <div class="skeleton h-4 w-full mb-2"></div>
        <div class="skeleton h-4 w-5/6 mb-2"></div>
        <div class="skeleton h-4 w-2/3"></div>
        <div class="flex justify-end mt-4 gap-2">
          <div class="skeleton h-8 w-16 rounded-lg"></div>
          <div class="skeleton h-8 w-16 rounded-lg"></div>
          <div class="skeleton h-8 w-16 rounded-lg"></div>
        </div>
      </div>
    `;
    skeletonLoader.appendChild(skeletonCard);
  }
}

// Asosiy konfiguratsiya
const limit = 12;
let skip = 0;

// DOM elementlari
const elEditModal = document.getElementById("editModal");
const elOfflinePage = document.getElementById("offlinePage");
const elFilterTypeSelect = document.getElementById("filterTypeSelect");
const elFilterValueSelect = document.getElementById("filterValueSelect");
const elSearchInput = document.getElementById("searchInput");
const elLoader = document.getElementById("loader");
const elContainer = document.getElementById("container");
const elSkeletonLoader = document.getElementById("skeletonLoader");
const elEditForm = document.getElementById("editForm");
const elPagination = document.getElementById("pagination");
const elClearBtn = document.getElementById("clearBtn");
const elError = document.getElementById("error");

let backendData = null;
let worker = new Worker("./worker.js");
let filterKey = null;
let filterValue = null;
let editedElementId = null;

const offlineSound = new Audio("./sounds/offline.mp3");
const onlineSound = new Audio("./sounds/online.mp3");
const leftSound = new Audio("./sounds/left-click.mp3");
const rightSound = new Audio("./sounds/right-click.mp3");
const typing = new Audio("./sounds/type.mp3");

// Debounce funktsiyasi
function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// No data xabarini boshqarish
function toggleNoDataMessage(data) {
  let elNoData = document.getElementById("noData");
  if (!elNoData) {
    elNoData = document.createElement("h2");
    elNoData.id = "noData";
    elNoData.textContent = "Mashinalar topilmadi 😕";
    elNoData.className = "text-center text-xl text-gray-500 mt-10";
    document.body.appendChild(elNoData);
  }
  if (data && data.length > 0) {
    elNoData.classList.add("hidden");
    elContainer.classList.remove("hidden");
    elPagination.classList.remove("hidden");
  } else {
    elNoData.classList.remove("hidden");
    elContainer.classList.add("hidden");
    elPagination.classList.add("hidden");
  }
}

// Ma'lumotlarni yuklash
function loadData({ limitParam = limit, skipParam = skip, key = null, value = null } = {}) {
  elLoader.classList.remove("hidden");
  let url = `?limit=${limitParam}&skip=${skipParam}`;
  if (key && value) url = `?${key}=${encodeURIComponent(value)}&limit=${limitParam}&skip=${skipParam}`;

  getAll(url)
    .then((res) => {
      if (!res || !res.data) return showToast("❌ Serverdan to'g'ri javob kelmadi");
      backendData = res;
      changeLocalData(res.data);
      ui(res.data);
      pagination(res.total, res.limit, res.skip);
      toggleNoDataMessage(res.data);
    })
    .catch((err) => showToast(err?.message || "❌ Ma'lumotni yuklashda xatolik yuz berdi"))
    .finally(() => {
      elSkeletonLoader.classList.add("hidden");
      elLoader.classList.add("hidden");
    });
}

// Delete modalni yopish
function closeDeleteModal() {
  document.getElementById('deleteModal').close();
}

// Asosiy ilova ishga tushirish
function initApp() {
  // Dark mode va animatsiyalarni ishga tushirish
  initTheme();
  initAnimations();
  createSkeletonLoader();

  // Auth tekshirish
  if (!checkAuth()) {
    location.href = "/pages/login.html";
    return;
  }

  // Dastlabki yuklash
  elSkeletonLoader.classList.remove("hidden");

  if (!navigator.onLine) {
    elOfflinePage.classList.remove("hidden");
    showToast("⚠️ Internet yo'q — offline rejimda ishlayapsiz");
  }

  loadData();
  elClearBtn?.classList.add("hidden");
}

// Worker xabarlarini qayta ishlash
worker.addEventListener("message", (evt) => {
  const response = evt.data;
  elLoader.classList.add("hidden");

  if (response.target === "filterByType") {
    elFilterValueSelect.innerHTML = "";
    elFilterValueSelect.classList.remove("hidden");

    const option = document.createElement("option");
    option.textContent = "All";
    option.disabled = true;
    option.selected = true;
    elFilterValueSelect.appendChild(option);

    response.result.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item;
      opt.textContent = item;
      elFilterValueSelect.appendChild(opt);
    });

    showToast("✅ Filter qiymatlari tayyor");
  }

  if (response.target === "search") {
    if (!response.result || response.result.length === 0) {
      elContainer.innerHTML = "";
      toggleNoDataMessage([]);
      showToast("⚠️ Hech narsa topilmadi");
    } else {
      ui(response.result);
      toggleNoDataMessage(response.result);
      showToast(`✅ ${response.result.length} ta natija topildi`);
    }
  }
});

// Event listenerlar
elFilterTypeSelect.addEventListener("change", (evt) => {
  filterKey = evt.target.value || null;
  if (!backendData) return showToast("❌ Server ma'lumotlari yuklanmagan");
  elClearBtn?.classList.remove("hidden");
  elLoader.classList.remove("hidden");
  worker.postMessage({ functionName: "filterByType", params: [backendData.data, filterKey] });
});

elFilterValueSelect.addEventListener("change", (evt) => {
  filterValue = evt.target.value || null;
  skip = 0;
  if (!filterKey || !filterValue) return showToast("❗ Filter tanlangandan keyin qiymatni tanlang");
  loadData({ limitParam: limit, skipParam: skip, key: filterKey, value: filterValue });
  showToast(`🔎 Filtr qo'llandi: ${filterKey} = ${filterValue}`);
});

const liveSearch = debounce((value) => {
  if (!backendData) return;
  if (!value) {
    ui(backendData.data);
    toggleNoDataMessage(backendData.data);
    showToast("🔄 Qidiruv tozalandi");
    return;
  }
  elLoader.classList.remove("hidden");
  worker.postMessage({ functionName: "search", params: [backendData.data, value] });
}, 300);

elSearchInput.addEventListener("input", (evt) => {
  const value = evt.target.value.trim();
  liveSearch(value);
  if (elClearBtn) {
    if (value.length > 0) elClearBtn.classList.remove("hidden");
    else if (!filterKey && !filterValue) elClearBtn.classList.add("hidden");
  }
});

elClearBtn?.addEventListener("click", () => {
  filterKey = null;
  filterValue = null;
  skip = 0;
  elFilterTypeSelect.value = "";
  elFilterValueSelect.innerHTML = `<option disabled selected>Nimasidan topish kerak?</option>`;
  elFilterValueSelect.classList.add("hidden");
  elSearchInput.value = "";
  elClearBtn.classList.add("hidden");
  loadData();
  showToast("🔁 Filterlar va qidiruv tozalandi");
});

elContainer.addEventListener("click", (evt) => {
  const btn = evt.target.closest("button, a");
  if (!btn) return;

  if (btn.classList.contains("js-edit")) {
    if (!checkAuth()) return (location.href = "/pages/login.html");
    editedElementId = btn.id;
    const found = localData.find((el) => el.id == editedElementId);
    if (!found) return showToast("❌ Element topilmadi");
    elEditModal.showModal();
    elEditForm.name.value = found.name || "";
    elEditForm.description.value = found.description || "";
  }

  if (btn.classList.contains("js-delete")) {
    if (!checkAuth()) return (location.href = "/pages/login.html");
    const id = btn.id;
    document.getElementById('deleteModal').showModal();

    // Delete tasdiqlash
    document.getElementById('confirmDeleteBtn').onclick = () => {
      elLoader.classList.remove("hidden");
      deleteElement(id)
        .then((deletedId) => {
          deleteElementLocal(deletedId);
          showToast("✅ Ma'lumot o'chirildi");
          loadData({ limitParam: limit, skipParam: skip, key: filterKey, value: filterValue });
          closeDeleteModal();
        })
        .catch((err) => showToast(err?.message || "❌ O'chirishda xatolik"))
        .finally(() => elLoader.classList.add("hidden"));
    };
  }

  if (btn.classList.contains("js-info")) {
    const id = btn.id || btn.getAttribute("data-id");
    if (!id) return showToast("❗ Element ID mavjud emas");
    location.href = `/pages/details.html?id=${id}`;
  }
});

elEditForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  if (!editedElementId) return showToast("❗ Element tanlanmagan");
  const formData = new FormData(elEditForm);
  const payload = {};
  formData.forEach((v, k) => (payload[k] = v.trim()));
  payload.id = editedElementId;
  elLoader.classList.remove("hidden");
  editElementServer(payload)
    .then((res) => {
      editElementLocal(res);
      showToast("✅ Ma'lumot yangilandi");
      loadData({ limitParam: limit, skipParam: skip, key: filterKey, value: filterValue });
    })
    .catch((err) => showToast(err?.message || "❌ Tahrirlashda xatolik"))
    .finally(() => {
      elLoader.classList.add("hidden");
      editedElementId = null;
      try { elEditModal.close(); } catch {}
    });
});

elPagination.addEventListener("click", (evt) => {
  const target = evt.target;
  if (!target.classList.contains("js-page")) return;
  let newSkip = Number(target.dataset.skip) || 0;
  if (!backendData || !backendData.total) return showToast("❌ Pagination uchun ma'lumot yo'q");
  const totalPages = Math.ceil(backendData.total / limit);
  const pageIndex = Math.floor(newSkip / limit);
  if (pageIndex < 0) newSkip = 0;
  if (pageIndex >= totalPages) newSkip = (totalPages - 1) * limit;
  skip = newSkip;
  loadData({ limitParam: limit, skipParam: skip, key: filterKey, value: filterValue });
  showToast(`📄 ${pageIndex + 1} - sahifa yuklanmoqda`);
});

// Network holatini kuzatish
window.addEventListener("online", () => {
  elOfflinePage.classList.add("hidden");
  onlineSound.play();
  showToast("✅ Internet tiklandi");
});

window.addEventListener("offline", () => {
  elOfflinePage.classList.remove("hidden");
  offlineSound.play();
  showToast("⚠️ Internet uzildi — offline rejim");
});

// Audio effektlar
document.addEventListener("mousedown", (event) => {
  if (event.button === 0) {
    leftSound.currentTime = 0;
    leftSound.play();
  } else if (event.button === 2) {
    rightSound.currentTime = 0;
    rightSound.play();
  }
});

document.addEventListener("contextmenu", (e) => e.preventDefault());

// Ilovani ishga tushirish
window.addEventListener("DOMContentLoaded", initApp);








const input = document.getElementById('textInput');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let wasEmpty = true;

function playBeep(duration = 0.12, frequency = 880, volume = 0.1) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  setTimeout(() => {
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
    setTimeout(() => oscillator.stop(), 60);
  }, duration * 1000);
}

// Inputga matn yozilganda
input.addEventListener('input', () => {
  const isEmpty = input.value.trim().length === 0;
  if (wasEmpty && !isEmpty) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => playBeep());
    } else {
      playBeep();
    }
  }
  wasEmpty = isEmpty;
});








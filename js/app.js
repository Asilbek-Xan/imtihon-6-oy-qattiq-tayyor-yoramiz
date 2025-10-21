import { checkAuth } from "./check-auth.js";
import { deleteElementLocal, editElementLocal } from "./crud.js";
import { changeLocalData, localData } from "./local-data.js";
import { getAll, deleteElement, editElement as editElementServer } from "./request.js";
import { showToast } from "./toast.js";
import { pagination, ui } from "./ui.js";

const limit = 12;
let skip = 0;

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

function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

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

function loadData({ limitParam = limit, skipParam = skip, key = null, value = null } = {}) {
  elLoader.classList.remove("hidden");
  let url = `?limit=${limitParam}&skip=${skipParam}`;
  if (key && value) url = `?${key}=${encodeURIComponent(value)}&limit=${limitParam}&skip=${skipParam}`;

  getAll(url)
    .then((res) => {
      if (!res || !res.data) return showToast("❌ Serverdan to‘g‘ri javob kelmadi");
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

window.addEventListener("DOMContentLoaded", () => {
  elSkeletonLoader.classList.remove("hidden");
  if (!navigator.onLine) {
    elOfflinePage.classList.remove("hidden");
    showToast("⚠️ Internet yo‘q — offline rejimda ishlayapsiz");
  }
  loadData();
  elClearBtn?.classList.add("hidden");
});

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
  showToast(`🔎 Filtr qo‘llandi: ${filterKey} = ${filterValue}`);
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
    if (!confirm("Rostdan o‘chirmoqchimisiz?")) return;
    elLoader.classList.remove("hidden");
    deleteElement(id)
      .then((deletedId) => {
        deleteElementLocal(deletedId);
        showToast("✅ Ma'lumot o‘chirildi");
        loadData({ limitParam: limit, skipParam: skip, key: filterKey, value: filterValue });
      })
      .catch((err) => showToast(err?.message || "❌ O‘chirishda xatolik"))
      .finally(() => elLoader.classList.add("hidden"));
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

elFilterValueSelect.addEventListener("input", (evt) => {
  filterValue = evt.target.value || null;
  if (filterKey && filterValue) elClearBtn?.classList.remove("hidden");
});



window.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth()) return;
if (!checkAuth()) return (location.href = "/pages/login.html");


  elSkeletonLoader.classList.remove("hidden");

  if (!navigator.onLine) {
    elOfflinePage.classList.remove("hidden");
    showToast("⚠️ Internet yo‘q — offline rejimda ishlayapsiz");
  }

  loadData();
  elClearBtn?.classList.add("hidden");
});
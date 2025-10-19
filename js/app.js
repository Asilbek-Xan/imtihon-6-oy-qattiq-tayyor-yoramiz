import { checkAuth } from "./check-auth.js";
import { deleteElementLocal, editElementLocal } from "./crud.js";
import { changeLocalData, localData } from "./local-data.js";
import { getAll, deleteElement, editElement as editElementServer } from "./request.js";
import { showToast } from "./toast.js";
import { pagination, ui } from "./ui.js";

const limit = 12;
let skip = 0;

// Elements
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

let backendData = null;
let worker = new Worker("./worker.js");
let filterKey = null;
let filterValue = null;
let editedElementId = null;

// Sounds
const offlineSound = new Audio("./sounds/offline.mp3");
const onlineSound = new Audio("./sounds/online.mp3");
const leftSound = new Audio("./sounds/left-click.mp3");
const rightSound = new Audio("./sounds/right-click.mp3");

// Debounce helper
function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// ------- Helper: load page data with optional query --------
function loadData({ limitParam = limit, skipParam = skip, key = null, value = null } = {}) {
  elLoader.classList.remove("hidden");
  let url = `?limit=${limitParam}&skip=${skipParam}`;
  if (key && value) url = `?${key}=${encodeURIComponent(value)}&limit=${limitParam}&skip=${skipParam}`;

  getAll(url)
    .then((res) => {
      if (!res || !res.data) {
        showToast("❌ Serverdan to‘g‘ri javob kelmadi");
        return;
      }
      backendData = res;
      changeLocalData(res.data);
      ui(res.data);
      pagination(res.total, res.limit, res.skip);
    })
    .catch((err) => {
      // Use showToast for user-visible error
      showToast(err?.message || "❌ Ma'lumotni yuklashda xatolik yuz berdi");
    })
    .finally(() => {
      elSkeletonLoader.classList.add("hidden");
      elLoader.classList.add("hidden");
    });
}

// ------- Initial load on DOMContentLoaded -------
window.addEventListener("DOMContentLoaded", () => {
  elSkeletonLoader.classList.remove("hidden");
  if (!navigator.onLine) {
    elOfflinePage.classList.remove("hidden");
    showToast("⚠️ Internet yo‘q — offline rejimda ishlayapsiz");
  }

  // initial load
  loadData();

  // hide clear btn by default
  if (elClearBtn) elClearBtn.classList.add("hidden");
});

// ------- Worker message handling (filter values + search) -------
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
    elLoader.classList.add("hidden");
    if (!response.result || response.result.length === 0) {
      elContainer.innerHTML = "";
      showToast("⚠️ Hech narsa topilmadi");
    } else {
      ui(response.result);
      showToast(`✅ ${response.result.length} ta natija topildi`);
    }
  }
});

// ------- Filter type select -------
elFilterTypeSelect.addEventListener("change", (evt) => {
  filterKey = evt.target.value || null;
  if (!backendData) {
    showToast("❌ Server ma'lumotlari yuklanmagan");
    return;
  }

  // show clear button
  if (elClearBtn) elClearBtn.classList.remove("hidden");

  elLoader.classList.remove("hidden");
  worker.postMessage({
    functionName: "filterByType",
    params: [backendData.data, filterKey],
  });
});

// ------- Filter value select -------
elFilterValueSelect.addEventListener("change", (evt) => {
  filterValue = evt.target.value || null;
  skip = 0;
  if (!filterKey || !filterValue) {
    showToast("❗ Filter tanlangandan keyin qiymatni tanlang");
    return;
  }

  // load with filter
  loadData({ limitParam: limit, skipParam: skip, key: filterKey, value: filterValue });
  showToast(`🔎 Filtr qo‘llandi: ${filterKey} = ${filterValue}`);
});

// ------- Search (live, debounced) -------
const liveSearch = debounce((value) => {
  if (!backendData) return;
  if (!value) {
    ui(backendData.data);
    showToast("🔄 Qidiruv tozalandi");
    return;
  }

  elLoader.classList.remove("hidden");
  worker.postMessage({
    functionName: "search",
    params: [backendData.data, value],
  });
}, 300);

elSearchInput.addEventListener("input", (evt) => {
  const value = evt.target.value.trim();
  liveSearch(value);

  // show clear button when typing
  if (elClearBtn) {
    if (value.length > 0) elClearBtn.classList.remove("hidden");
    else if (!filterKey && !filterValue) elClearBtn.classList.add("hidden");
  }
});

// ------- Clear filters/search -------
if (elClearBtn) {
  elClearBtn.addEventListener("click", () => {
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
}

// ------- CRUD click handling on cards (delegation) -------
elContainer.addEventListener("click", (evt) => {
  const target = evt.target;

  // If clicking inside button's svg, find the button parent with class
  const btn = target.closest("button, a");
  if (!btn) return;

  // Edit button
  if (btn.classList.contains("js-edit")) {
    if (!checkAuth()) {
      showToast("⚠️ Tahrirlash uchun avval kirish qiling");
      return (location.href = "/pages/login.html");
    }

    editedElementId = btn.id;
    const foundElement = localData.find((el) => el.id == editedElementId);
    if (!foundElement) {
      showToast("❌ Tahrirlash uchun element topilmadi");
      return;
    }
    // open modal and fill
    elEditModal.showModal();
    elEditForm.name.value = foundElement.name || "";
    elEditForm.description.value = foundElement.description || "";
  }

  // Delete button
  if (btn.classList.contains("js-delete")) {
    if (!checkAuth()) {
      showToast("⚠️ O'chirish uchun avval kirish qiling");
      return (location.href = "/pages/login.html");
    }

    const id = btn.id;
    if (!confirm("Rostdan o‘chirmoqchimisiz?")) return;

    elLoader.classList.remove("hidden");
    deleteElement(id)
      .then((deletedId) => {
        deleteElementLocal(deletedId);
        showToast("✅ Ma'lumot muvaffaqiyatli o‘chirildi");
        // reload current page
        loadData({ limitParam: limit, skipParam: skip, key: filterKey, value: filterValue });
      })
      .catch((err) => {
        showToast(err?.message || "❌ O'chirishda xatolik yuz berdi");
      })
      .finally(() => {
        elLoader.classList.add("hidden");
      });
  }

  // Info (details)
  if (btn.classList.contains("js-info")) {
    const id = btn.id || btn.getAttribute("data-id");
    if (element.id) {
      showToast("❗ Element ID mavjud emas");
      return;
    }
    location.href = `/pages/details.html?id=${id}`;
  }
});

// ------- Edit form submit -------
elEditForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  if (!editedElementId) {
    showToast("❗ Tahrirlash uchun element tanlanmagan");
    return;
  }

  const formData = new FormData(elEditForm);
  const payload = {};
  formData.forEach((v, k) => (payload[k] = v.trim()));
  payload.id = editedElementId;

  elLoader.classList.remove("hidden");
  editElementServer(payload)
    .then((res) => {
      editElementLocal(res);
      showToast("✅ Ma'lumot muvaffaqiyatli yangilandi");
      loadData({ limitParam: limit, skipParam: skip, key: filterKey, value: filterValue });
    })
    .catch((err) => {
      showToast(err?.message || "❌ Tahrirlashda xatolik");
    })
    .finally(() => {
      elLoader.classList.add("hidden");
      editedElementId = null;
      try { elEditModal.close(); } catch (e) {}
    });
});

// ------- Pagination click -------
elPagination.addEventListener("click", (evt) => {
  const target = evt.target;
  if (!target.classList.contains("js-page")) return;

  let newSkip = Number(target.dataset.skip) || 0;
  if (!backendData || !backendData.total) {
    showToast("❌ Pagination uchun ma'lumot yo'q");
    return;
  }

  const totalPages = Math.ceil(backendData.total / limit);
  const pageIndex = Math.floor(newSkip / limit);

  if (pageIndex < 0) newSkip = 0;
  if (pageIndex >= totalPages) newSkip = (totalPages - 1) * limit;

  skip = newSkip;
  loadData({ limitParam: limit, skipParam: skip, key: filterKey, value: filterValue });
  showToast(`📄 ${pageIndex + 1} - sahifa yuklanmoqda`);
});

// ------- Online / Offline -------
window.addEventListener("online", () => {
  elOfflinePage.classList.add("hidden");
  onlineSound.play();
  showToast("✅ Internet ulanish tiklandi");
});
window.addEventListener("offline", () => {
  elOfflinePage.classList.remove("hidden");
  offlineSound.play();
  showToast("⚠️ Internet uzildi — offline rejim");
});

// ------- Mouse click sounds -------
document.addEventListener("mousedown", (event) => {
  if (event.button === 0) {
    leftSound.currentTime = 0;
    leftSound.play();
  } else if (event.button === 2) {
    rightSound.currentTime = 0;
    rightSound.play();
  }
});
document.addEventListener("contextmenu", (event) => {
  // prevent default context menu if you want right-click sound only
  event.preventDefault();
});

// ------- Extra: ensure filterValue tracked when user picks value (defensive) -------
elFilterValueSelect.addEventListener("input", (evt) => {
  filterValue = evt.target.value || null;
  if (filterKey && filterValue) {
    elClearBtn?.classList.remove("hidden");
  }
});


// ------- End of file -------




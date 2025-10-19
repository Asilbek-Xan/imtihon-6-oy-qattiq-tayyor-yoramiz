import { checkAuth } from "./check-auth.js";
import { deleteElementLocal, editElementLocal } from "./crud.js";
import { changeLocalData, localData } from "./local-data.js";
import { getAll, deleteElement, editElement as editElementServer } from "./request.js";
import { showToast } from "./toast.js";
import { pagination, ui } from "./ui.js";

// Elementlar

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
const elError = document.getElementById("error");
const elEditForm = document.getElementById("editForm");

// O‘zgaruvchilar
let backendData = null;
let worker = new Worker("./worker.js");
let filterKey = null;
let filterValue = null;
let editedElementId = null;

// Ovozlar
const offlineSound = new Audio("./sounds/offline.mp3");
const onlineSound = new Audio("./sounds/online.mp3");
const clickSound = new Audio("./sounds/click.mp3");


// Debounce
function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// Filter Type
elFilterTypeSelect.addEventListener("change", (evt) => {
  const value = evt.target.value;
  filterKey = value;
  if (backendData) {
    elLoader.classList.remove("hidden");
    worker.postMessage({
      functionName: "filterByType",
      params: [backendData.data, value],
    });
  }
});

// Filter Value
elFilterValueSelect.addEventListener("change", (evt) => {
  const value = evt.target.value;
  filterValue = value;
  elContainer.innerHTML = "";
  if (filterKey && filterValue) {
    elLoader.classList.remove("hidden");
    getAll(`?${filterKey}=${filterValue}`)
      .then((res) => ui(res.data))
      .catch((error) => showToast(error.message))
      .finally(() => elLoader.classList.add("hidden"));
  }
});

// Search
const liveSearch = debounce((value) => {
  if (!backendData) return;
  if (value === "") {
    ui(backendData.data);
    return;
  }
  elLoader.classList.remove("hidden");
  worker.postMessage({
    functionName: "search",
    params: [backendData.data, value],
  });
}, 250);

elSearchInput.addEventListener("input", (evt) => {
  const value = evt.target.value.trim();
  liveSearch(value);
});

// Worker
worker.addEventListener("message", (evt) => {
  const response = evt.data;
  elLoader.classList.add("hidden");

  if (response.target === "filterByType") {
    elFilterValueSelect.innerHTML = "";
    if (!filterKey) {
      elFilterValueSelect.classList.add("hidden");
      return;
    }
    elFilterValueSelect.classList.remove("hidden");
    const option = document.createElement("option");
    option.selected = true;
    option.disabled = true;
    option.textContent = "All";
    elFilterValueSelect.appendChild(option);
    response.result.forEach((element) => {
      const opt = document.createElement("option");
      opt.textContent = element;
      opt.value = element;
      elFilterValueSelect.appendChild(opt);
    });
  } else if (response.target === "search") {
    if (!response.result.length) {
      elContainer.innerHTML = "";
      showToast("No data found");
    } else {
      ui(response.result);
    }
  }
});

// Offline/Online
window.addEventListener("online", () => {
  elOfflinePage.classList.add("hidden");
  onlineSound.play();
});

window.addEventListener("offline", () => {
  elOfflinePage.classList.remove("hidden");
  offlineSound.play();
});

// Shortcuts
window.addEventListener("keydown", (evt) => {
  if ((evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === "k") {
    evt.preventDefault();
    elSearchInput.focus();
  }
});

// Loader
window.addEventListener("DOMContentLoaded", () => {
  elSkeletonLoader.classList.remove("hidden");

  if (!window.navigator.onLine) elOfflinePage.classList.remove("hidden");
  else elOfflinePage.classList.add("hidden");


  // ASOSIY HOZIRCHA
  getAll(`?limit=${limit}&skip=${skip}`)
  .then((res) => {
      elLoader.classList.remove("hidden");
      backendData = res;
      pagination(backendData.total, backendData.limit, backendData.skip)
      changeLocalData(backendData.data);

      ui(backendData.data);
    })
    .catch((error) => showToast(error.message))
    .finally(() => {
      elSkeletonLoader.classList.add("hidden")
      elLoader.classList.remove("hidden");
    });


  getAll()
    .then((res) => {
      backendData = res;
      changeLocalData(backendData.data);
      ui(backendData.data);
    })
    .catch((error) => showToast(error.message))
    .finally(() => elLoader.classList.add("hidden"));
});

// Init
function init() {
  elLoader.classList.remove("hidden");
  fetch("https://json-api.uz/api/project/fn43/cars")
    .then((res) => res.json())
    .then((res) => ui(res.data))
    .catch(() => {
      elError.classList.remove("hidden")
      elPagination.classList.add("hidden")
})
    .finally(() => elSkeletonLoader.classList.add("hidden"));
}
init();

// CRUD
elContainer.addEventListener("click", (evt) => {
  const target = evt.target;

  // Edit
  if (target.classList.contains("js-edit")) {
    if (checkAuth()) {
      editedElementId = target.id;
      elEditModal.showModal();
      const foundElement = localData.find((el) => el.id == target.id);
      elEditForm.name.value = foundElement.name;
      elEditForm.description.value = foundElement.description;
    } else {
      window.location.href = "/pages/login.html";
      alert("Tahrirlash yoki O'chirish uchun ro'yxatdan o'tishingiz kerak ⚠️");
    }
  }

  // Delete
  if (target.classList.contains("js-delete")) {
    if (checkAuth() && confirm("Rostdan ham o'chirish?")) {
      elLoader.classList.remove("hidden");
      deleteElement(target.id)
        .then((id) => {
          deleteElementLocal(id);
          showToast("Mashinani muvaffaqiyatli o‘chiridingiz ✅");
        })
        .catch(() => {
          showToast("O‘chirishda xatolik yuz berdi ❌");
        })
        .finally(() => {
          elLoader.classList.add("hidden");
        });
    } else {
      window.location.href = "/pages/login.html";
      alert("Tahrirlash yoki O'chirish uchun ro'yxatdan o'tishingiz kerak ⚠️");
    }
  }

  // Info
  // Info
if (target.classList.contains("js-info")) {
  const id = target.id || target.getAttribute("data-id");
  if (id) {
    window.location.href = `/pages/details.html?id=${id}`;
  }
}

});

// Edit form
elEditForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const formData = new FormData(elEditForm);
  const result = {};
  formData.forEach((value, key) => (result[key] = value.trim()));

  if (editedElementId) {
    result.id = editedElementId;

    editElementServer(result)
      .then((res) => {
        editElementLocal(res);
        showToast("Ma'lumot tahrirlandi ✅");
      })
      .catch(() => {
        showToast("Tahrirlashda xatolik ❌");
      })
      .finally(() => {
        editedElementId = null;
        elEditModal.close();

      });
  }
});

const elPagination = document.getElementById("pagination");

elPagination.addEventListener("click", (evt) => {
  if (evt.target.classList.contains("js-page")) {
    skip = evt.target.dataset.skip;

    elLoader.classList.remove("hidden");

    getAll(`?limit=${limit}&skip=${skip}`)
      .then((res) => {
        pagination(res.total, res.limit, res.skip);
        ui(res.data);
      })
      .catch((error) => showToast(error.message))
      .finally(() => elLoader.classList.add("hidden"));
  }
});



window.addEventListener("click", () => {
  clickSound.currentTime = 0; 
  clickSound.play();
});

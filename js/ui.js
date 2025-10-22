import { showToast } from "./toast.js";
import { checkAuth } from "./check-auth.js";

export function ui(data) {
    const elContainer = document.getElementById("container");
    elContainer.innerHTML = "";

    // Agar data bo'sh bo'lsa
    if (!data || data.length === 0) {
        elContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">🚗</div>
                <h3 class="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Mashinalar topilmadi
                </h3>
                <p class="text-gray-400 dark:text-gray-500">
                    Hech qanday mashina topilmadi yoki filter natijasi bo'sh
                </p>
            </div>
        `;
        return;
    }

    data.forEach((element, index) => {
        const clone = document.getElementById("cardTemplate").content.cloneNode(true);

        const elInfoBtn = clone.querySelector(".js-info");
        const elEditBtn = clone.querySelector(".js-edit");
        const elDeleteBtn = clone.querySelector(".js-delete");
        const card = clone.querySelector(".card");

        // ID
        elInfoBtn.href = `/pages/details.html?id=${element.id}`;
        elEditBtn.id = element.id;
        elDeleteBtn.id = element.id;

        // Stagger animation delay
        card.style.animationDelay = `${index * 0.1}s`;

        // Ma'lumotlar
        clone.querySelector(".name").innerText = element.name || "Noma'lum nom";
        clone.querySelector(".name").title = element.name || "Noma'lum nom"; // Tooltip

        // Description uchun max-height
        const description = clone.querySelector(".description");
        description.innerText = element.description || "Ma'lumot yo'q";

        clone.querySelector(".trim").innerText = element.trim || "Noma'lum trim";
        clone.querySelector(".category").innerText = element.category || "Noma'lum kategoriya";
        clone.querySelector(".year").innerText = element.year || "Noma'lum yil";
        clone.querySelector(".maxSpeed").innerText = element.maxSpeed || "Tezlik ma'lumoti yo'q";
        clone.querySelector(".fuelType").innerText = element.fuelType || "Yoqilg'i turi ma'lumoti yo'q";
        clone.querySelector(".country").innerText = element.country || "Qayerdanligi haqida ma'lumot yo'q";
        clone.querySelector(".seatCount").innerText = element.seatCount || "O'rindiqlar soni ma'lumoti yo'q";

        // Auth bo'yicha tugmalarni boshqarish
        if (!checkAuth()) {
            elEditBtn.classList.add('hidden');
            elDeleteBtn.classList.add('hidden');
        }

        elContainer.appendChild(clone);
    });
}

export function pagination(total, limit, skip) {
    const elPagination = document.getElementById("pagination");
    elPagination.innerHTML = "";

    // Agar sahifalar bo'lmasa
    if (!total || total <= limit) {
        return;
    }

    const pageCount = Math.ceil(total / limit);
    const activePage = Math.floor(skip / limit) + 1;

    // Responsive pagination container
    const paginationContainer = document.createElement("div");
    paginationContainer.className = "flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg";

    // Jami ma'lumot
    const totalInfo = document.createElement("div");
    totalInfo.className = "flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400";
    totalInfo.innerHTML = `
        <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <span class="font-medium">Jami: <span class="text-indigo-600 dark:text-indigo-400 font-bold">${total}</span> ta</span>
    `;

    // Pagination kontrollerlari
    const paginationControls = document.createElement("div");
    paginationControls.className = "flex items-center gap-1 sm:gap-2 flex-wrap justify-center";

    // Oldingi sahifa tugmasi
    if (activePage > 1) {
        const prevButton = document.createElement("button");
        prevButton.className = "js-page flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all duration-300 hover:scale-105 hover:shadow-md border border-indigo-200 dark:border-indigo-700";
        prevButton.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            <span class="hidden sm:inline">Oldingi</span>
        `;
        prevButton.dataset.skip = (activePage - 2) * limit;
        prevButton.title = "Oldingi sahifa";
        paginationControls.appendChild(prevButton);
    } else {
        const prevButton = document.createElement("button");
        prevButton.className = "flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-not-allowed opacity-50 border border-gray-200 dark:border-gray-600";
        prevButton.disabled = true;
        prevButton.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            <span class="hidden sm:inline">Oldingi</span>
        `;
        paginationControls.appendChild(prevButton);
    }

    // Sahifa raqamlari
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;
    let startPage = Math.max(1, activePage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);

    // Adjust start page if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Birinchi sahifa
    if (startPage > 1) {
        const firstButton = document.createElement("button");
        firstButton.className = "js-page px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 hover:scale-110";
        firstButton.innerText = "1";
        firstButton.dataset.skip = 0;
        firstButton.title = "1 - sahifa";
        paginationControls.appendChild(firstButton);

        // Ellipsis
        if (startPage > 2) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "px-2 text-gray-400 text-sm";
            ellipsis.innerHTML = "•••";
            paginationControls.appendChild(ellipsis);
        }
    }

    // Sahifa raqamlari
    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement("button");

        if (activePage === i) {
            button.className = "js-page px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl";
        } else {
            button.className = "js-page px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 hover:scale-110";
        }

        button.innerText = i;
        button.dataset.skip = (i - 1) * limit;
        button.title = `${i} - sahifa`;

        paginationControls.appendChild(button);
    }

    // Oxirgi sahifa
    if (endPage < pageCount) {
        // Ellipsis
        if (endPage < pageCount - 1) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "px-2 text-gray-400 text-sm";
            ellipsis.innerHTML = "•••";
            paginationControls.appendChild(ellipsis);
        }

        // Oxirgi sahifa
        const lastButton = document.createElement("button");
        lastButton.className = "js-page px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 hover:scale-110";
        lastButton.innerText = pageCount;
        lastButton.dataset.skip = (pageCount - 1) * limit;
        lastButton.title = `${pageCount} - sahifa`;
        paginationControls.appendChild(lastButton);
    }

    // Keyingi sahifa tugmasi
    if (activePage < pageCount) {
        const nextButton = document.createElement("button");
        nextButton.className = "js-page flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all duration-300 hover:scale-105 hover:shadow-md border border-indigo-200 dark:border-indigo-700";
        nextButton.innerHTML = `
            <span class="hidden sm:inline">Keyingi</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
        `;
        nextButton.dataset.skip = activePage * limit;
        nextButton.title = "Keyingi sahifa";
        paginationControls.appendChild(nextButton);
    } else {
        const nextButton = document.createElement("button");
        nextButton.className = "flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-not-allowed opacity-50 border border-gray-200 dark:border-gray-600";
        nextButton.disabled = true;
        nextButton.innerHTML = `
            <span class="hidden sm:inline">Keyingi</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
        `;
        paginationControls.appendChild(nextButton);
    }

    // Sahifa ma'lumotlari
    const pageInfo = document.createElement("div");
    pageInfo.className = "flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-700 px-3 sm:px-4 py-2 rounded-full";
    pageInfo.innerHTML = `
        <span class="text-gray-500 dark:text-gray-400">Sahifa</span>
        <span class="font-bold text-indigo-600 dark:text-indigo-400">${activePage}</span>
        <span class="text-gray-400">/</span>
        <span class="text-gray-600 dark:text-gray-300 font-medium">${pageCount}</span>
    `;

    // Elementlarni container ga qo'shish
    paginationContainer.appendChild(totalInfo);
    paginationContainer.appendChild(paginationControls);
    paginationContainer.appendChild(pageInfo);
    elPagination.appendChild(paginationContainer);
}

// Qo'shimcha: Loading state
export function showLoadingState() {
    const elContainer = document.getElementById("container");
    elContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
            <div class="loading loading-spinner loading-lg text-primary mb-4"></div>
            <p class="text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
        </div>
    `;
}

// Qo'shimcha: Error state
export function showErrorState(message = "Xatolik yuz berdi") {
    const elContainer = document.getElementById("container");
    elContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
            <div class="text-6xl mb-4">😕</div>
            <h3 class="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
                ${message}
            </h3>
            <button class="btn btn-outline btn-sm mt-2" onclick="location.reload()">
                Qayta yuklash
            </button>
        </div>
    `;
}

// Qo'shimcha: Empty state
export function showEmptyState(message = "Hech narsa topilmadi") {
    const elContainer = document.getElementById("container");
    elContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
            <div class="text-6xl mb-4">🚗</div>
            <h3 class="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
                ${message}
            </h3>
            <p class="text-gray-400 dark:text-gray-500 mb-4">
                Yangi mashina qo'shish uchun yuqoridagi tugmani bosing
            </p>
        </div>
    `;
}
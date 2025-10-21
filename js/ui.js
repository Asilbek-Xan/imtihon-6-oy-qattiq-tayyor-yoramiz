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

    const remained = total % limit;
    const pageCount = Math.ceil(total / limit);
    let activePage = Math.floor(skip / limit) + 1;

    // Oldingi sahifa tugmasi
    if (activePage > 1) {
        const prevButton = document.createElement("button");
        prevButton.classList.add("join-item", "btn", "js-page");
        prevButton.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
        `;
        prevButton.dataset.skip = (activePage - 2) * limit;
        prevButton.title = "Oldingi sahifa";
        elPagination.appendChild(prevButton);
    }

    // Sahifa raqamlari
    const maxVisiblePages = 5;
    let startPage = Math.max(1, activePage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);

    // Adjust start page if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Birinchi sahifa
    if (startPage > 1) {
        const firstButton = document.createElement("button");
        firstButton.classList.add("join-item", "btn", "js-page");
        firstButton.innerText = "1";
        firstButton.dataset.skip = 0;
        elPagination.appendChild(firstButton);

        // Ellipsis
        if (startPage > 2) {
            const ellipsis = document.createElement("button");
            ellipsis.classList.add("join-item", "btn", "btn-disabled");
            ellipsis.innerHTML = "...";
            ellipsis.disabled = true;
            elPagination.appendChild(ellipsis);
        }
    }

    // Sahifa raqamlari
    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement("button");
        button.classList.add("join-item", "btn", "js-page");

        if (activePage === i) {
            button.classList.add("btn-active");
        }

        button.innerText = i;
        button.dataset.skip = (i - 1) * limit;
        button.title = `${i} - sahifa`;

        elPagination.appendChild(button);
    }

    // Oxirgi sahifa
    if (endPage < pageCount) {
        // Ellipsis
        if (endPage < pageCount - 1) {
            const ellipsis = document.createElement("button");
            ellipsis.classList.add("join-item", "btn", "btn-disabled");
            ellipsis.innerHTML = "...";
            ellipsis.disabled = true;
            elPagination.appendChild(ellipsis);
        }

        // Oxirgi sahifa
        const lastButton = document.createElement("button");
        lastButton.classList.add("join-item", "btn", "js-page");
        lastButton.innerText = pageCount;
        lastButton.dataset.skip = (pageCount - 1) * limit;
        elPagination.appendChild(lastButton);
    }

    // Keyingi sahifa tugmasi
    if (activePage < pageCount) {
        const nextButton = document.createElement("button");
        nextButton.classList.add("join-item", "btn", "js-page");
        nextButton.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
        `;
        nextButton.dataset.skip = activePage * limit;
        nextButton.title = "Keyingi sahifa";
        elPagination.appendChild(nextButton);
    }

    // Sahifa ma'lumotlari
    const pageInfo = document.createElement("div");
    pageInfo.className = "join-item btn btn-disabled text-sm";
    pageInfo.innerHTML = `
        <span class="hidden sm:inline">Sahifa:</span>
        ${activePage} / ${pageCount}
    `;
    elPagination.appendChild(pageInfo);
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
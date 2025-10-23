const elTitle = document.getElementById("name");
const elDesc = document.getElementById("description");
const elInfo = document.getElementById("info");
const elColor = document.getElementById("colorPreview");

function getParamId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function showLoading() {
  elInfo.innerHTML = `
    <div class="flex flex-col items-center text-center space-y-3">
      <div class="loader"></div>
      <p class="text-blue-400 animate-pulse text-sm">
        ⏳ Ma'lumotlar yuklanmoqda... iltimos kuting 😊
      </p>
    </div>
  `;
}

async function getById(id) {
  try {
    const req = await fetch(`https://json-api.uz/api/project/fn44/cars/${id}`);
    const res = await req.json();
    return res;
  } catch {
    throw new Error("Ma'lumotni olishda xatolik bo'ldi!");
  }
}

function checkValue(value) {
  return value !== null && value !== undefined && value !== "" && value !== "Noma'lum";
}

function ui(data) {
  document.title = data.name || "Car Details";
  elTitle.innerHTML = `<span class="drop-shadow-lg">${data.name}</span>`;
  elDesc.innerText = data.description || "Tavsif mavjud emas";

  elInfo.innerHTML = "";

  const infoItems = [];

  // Har bir maydon uchun "no-data" tekshiruvi
  infoItems.push(`<p><b>Model:</b> ${checkValue(data.trim) ? data.trim : '<span class="text-gray-500">no-data</span>'}</p>`);
  infoItems.push(`<p><b>Yil:</b> ${checkValue(data.year) ? data.year : '<span class="text-gray-500">no-data</span>'}</p>`);
  infoItems.push(`<p><b>Avlod:</b> ${checkValue(data.generation) ? data.generation : '<span class="text-gray-500">no-data</span>'}</p>`);

  // Rang uchun alohida tekshiruv
  if (checkValue(data.colorName) || checkValue(data.color)) {
    const colorText = [];
    if (checkValue(data.colorName)) colorText.push(data.colorName);
    if (checkValue(data.color)) colorText.push(`(${data.color})`);
    infoItems.push(`<p><b>Rangi:</b> ${colorText.join(' ')}</p>`);
  } else {
    infoItems.push(`<p><b>Rangi:</b> <span class="text-gray-500">no-data</span></p>`);
  }

  infoItems.push(`<p><b>Tur:</b> ${checkValue(data.category) ? data.category : '<span class="text-gray-500">no-data</span>'}</p>`);
  infoItems.push(`<p><b>Eshiklar:</b> ${checkValue(data.doorCount) ? data.doorCount : '<span class="text-gray-500">no-data</span>'}</p>`);
  infoItems.push(`<p><b>O'rindiqlar:</b> ${checkValue(data.seatCount) ? data.seatCount : '<span class="text-gray-500">no-data</span>'}</p>`);
  infoItems.push(`<p><b>Eng tezlik:</b> ${checkValue(data.maxSpeed) ? data.maxSpeed : '<span class="text-gray-500">no-data</span>'}</p>`);
  infoItems.push(`<p><b>Tezlanish:</b> ${checkValue(data.acceleration) ? data.acceleration : '<span class="text-gray-500">no-data</span>'}</p>`);
  infoItems.push(`<p><b>Dvigatel:</b> ${checkValue(data.engine) ? data.engine : '<span class="text-gray-500">no-data</span>'}</p>`);
  infoItems.push(`<p><b>Ot kuchi:</b> ${checkValue(data.horsepower) ? data.horsepower : '<span class="text-gray-500">no-data</span>'}</p>`);
  infoItems.push(`<p><b>Yoqilg'i turi:</b> ${checkValue(data.fuelType) ? data.fuelType : '<span class="text-gray-500">no-data</span>'}</p>`);

  // Yoqilg'i sarfi uchun alohida tekshiruv
  if (data.fuelConsumption) {
    const fuelItems = [];
    if (checkValue(data.fuelConsumption.city)) fuelItems.push(`Shahar: ${data.fuelConsumption.city}`);
    if (checkValue(data.fuelConsumption.highway)) fuelItems.push(`Trassa: ${data.fuelConsumption.highway}`);
    if (checkValue(data.fuelConsumption.combined)) fuelItems.push(`O'rtacha: ${data.fuelConsumption.combined}`);

    if (fuelItems.length > 0) {
      infoItems.push(`<p><b>Yoqilg'i sarfi:</b> ${fuelItems.join(', ')}</p>`);
    } else {
      infoItems.push(`<p><b>Yoqilg'i sarfi:</b> <span class="text-gray-500">no-data</span></p>`);
    }
  } else {
    infoItems.push(`<p><b>Yoqilg'i sarfi:</b> <span class="text-gray-500">no-data</span></p>`);
  }

  infoItems.push(`<p><b>Ishlab chiqaruvchi:</b> ${checkValue(data.country) ? data.country : '<span class="text-gray-500">no-data</span>'}</p>`);

  // Faqat "Bu mashina haqida ma'lumot topilmadi" xabarini o'chirish
  // Barcha maydonlar "no-data" bo'lsa ham, ularni ko'rsatish

  // Ma'lumotlarni chiqarish
  infoItems.forEach((item, index) => {
    setTimeout(() => {
      const p = document.createElement("div");
      p.innerHTML = item;
      p.style.animation = "fadeIn 0.5s ease forwards";
      elInfo.appendChild(p);
    }, index * 80);
  });

  // Rang preview
  if (checkValue(data.color)) {
    elColor.style.backgroundColor = data.color;
  } else {
    elColor.style.backgroundColor = "#f3f4f6"; // default rang
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const id = getParamId();

  if (!id) {
    elInfo.innerHTML = `<p class="text-red-500">❌ ID topilmadi!</p>`;
    return;
  }

  showLoading();

  const timeout = setTimeout(() => {
    elInfo.innerHTML = `<p class="text-red-500 text-center">
      ⚠ So'rov juda uzoq davom etdi! Iltimos qaytadan urining.
    </p>`;
  }, 10000);

  getById(id)
    .then((data) => {
      clearTimeout(timeout);
      ui(data);
    })
    .catch(() => {
      clearTimeout(timeout);
      elInfo.innerHTML = `<p class="text-red-500 text-center">
        🚫 Ma'lumot yuklashda xatolik yuz berdi!
      </p>`;
    });
});
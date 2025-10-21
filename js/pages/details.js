const elTitle = document.getElementById("name");
const elDesc = document.getElementById("description");
const elInfo = document.getElementById("info");
const elColor = document.getElementById("colorPreview");

// ✅ URL-dan id olish funksiyasi
function getParamId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// ✅ Loader ko'rsatish
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

// ✅ Faqat 1 ta mashina ma'lumotini olish
async function getById(id) {
  try {
    const req = await fetch(`https://json-api.uz/api/project/fn44/cars/${id}`);
    const res = await req.json();
    return res;
  } catch {
    throw new Error("Ma'lumotni olishda xatolik bo'ldi!");
  }
}

// ✅ Ma'lumot mavjudligini tekshirish
function checkValue(value) {
  return value !== null && value !== undefined && value !== "" && value !== "Noma'lum";
}

// ✅ UI ga chiqarish + Animation bilan
function ui(data) {
  document.title = data.name || "Car Details";
  elTitle.innerHTML = `<span class="drop-shadow-lg">${data.name}</span>`;
  elDesc.innerText = data.description || "Tavsif mavjud emas";

  // Har bir <p> navbat bilan chiqishi (delay bilan)
  elInfo.innerHTML = "";

  // Faqat mavjud bo'lgan ma'lumotlarni qo'shamiz
  const infoItems = [];

  if (checkValue(data.trim)) infoItems.push(`<p><b>Model:</b> ${data.trim}</p>`);
  if (checkValue(data.year)) infoItems.push(`<p><b>Yil:</b> ${data.year}</p>`);
  if (checkValue(data.generation)) infoItems.push(`<p><b>Avlod:</b> ${data.generation}</p>`);

  // Rang ma'lumotlari
  if (checkValue(data.colorName) || checkValue(data.color)) {
    const colorText = [];
    if (checkValue(data.colorName)) colorText.push(data.colorName);
    if (checkValue(data.color)) colorText.push(`(${data.color})`);
    infoItems.push(`<p><b>Rangi:</b> ${colorText.join(' ')}</p>`);
  }

  if (checkValue(data.category)) infoItems.push(`<p><b>Tur:</b> ${data.category}</p>`);
  if (checkValue(data.doorCount)) infoItems.push(`<p><b>Eshiklar:</b> ${data.doorCount}</p>`);
  if (checkValue(data.seatCount)) infoItems.push(`<p><b>O'rindiqlar:</b> ${data.seatCount}</p>`);
  if (checkValue(data.maxSpeed)) infoItems.push(`<p><b>Eng tezlik:</b> ${data.maxSpeed}</p>`);
  if (checkValue(data.acceleration)) infoItems.push(`<p><b>Tezlanish:</b> ${data.acceleration}</p>`);
  if (checkValue(data.engine)) infoItems.push(`<p><b>Dvigatel:</b> ${data.engine}</p>`);
  if (checkValue(data.horsepower)) infoItems.push(`<p><b>Ot kuchi:</b> ${data.horsepower}</p>`);
  if (checkValue(data.fuelType)) infoItems.push(`<p><b>Yoqilg'i turi:</b> ${data.fuelType}</p>`);

  // Yoqilg'i sarfi ma'lumotlari
  if (data.fuelConsumption) {
    const fuelItems = [];
    if (checkValue(data.fuelConsumption.city)) fuelItems.push(`Shahar: ${data.fuelConsumption.city}`);
    if (checkValue(data.fuelConsumption.highway)) fuelItems.push(`Trassa: ${data.fuelConsumption.highway}`);
    if (checkValue(data.fuelConsumption.combined)) fuelItems.push(`O'rtacha: ${data.fuelConsumption.combined}`);

    if (fuelItems.length > 0) {
      infoItems.push(`<p><b>Yoqilg'i sarfi:</b> ${fuelItems.join(', ')}</p>`);
    }
  }

  if (checkValue(data.country)) infoItems.push(`<p><b>Ishlab chiqaruvchi:</b> ${data.country}</p>`);

  // Agar hech qanday ma'lumot bo'lmasa
  if (infoItems.length === 0) {
    elInfo.innerHTML = `<p class="text-gray-500">Bu mashina haqida ma'lumot topilmadi</p>`;
    return;
  }

  // Ma'lumotlarni ekranga chiqarish
  infoItems.forEach((item, index) => {
    setTimeout(() => {
      const p = document.createElement("div");
      p.innerHTML = item;
      p.style.animation = "fadeIn 0.5s ease forwards";
      elInfo.appendChild(p);
    }, index * 80); // har bir satr 80ms kechikib chiqadi
  });

  // ✅ Rang preview (agar rang mavjud bo'lsa)
  if (checkValue(data.color)) {
    elColor.style.backgroundColor = data.color;
  }
}

// ✅ Sahifa yuklanganda ishlaydi
window.addEventListener("DOMContentLoaded", () => {
  const id = getParamId();

  if (!id) {
    elInfo.innerHTML = `<p class="text-red-500">❌ ID topilmadi!</p>`;
    return;
  }

  showLoading(); // Loader ko'rsatamiz

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
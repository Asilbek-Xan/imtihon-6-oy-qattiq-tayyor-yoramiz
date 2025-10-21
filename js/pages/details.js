const elTitle = document.getElementById("name");
const elDesc = document.getElementById("description");
const elInfo = document.getElementById("info");
const elColor = document.getElementById("colorPreview");

// ✅ URL-dan id olish funksiyasi
function getParamId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// ✅ Loader ko‘rsatish (Tesla Style)
function showLoading() {
  elInfo.innerHTML = `
    <div class="flex flex-col items-center text-center space-y-3">
      <div class="loader"></div>
      <p class="text-blue-400 animate-pulse text-sm">
        ⏳ Ma’lumotlar yuklanmoqda... iltimos kuting 😊
      </p>
    </div>
  `;
}

// ✅ Faqat 1 ta mashina malumotini olish
async function getById(id) {
  try {
    const req = await fetch(`https://json-api.uz/api/project/fn44/cars/${id}`);
    const res = await req.json();
    return res;
  } catch {
    throw new Error("Ma'lumotni olishda xatolik bo‘ldi!");
  }
}

// ✅ UI ga chiqarish + Animation bilan
function ui(data) {
  document.title = data.name || "Car Details";
  elTitle.innerHTML = `<span class="drop-shadow-lg">${data.name}</span>`;
  elDesc.innerText = data.description || "Tavsif mavjud emas";

  // Har bir <p> navbat bilan chiqishi (delay bilan)
  elInfo.innerHTML = "";
  const infoItems = [
    `<p><b>Model:</b> ${data.trim}</p>`,
    `<p><b>Yil:</b> ${data.year}</p>`,
    `<p><b>Avlod:</b> ${data.generation}</p>`,
    `<p><b>Rangi:</b> ${data.colorName} (${data.color})</p>`,
    `<p><b>Tur:</b> ${data.category}</p>`,
    `<p><b>Eshiklar:</b> ${data.doorCount}</p>`,
    `<p><b>O‘rindiqlar:</b> ${data.seatCount}</p>`,
    `<p><b>Eng tezlik:</b> ${data.maxSpeed}</p>`,
    `<p><b>Tezlanish:</b> ${data.acceleration}</p>`,
    `<p><b>Dvigatel:</b> ${data.engine}</p>`,
    `<p><b>Ot kuchi:</b> ${data.horsepower}</p>`,
    `<p><b>Yoqilg‘i turi:</b> ${data.fuelType}</p>`,
    `<p><b>Shahar:</b> ${data.fuelConsumption.city}</p>`,
    `<p><b>Trassa:</b> ${data.fuelConsumption.highway}</p>`,
    `<p><b>O‘rtacha:</b> ${data.fuelConsumption.combined}</p>`,
    `<p><b>Ishlab chiqaruvchi:</b> ${data.country}</p>`
  ];

  infoItems.forEach((item, index) => {
    setTimeout(() => {
      const p = document.createElement("div");
      p.innerHTML = item;
      p.style.animation = "fadeIn 0.5s ease forwards";
      elInfo.appendChild(p);
    }, index * 80); // har bir satr 80ms kechikib chiqadi
  });

  // ✅ Rang preview
  elColor.style.backgroundColor = data.color;
}

// ✅ Sahifa yuklanganda ishlaydi
window.addEventListener("DOMContentLoaded", () => {
  const id = getParamId();

  if (!id) {
    elInfo.innerHTML = `<p class="text-red-500">❌ ID topilmadi!</p>`;
    return;
  }

  showLoading(); // Loader ko‘rsatamiz

  const timeout = setTimeout(() => {
    elInfo.innerHTML = `<p class="text-red-500 text-center">
      ⚠ So‘rov juda uzoq davom etdi! Iltimos qaytadan urining.
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

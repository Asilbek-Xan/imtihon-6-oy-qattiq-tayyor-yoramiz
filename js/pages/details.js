const elTitle = document.getElementById("name");
const elDesc = document.getElementById("description");
const elInfo = document.getElementById("info");
const elColor = document.getElementById("colorPreview");

async function getById(id) {
  document.title = "Yuklanmoqda...";
  try {
    const req = await fetch(`https://json-api.uz/api/project/fn44/cars/${id}`);
    const res = await req.json();
    return res;
  } catch {
    throw new Error("Ma'lumotni olishda xatolik bo'ldi!");
  }
}

function ui(data) {
  document.title = data.name;
  elTitle.innerText = data.name;
  elDesc.innerText = data.description || "Tavsif mavjud emas";

  elInfo.innerHTML = `
    <p><b>Model:</b> ${data.trim}</p>
    <p><b>Yil:</b> ${data.year}</p>
    <p><b>Avlod:</b> ${data.generation}</p>
    <p><b>Rangi:</b> ${data.colorName} (${data.color})</p>
    <p><b>Tur:</b> ${data.category}</p>
    <p><b>Eshiklar:</b> ${data.doorCount}</p>
    <p><b>O‘rindiqlar:</b> ${data.seatCount}</p>
    <p><b>Eng tezlik:</b> ${data.maxSpeed}</p>
    <p><b>Tezlanish:</b> ${data.acceleration}</p>
    <p><b>Dvigatel:</b> ${data.engine}</p>
    <p><b>Ot kuchi:</b> ${data.horsepower}</p>
    <p><b>Yoqilg‘i turi:</b> ${data.fuelType}</p>
    <p><b>Shahar:</b> ${data.fuelConsumption.city}</p>
    <p><b>Trassa:</b> ${data.fuelConsumption.highway}</p>
    <p><b>O‘rtacha:</b> ${data.fuelConsumption.combined}</p>
    <p><b>Ishlab chiqaruvchi:</b> ${data.country}</p>
  `;

  elColor.style.backgroundColor = data.color;
}

window.addEventListener("DOMContentLoaded", () => {
  const id = new URLSearchParams(location.search).get("id");
  getById(id)
    .then((res) => ui(res))
    .catch(() => {
      elTitle.innerText = "Xatolik!";
      elDesc.innerText = "Ma'lumotni olishda muammo bo‘ldi.";
    });
});

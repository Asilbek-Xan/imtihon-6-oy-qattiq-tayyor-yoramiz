const baseURL = "https://json-api.uz/api/project/fn44";

// Barcha ma'lumotlarni olish
export async function getAll(query = "") {
  try {
    const req = await fetch(baseURL + `/cars${query ? query : ""}`);
    if (!req.ok) throw new Error("Server javobi xato!");
    const res = await req.json();
    return res;
  } catch (err) {
    throw new Error(err.message || "Ma'lumotlarni olishda xatolik bo'ldi!");
  }
}

// Element qo'shish
export async function addElement(newData) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${baseURL}/cars/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newData),
    });

    if (!res.ok) throw new Error("Server javobi xato!");

    const data = await res.json();
    return data;
  } catch (err) {
    throw new Error(err.message || "Xatolik bo'ldi ⚠️");
  }
}

// Element tahrirlash
export async function editElement(editedData) {
  try {
    const token = localStorage.getItem("token");
    const req = await fetch(baseURL + `/cars/${editedData.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editedData),
    });

    if (!req.ok) throw new Error("Server javobi xato!");
    const res = await req.json();
    return res;
  } catch (err) {
    throw new Error(err.message || "Ma'lumotni tahrirlashda xatolik bo'ldi!");
  }
}

// Elementni ID bo'yicha o'chirish
export async function deleteElement(id) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(baseURL + `/cars/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Server javobi xato!");
    return id;
  } catch (err) {
    throw new Error(err.message || "Ma'lumotni o'chirishda xatolik bo'ldi!");
  }
}

// baseURL ni export qilish CRUD.js uchun
export { baseURL };
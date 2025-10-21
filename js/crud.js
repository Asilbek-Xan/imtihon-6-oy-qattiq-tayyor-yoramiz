import { changeLocalData, localData } from "./local-data.js";
import { ui } from "./ui.js";
import { showToast } from "./toast.js";
import { baseURL } from "./request.js"; // ✅ baseURL import qilindi

// Delete element from server and local
export async function deleteElement(id) {
  const token = localStorage.getItem("token");
  const elLoader = document.getElementById("loader");

  if (elLoader) elLoader.classList.remove("hidden");

  try {
    const res = await fetch(`${baseURL}/cars/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("O'chirishda xatolik yuz berdi");

    deleteElementLocal(id);
    ui(localData);
    showToast("Element muvaffaqiyatli o'chirildi ✅");

    return id;
  } catch (err) {
    console.error(err);
    showToast("O'chirishda xatolik yuz berdi ⚠️");
    throw err;
  } finally {
    if (elLoader) elLoader.classList.add("hidden");
  }
}

// Add element to server and local
export async function addElement(payload) {
  const token = localStorage.getItem("token");
  const elLoader = document.getElementById("loader");

  if (elLoader) elLoader.classList.remove("hidden");

  try {
    const response = await fetch(`${baseURL}/cars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Mashina qo\'shishda xatolik');

    const newCar = await response.json();
    addElementLocal(newCar);
    showToast('✅ Mashina muvaffaqiyatli qo\'shildi');

    return newCar;
  } catch (error) {
    showToast(error.message || '❌ Mashina qo\'shishda xatolik');
    throw error;
  } finally {
    if (elLoader) elLoader.classList.add("hidden");
  }
}

// Edit element on server and local
export async function editElementServer(payload) {
  const token = localStorage.getItem("token");
  const elLoader = document.getElementById("loader");

  if (elLoader) elLoader.classList.remove("hidden");

  try {
    const response = await fetch(`${baseURL}/cars/${payload.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Tahrirlashda xatolik');

    const editedData = await response.json();
    editElementLocal(editedData);
    showToast('✅ Ma\'lumot yangilandi');

    return editedData;
  } catch (error) {
    showToast(error.message || '❌ Tahrirlashda xatolik');
    throw error;
  } finally {
    if (elLoader) elLoader.classList.add("hidden");
  }
}

// Local funksiyalar
export function deleteElementLocal(id) {
   const result = localData.filter((el) => el.id != id);
   changeLocalData(result);
}

export function addElementLocal(newData) {
    const result = [newData, ...localData];
    changeLocalData(result);
}

export function editElementLocal(newData) {
  const result = localData.map((el) => {
    if (el.id === newData.id) {
      return newData;
    } else {
      return el;
    }
  });

  changeLocalData(result);
  ui(result);
}




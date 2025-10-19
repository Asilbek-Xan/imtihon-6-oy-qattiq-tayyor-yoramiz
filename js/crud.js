import { changeLocalData, localData } from "./local-data.js";
import { ui } from "./ui.js";




export function deleteElementLocal(id){
   const result = localData.filter((el) => el.id != id)
   changeLocalData(result);
}


export function addElementLocal(newData){
    const result = [newData, ...localData];
    changeLocalData(result);
}




export function editElement(editedData) {
  const result = localData.map((el) => {
    if (el.id === editedData.id) {
      return editedData;
    } else {
      return el;
    }
  });

  changeLocalData(result);
  return Promise.resolve(editedData);

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





export async function deleteElement(id) {
  const token = localStorage.getItem("token");
  elLoader.classList.remove("hidden");
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
    elLoader.classList.add("hidden");
  }
}




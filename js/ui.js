  export function ui(data) {
    const elContainer = document.getElementById("container");
    elContainer.innerHTML = "";

    data.forEach((element) => {
      const clone = document.getElementById("cardTemplate").content.cloneNode(true);

      const elInfoBtn = clone.querySelector(".js-info");
      const elEditBtn = clone.querySelector(".js-edit");
      const elDeleteBtn = clone.querySelector(".js-delete");

      // ID
      elInfoBtn.href =  `/pages/details.html?id=${element.id}` ;
      elEditBtn.id = element.id;
      elDeleteBtn.id = element.id;

      // Ma'lumotlar
      clone.querySelector(".name").innerText = element.name || "Noma'lum nom";
      clone.querySelector(".description").innerText =
        element.description || "Ma'lumot yo‘q";
      clone.querySelector(".trim").innerText = element.trim || "Noma'lum trim";
      clone.querySelector(".category").innerText =
        element.category || "Noma'lum kategoriya";
      clone.querySelector(".year").innerText = element.year || "Noma'lum yil";
      clone.querySelector(".maxSpeed").innerText =
        element.maxSpeed || "Tezlik ma'lumoti yo'q";
      clone.querySelector(".fuelType").innerText =
        element.fuelType || "Yoqilg'i turi ma'lumoti yo'q";
      clone.querySelector(".country").innerText =
        element.country || "Qayerdanligi haqida ma'lumot yo'q";
      clone.querySelector(".seatCount").innerText =
        element.seatCount || "O'rindiqlar soni ma'lumoti yo'q";

      elContainer.appendChild(clone);
    });
  }



  export function pagination(total, limit, skip){

    const elPagination = document.getElementById("pagination")
    elPagination.innerHTML = "";
    const remained = total % limit;
    const pageCount = (total - remained) / limit;
    let activePage = skip / limit + 1;






    for(let i = 1; i <= pageCount; i++){
      const button = document.createElement("button")
      button.classList.add("join-item", "btn", "js-page")
      if(activePage === i){
              button.classList.add("btn-active");
      }
      button.innerText = i;
      button.dataset.limit = limit;



if(i > 1){
  button.dataset.skip = limit * i - limit;
}


      elPagination.appendChild(button);
    }

     if(remained > 0) {
 const button = document.createElement("button")
      button.classList.add("join-item", "btn", "js-page")
      button.innerText = pageCount + 1;
      elPagination.appendChild(button);
    }


  }
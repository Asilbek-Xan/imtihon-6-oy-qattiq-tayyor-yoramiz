export function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "fixed bottom-5 right-5 flex flex-col gap-3 z-[9999]";
    document.body.appendChild(container);
  }

  const typeStyles = {
    success: "bg-green-500 text-white shadow-[0_4px_15px_rgba(0,255,0,0.5)]",
    error: "bg-red-500 text-white shadow-[0_4px_15px_rgba(255,0,0,0.5)]",
    info: "bg-blue-500 text-white shadow-[0_4px_15px_rgba(0,128,255,0.5)]",
  };

  const toast = document.createElement("div");
  toast.className = `
    ${typeStyles[type] || typeStyles.info}
    px-6 py-4 rounded-2xl font-semibold text-sm
    transform transition-all duration-500 ease-in-out
    opacity-0 scale-90 hover:scale-105 cursor-pointer
    border-2 border-white/30 backdrop-blur-md
  `;
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="flex-1">${message}</span>
      <button class="text-white font-bold">&times;</button>
    </div>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("opacity-0", "scale-90");
  });

  toast.querySelector("button").addEventListener("click", () => {
    removeToast();
  });

  let remaining = 4000;
  let startTime = Date.now();
  let timer = setTimeout(removeToast, remaining);

  function removeToast() {
    toast.classList.add("opacity-0", "scale-90");
    setTimeout(() => toast.remove(), 500);
  }

  toast.addEventListener("mouseenter", () => {
    clearTimeout(timer);
    remaining -= Date.now() - startTime;
  });

  toast.addEventListener("mouseleave", () => {
    startTime = Date.now();
    timer = setTimeout(removeToast, remaining);
  });
}

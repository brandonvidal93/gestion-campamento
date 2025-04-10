const canvas = document.getElementById("firma-canvas");
const ctx = canvas.getContext("2d");
let painting = false;

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", endPosition);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("touchstart", startPosition, { passive: false });
canvas.addEventListener("touchend", endPosition);
canvas.addEventListener("touchmove", drawTouch, { passive: false });

function startPosition(e) {
  e.preventDefault();
  painting = true;
  draw(e);
}

function endPosition() {
  painting = false;
  ctx.beginPath();
}

function draw(e) {
  if (!painting) return;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function drawTouch(e) {
  if (!painting) return;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

// Limpiar firma
document.getElementById("clear-btn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Enviar firma al backend
document.getElementById("firma-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("identificacion").value;
  const signature = canvas.toDataURL("image/png");

  const formData = new FormData();
  formData.append("identificacion", id);
  formData.append("firma", signature);

  const response = await fetch("/guardar", {
    method: "POST",
    body: formData
  });

  if (response.ok) {
    alert("Firma guardada con éxito");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("identificacion").value = "";
  } else {
    alert("Error al guardar firma");
  }
});

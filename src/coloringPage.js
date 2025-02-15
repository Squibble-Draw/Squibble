const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const img = getQueryString().get("img");
const coloringPage = document.getElementById("background");
coloringPage.src = "public/" + img;

const colorButtons = document.querySelectorAll(".color-picker");
const eraser = document.getElementById("eraser");

let drawing = false;
let fillMode = false;
let lines = [];
let undoLines = [];
let zoomLevel = 1;

function changeColor(color) {
  ctx.strokeStyle = color;
}

colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const color = button.getAttribute("data-color");
    changeColor(color);
    colorButtons.forEach((btn) => btn.classList.remove("button-active"));
    button.classList.add("button-active");
  });
});

// Eraser tool functionality
eraser.addEventListener("click", () => {
  drawing = false; // Stop any ongoing drawing
  ctx.globalCompositeOperation = "destination-out"; // Activate erase mode
});

// Reset to normal drawing when a color is selected
colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const color = button.getAttribute("data-color");
    ctx.globalCompositeOperation = "source-over"; // Return to normal drawing
    changeColor(color);
  });
});

function getQueryString() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams;
}

// Adjust canvas size to match container
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  redrawCanvas();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

canvas.addEventListener("mousedown", (e) => {
  undoLines = []; // Clear the redo stack whenever a new stroke starts
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);

  // Record the current stroke, including whether it's an eraser
  lines.push([
    {
      x: e.offsetX / canvas.width, // normalized
      y: e.offsetY / canvas.height, // normalized
      color: ctx.strokeStyle,
      size: ctx.lineWidth,
      operation: ctx.globalCompositeOperation, // Tracks if it's an eraser
    },
  ]);
});

// Continue drawing on mouse move
canvas.addEventListener("mousemove", (e) => {
  if (drawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    lines[lines.length - 1].push({
      x: e.offsetX / canvas.width, // normalized
      y: e.offsetY / canvas.height, //normalized
      color: ctx.strokeStyle,
      operation: ctx.globalCompositeOperation, // Tracks the operation for this point
    });
  }
});

// Touch start event
canvas.addEventListener("touchstart", (e) => {
  drawing = true;

  const rect = canvas.getBoundingClientRect(); // Get canvas position

  // Adjust touch coordinates
  const x = (e.touches[0].clientX - rect.left) / canvas.width; // normalized
  const y = (e.touches[0].clientY - rect.top) / canvas.height; // normalized

  ctx.beginPath(); // Start a new path
  ctx.moveTo(x, y); // Move to the touch position without drawing

  // Record the starting point of the line
  lines.push([
    {
      x: x,
      y: y,
      color: ctx.strokeStyle,
      operation: ctx.globalCompositeOperation, // Tracks the operation for this point
    },
  ]);
});

// Touch move event
canvas.addEventListener("touchmove", (e) => {
  if (drawing) {
    const rect = canvas.getBoundingClientRect(); // Get canvas position

    // Adjust touch coordinates
    const x = (e.touches[0].clientX - rect.left) / canvas.width; // normalized
    const y = (e.touches[0].clientY - rect.top) / canvas.height; // normalized

    ctx.lineTo(x, y); // Draw to the new position
    ctx.stroke();

    // Record the new point of the line
    lines[lines.length - 1].push({
      x: x,
      y: y,
      color: ctx.strokeStyle,
      operation: ctx.globalCompositeOperation, // Tracks the operation for this point
    });

    e.preventDefault(); // Prevent default touch interaction
  }
});

canvas.addEventListener("touchend", () => {
  drawing = false;
  console.log(lines);
});

function undoLastLine() {
  if (lines.length > 0) {
    undoLines.push(lines.pop());
    redrawCanvas();
  }
}

function redoLastLine() {
  if (undoLines.length > 0) {
    lines.push(undoLines.pop());
    redrawCanvas();
  }
}

function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

  lines.forEach((line_segments) => {
    ctx.beginPath();
    line_segments.forEach((line, index) => {
      const x = line.x * canvas.width; // denormalize
      const y = line.y * canvas.height; // denormalize
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.size;
      ctx.globalCompositeOperation = line.operation || "source-over"; // Use the saved compositing mode
      ctx.stroke();
    });
    ctx.closePath();
  });

  // Reset to normal drawing mode after redraw
  ctx.globalCompositeOperation = "source-over";
}

function zoomIn() {
  zoomLevel = Math.min(zoomLevel + 0.25, 5);
  coloringPage.style.transform = `scale(${zoomLevel})`;
}

function zoomOut() {
  zoomLevel = Math.max(zoomLevel - 0.25, 0.5);
  coloringPage.style.transform = `scale(${zoomLevel})`;
}

document.getElementById("undo").addEventListener("click", undoLastLine);
document.getElementById("redo").addEventListener("click", redoLastLine);
document.getElementById("home").addEventListener("click", () => {
  window.location.href = "index.html";
});
document.getElementById("zoom_in").addEventListener("click", zoomIn);
document.getElementById("zoom_out").addEventListener("click", zoomOut);

canvas.addEventListener("mouseup", () => {
  drawing = false;
  console.log(lines);
});

canvas.addEventListener("mouseleave", () => {
  drawing = false;
  console.log(lines);
});

document.querySelectorAll(".size-picker").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".size-picker")
      .forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");
    const size = button.getAttribute("data-size");
    ctx.lineWidth = size;
  });
});

ctx.lineWidth = 10; // Default brush size

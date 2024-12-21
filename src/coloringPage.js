function changeColor(color) {
    ctx.strokeStyle = color;
}

const colorButtons = document.querySelectorAll('.color-picker');
colorButtons.forEach(button => {
    button.addEventListener('click', () => {
    const color = button.getAttribute('data-color');
     changeColor(color);
    });
});

// Eraser tool functionality
const eraser = document.getElementById('eraser');
eraser.addEventListener('click', () => {
    drawing = false; // Stop any ongoing drawing
    ctx.globalCompositeOperation = 'destination-out'; // Activate erase mode
    ctx.lineWidth = 10; // Adjust eraser size to your preference
});

// Reset to normal drawing when a color is selected
colorButtons.forEach(button => {
    button.addEventListener('click', () => {
        const color = button.getAttribute('data-color');
        ctx.globalCompositeOperation = 'source-over'; // Return to normal drawing
        changeColor(color);
    });
});

function getQueryString() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams;
}

const img = getQueryString().get('img');

const coloringPage = document.getElementById('background');
coloringPage.src = "public/" + img;

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

// Drawing functionality
let drawing = false;

let lines = [];
let undoLines = [];

// Adjust canvas size to match container
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    redrawCanvas();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

canvas.addEventListener('mousedown', (e) => {
    undoLines = []; // Clear the redo stack whenever a new stroke starts
    drawing = true;
    ctx.lineWidth = 10; // Set the brush or eraser size
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    
    // Record the current stroke, including whether it's an eraser
    lines.push([{
        x: e.offsetX,
        y: e.offsetY,
        color: ctx.strokeStyle,
        operation: ctx.globalCompositeOperation // Tracks if it's an eraser
    }]);
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        lines[lines.length - 1].push({
            x: e.offsetX,
            y: e.offsetY,
            color: ctx.strokeStyle,
            operation: ctx.globalCompositeOperation // Tracks the operation for this point
        });
    }
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

    lines.forEach(line_segments => {
        ctx.beginPath();
        line_segments.forEach((line, index) => {
            if (index === 0) {
                ctx.moveTo(line.x, line.y);
            } else {
                ctx.lineTo(line.x, line.y);
            }
            
            ctx.strokeStyle = line.color;
            ctx.globalCompositeOperation = line.operation || 'source-over'; // Use the saved compositing mode
            ctx.stroke();
        });
    });

    // Reset to normal drawing mode after redraw
    ctx.globalCompositeOperation = 'source-over';
}

let zoomLevel = 1;

const zoomIn = () => {
    zoomLevel = Math.min(zoomLevel + 0.25, 5);
    coloringPage.style.transform = `scale(${zoomLevel})`;
}

const zoomOut = () => {
    zoomLevel = Math.max(zoomLevel - 0.25, 0.5);
    coloringPage.style.transform = `scale(${zoomLevel})`;
}

document.getElementById('undo').addEventListener('click', undoLastLine);
document.getElementById('redo').addEventListener('click', redoLastLine);
document.getElementById('home').addEventListener('click', () => {
    window.location.href = 'index.html';
});
document.getElementById('zoom_in').addEventListener('click', zoomIn);
document.getElementById('zoom_out').addEventListener('click', zoomOut);

canvas.addEventListener('mouseup', () => {
    drawing = false;
});

canvas.addEventListener('mouseleave', () => {
    drawing = false;
});

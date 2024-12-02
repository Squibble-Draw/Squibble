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

const eraser = document.getElementById('eraser');
eraser.addEventListener('click', () => {
    changeColor('#0000'); // Paint transparent color (idk if this works)
}
);

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
    undoLines = [];
    drawing = true;
    ctx.lineWidth = 10; // Set the brush size here
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    lines.push([{ x: e.offsetX, y: e.offsetY, color: ctx.strokeStyle }]);
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        lines[lines.length - 1].push({ x: e.offsetX, y: e.offsetY, color: ctx.strokeStyle });
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach((line_segments, _) => {
        ctx.beginPath();
        line_segments.forEach((line, index) => {
            if (index === 0) {
                ctx.moveTo(line.x, line.y);
            } else {
                ctx.lineTo(line.x, line.y);
            }
            ctx.strokeStyle = line.color;
            ctx.stroke();
        });
    });
}

document.getElementById('undo').addEventListener('click', undoLastLine);
document.getElementById('redo').addEventListener('click', redoLastLine);
document.getElementById('home').addEventListener('click', () => {
    window.location.href = 'index.html';
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
});

canvas.addEventListener('mouseleave', () => {
    drawing = false;
});

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

// Adjust canvas size to match container
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Drawing functionality
let drawing = false;

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    ctx.lineWidth = 10; // Set the brush size here
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
});

canvas.addEventListener('mouseleave', () => {
    drawing = false;
});

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", (event) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const camera = {
    x: 0,
    y: 0,
    scale: 1,
    getX: function(x) {
        return (canvas.width / 2) + (x - this.x) * this.scale;
    },
    getY: function(y) {
        return (canvas.height / 2) + (y - this.y) * this.scale;
    }
};
const cameraMovementStep = 100;
const cameraScaleStep = 2;

window.addEventListener("keydown", (event) => {
    const key = event.key;
    switch (key) {
        case "ArrowUp":
            camera.y -= cameraMovementStep;
            break;
        case "ArrowDown":
            camera.y += cameraMovementStep;
            break;
        case "ArrowLeft":
            camera.x -= cameraMovementStep;
            break;
        case "ArrowRight":
            camera.x += cameraMovementStep;
            break;
        case "+":
            camera.scale *= cameraScaleStep;
            break;
        case "-":
            camera.scale /= cameraScaleStep;
            break;
    }
});
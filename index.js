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

class Object {
    constructor(x, y, mass, color, vx = 0, vy = 0) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.radius = Math.sqrt(this.mass / Math.PI);
        this.color = color
        this.vx = vx;
        this.vy = vy;
        this.trajectory = [];
        this.isActive = true;
    }

    update() {
        objects.forEach(object => {
            if (object !== this) {
                let dx = object.x - this.x;
                let dy = object.y - this.y;

                let distance = Math.max(Math.sqrt((dx * dx) + (dy * dy)), 1);

                if (this.radius + object.radius > distance) {
                    if (this.mass >= object.mass) {
                        let vx = ((this.mass * this.vx) + (object.mass * object.vx)) / (this.mass + object.mass);
                        let vy = ((this.mass * this.vy) + (object.mass * object.vy)) / (this.mass + object.mass);

                        this.mass += object.mass;
                        this.radius = Math.sqrt(this.mass / Math.PI);
                        object.isActive = false;

                        this.vx += vx;
                        this.vy += vy;
                    }

                    return;
                }

                const g = 1;

                let f = g * (this.mass * object.mass) / (distance * distance);

                let fx = f * (dx / distance);
                let fy = f * (dy / distance);

                let vx = fx / this.mass;
                let vy = fy / this.mass;

                this.vx += vx;
                this.vy += vy;
            }
        });

        this.trajectory.push({
            x: this.x,
            y: this.y
        });

        this.applyVelocity();
    }

    applyVelocity() {
        this.x += this.vx;
        this.y += this.vy;
    }

    render() {
        ctx.beginPath();
        ctx.arc(camera.getX(this.x), camera.getY(this.y), this.radius * camera.scale, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    renderTrajectory() {
        ctx.beginPath();

        let isFirst = true;

        this.trajectory.forEach(trajectoryPoint => {
            if (isFirst === true) {
                ctx.moveTo(camera.getX(trajectoryPoint.x), camera.getY(trajectoryPoint.y));
            } else {
                ctx.lineTo(camera.getX(trajectoryPoint.x), camera.getY(trajectoryPoint.y));
            }

            isFirst = false;
        });
        ctx.strokeStyle = "#333";
        ctx.stroke();
    }
}

let objects = [
    new Object(0, 0, 10000, "#00f"),
    new Object(200, 0, 500, "#f00", 0, 7),
];

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    objects = objects.filter(object => object.isActive === true);

    objects.forEach(object => {
        object.renderTrajectory();
    });

    objects.forEach(object => {
        object.update();

        object.render();
    });

    requestAnimationFrame(update);
}

update();
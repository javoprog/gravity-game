const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", (event) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

let keys = {
    "ArrowUp": false,
    "ArrowDown": false,
    "ArrowLeft": false,
    "ArrowRight": false
};

const cameraMovementStep = 10;
const cameraScaleStep = 2;
const cameraAnimationLength = 10;
const camera = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    scale: 1,
    smoothScale: 1,
    getX(x) {
        return (canvas.width / 2) + (x - this.x) * this.smoothScale;
    },
    getY(y) {
        return (canvas.height / 2) + (y - this.y) * this.smoothScale;
    },
    getScale() {
        return this.smoothScale;
    },
    update() {
        if (keys["ArrowUp"] !== keys["ArrowDown"]) {
            if (keys["ArrowUp"]) {
                this.vy = -cameraMovementStep;
            } else if (keys["ArrowDown"]) {
                this.vy = cameraMovementStep;
            }
        } else {
            this.vy = 0;
        }

        if (keys["ArrowLeft"] !== keys["ArrowRight"]) {
            if (keys["ArrowLeft"]) {
                this.vx = -cameraMovementStep;
            } else if (keys["ArrowRight"]) {
                this.vx = cameraMovementStep;
            }
        } else {
            this.vx = 0;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.smoothScale > this.scale) {
            this.smoothScale -= Math.abs(this.scale - this.smoothScale) / cameraAnimationLength;
        } else if (this.smoothScale < this.scale) {
            this.smoothScale += Math.abs(this.scale - this.smoothScale) / cameraAnimationLength;
        }
    }
};

window.addEventListener("keydown", (event) => keys[event.key] = true);
window.addEventListener("keyup", (event) => keys[event.key] = false);

window.addEventListener("keydown", (event) => {
    const key = event.key;
    switch (key) {
        case "+":
            if (Math.abs(camera.scale - camera.smoothScale) < cameraScaleStep) {
                camera.scale *= cameraScaleStep;
            }
            break;
        case "-":
            if (Math.abs(camera.scale - camera.smoothScale) < cameraScaleStep) {
                camera.scale /= cameraScaleStep;
            }
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
                        inactiveObjects.push(object);

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
        ctx.arc(camera.getX(this.x), camera.getY(this.y), this.radius * camera.getScale(), 0, Math.PI * 2);
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

let inactiveObjects = [];

let objects = [
    new Object(0, 0, 10000, "#00f"),
    new Object(200, 0, 500, "#f00", 0, 7),
];

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    camera.update();

    objects = objects.filter(object => object.isActive === true);

    objects.forEach(object => {
        object.renderTrajectory();
    });

    inactiveObjects.forEach(object => {
        object.renderTrajectory();
    });

    objects.forEach(object => {
        object.update();

        object.render();
    });

    requestAnimationFrame(update);
}

update();
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const WIDTH = 800;
const HEIGHT = 800;

const intro = new Audio();
intro.src = './Game Intro audio .mov';
intro.addEventListener("canplaythrough", () => {
    intro.play();
});

let played = false;

intro.addEventListener('play', () => {
    played = true;
});

intro.addEventListener('ended', () => {
    document.querySelector('.start').classList.remove('start');
})

document.addEventListener('click', () => {
    if(played) return;
    played = true;
    intro.play();
})


canvas.width = WIDTH;
canvas.height = HEIGHT;

ctx.shadowColor = 'hsl(219, 100%, 85%)';
ctx.fillStyle = 'hsl(219, 27%, 41%)';
ctx.strokeStyle = 'hsl(219, 27%, 41%)';
ctx.globalCompositeOperation = "lighter";
ctx.shadowBlur = 10;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;
ctx.lineWidth = 10;
ctx.lineCap = 'round';

class Dot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 35;
        this.on = false;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
        this.on = true;
    }
}

const dots = [];
const dotPositions = [];
for(let i=0; i<5; i++) {
    for(let j=0; j<5; j++) {
        dotPositions.push([j,i]);
        dots.push(new Dot(80 + 160 * j, 80 + i * 160));
    }
}

const dotDiv = document.querySelectorAll('.dot');
dotDiv.forEach((dot, index) => {
    dot.addEventListener('click', () => dotClick(index));
})

const start = {
    start: false,
    index: 0,
    x: 0,
    y: 0,
}

const end = {
    x: 0,
    y: 0,
}

const lines = [];

const newLine = (start, end) => ({startX: start.x, startY: start.y, endX: end.x, endY: end.y});

const clicksDiv = document.querySelector('.clicks');
let clicks = 5;
let tries = 0;
let step = 0;

const dotClick = (index) => {
    if(step > 0) step++;
    if(step === 2) {
        dotDiv[16].classList.remove('step');
        dotDiv[1].classList.add('step');
    }
    if(step === 3) {
        dotDiv[1].classList.remove('step');
        dotDiv[19].classList.add('step');
    }
    if(step === 4) {
        dotDiv[19].classList.remove('step');
        dotDiv[16].classList.add('step');
    }
    if(step === 5) {
        dotDiv[16].classList.remove('step');
        dotDiv[8].classList.add('step');
    }
    if(step === 6) win();
    clicks--;
    clicksDiv.innerHTML = clicks;
    if(clicks === 0) {
        check();
        return;
    }
    if(!start.start) {
        start.x = dots[index].x;
        start.y = dots[index].y;
        start.index = index;
        start.start = true;
        if(!dotDiv[index].classList[1] && !dots[index].on) dots[index].draw();
    } else {
        end.x = dots[index].x;
        end.y = dots[index].y;
        if(start.x === end.x && start.y === end.y) return;
        lines.push(newLine(start, end));
        drawLine(lines[lines.length - 1]);
        if(!dotDiv[index].classList[1] && !dots[index].on) dots[index].draw();
        lookFor(index);
        start.x = dots[index].x;
        start.y = dots[index].y;
        start.index = index;
    }
}

function lookFor(index) {
    let x1 = dotPositions[start.index][0];
    let y1 = dotPositions[start.index][1];
    let x2 = dotPositions[index][0];
    let y2 = dotPositions[index][1];

    if(y1 === y2 && Math.abs(x1 - x2) > 1) {
        let start = x1 > x2 ? x2 : x1;
        let end = x1 > x2 ? x1 : x2;
        while(start !== end - 1) {
            start++;
            if(!dotDiv[start + y1 * 5].classList[1] && !dots[start + y1 * 5].on) dots[start + y1 * 5].draw();
        }
    }

    if(x1 === x2 && Math.abs(y1 - y2) > 1) {
        let start = y1 > y2 ? y2 : y1;
        let end = y1 > y2 ? y1 : y2;
        while(start !== end - 1) {
            start++;
            if(!dotDiv[x1 + start * 5].classList[1] && !dots[x1 + start * 5].on) dots[x1 + start * 5].draw();
        }
        return;
    }

    let width = Math.abs(x1 - x2);
    let height = Math.abs(y1 - y2);

    let p = width / height;

    if(p === 1) {
        let move = Math.abs(x1 - x2) - 1;
        let x = x1;
        let y = y1;
        let xM = x1 - x2 > 0 ? -1 : 1;
        let yM = y1 - y2 > 0 ? -1 : 1;
        for(let i=0; i<move; i++) {
            x+=xM;
            y+=yM;
            if(!dotDiv[x + y * 5].classList[1] && !dots[x + y * 5].on) dots[x + y * 5].draw();
        }
        return;
    }

    let xMove = Math.abs(x1 - x2) - 1;
    let yMove = Math.abs(y1 - y2) - 1;
    let startX = x1 > x2 ? x2 : x1;
    let startY = y1 > y2 ? y2 : y1;

    let x = startX;
    let y = startY;
    let w = 0;
    let h = 0;
    for(let i=1; i<=xMove; i++) {
        x++;
        for(let j=1; j<=yMove; j++) {
            y++;
            w = Math.abs(startX - x);
            h = Math.abs(startY - y);
            if(!dotDiv[x + y * 5].classList[1] && w/h === p && !dots[x + y * 5].on) dots[x + y * 5].draw();
        }
        y-=yMove;
    }
}

const drawLine = ({startX, startY, endX, endY}) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

const check = () => {
    let points = 0;
    dots.forEach((dot, index) => {
        if(!dotDiv[index].classList[1] && dot.on) points++;
    });
    if(points < 9) {
        restart();
        return;
    }
    win();
}

const restart = () => {
    lines.length = 0;
    clicks = 5;
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    start.start = false;
    tries++;
    dots.forEach((dot) => {
        dot.draw();
        dot.on = false;
    });
    setTimeout(() => {
        ctx.clearRect(0,0,WIDTH,HEIGHT);
        if(tries === 3) alert('Think outside the Box!');
        if(tries === 5) {
            alert('Check Bits Status');
            step = 1;
            dotDiv[16].classList.add('step');
        }
    }, 300);
}

const win = () => {
    document.querySelector('.code').classList.remove('hide');
    document.querySelector('.show').classList.add('hide');
}
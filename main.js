var mouseClick = false;
var pe;
var padx;
var pady;
var padAngle = 0;
var speed = 1;
var bulletCount = 50;

function calcDistance(a, b) {
    return Math.sqrt((a * a) + (b * b));
}

function getAangle(x, y, tx, ty) {
    var dx = tx - x;
    var dy = ty - y;
    var angle = Math.atan2(dy, dx);
    return angle;
}


$('#pad').bind('mousedown touchstart', function(e){
    e.preventDefault();
    mouseClick = true;
    pe = e;
})

$(document).bind('mouseup touchend', function(e){
    mouseClick = false;
    var joystick = document.getElementById('joystick');
    joystick.style.left = "50%";
    joystick.style.top = "50%";
    padAngle = 0;
})

$('body').bind('mousemove touchmove', function (e) {
    if (mouseClick) {
        var joystick = document.getElementById('joystick');
        var padRect = document.getElementById('pad').getBoundingClientRect();
        var out = false;
        if(e.pageX == undefined || e.offsetX == undefined){
            e.pageX = e.originalEvent.touches[0].pageX;
            e.pageY = e.originalEvent.touches[0].pageY;
            e.offsetX = e.originalEvent.touches[0].pageX - e.target.getBoundingClientRect().left;
            e.offsetY = e.originalEvent.touches[0].pageY - e.target.getBoundingClientRect().top;
            if(calcDistance((e.target.offsetWidth / 2 - e.offsetX), (e.target.offsetHeight / 2 - e.offsetY)) <= e.target.offsetWidth / 2){
                out = true;
            }
        }else{
            out = e.target.id == 'pad';
        }
        padAngle = getAangle(padRect.x + (pe.target.offsetWidth / 2), padRect.y + (pe.target.offsetHeight / 2), e.pageX, e.pageY);
        padx = Math.cos(padAngle) * pe.target.offsetWidth / 2;
        pady = Math.sin(padAngle) * pe.target.offsetHeight / 2;
        if (out) {
            padAngle = getAangle(e.target.offsetWidth / 2, e.target.offsetHeight / 2, e.offsetX, e.offsetY);
            padx = Math.cos(padAngle) * calcDistance((e.target.offsetWidth / 2 - e.offsetX), (e.target.offsetHeight / 2 - e.offsetY))
            pady = Math.sin(padAngle) * calcDistance((e.target.offsetWidth / 2 - e.offsetX), (e.target.offsetHeight / 2 - e.offsetY))
        }
        if(calcDistance(padx, pady) / (pe.target.offsetWidth / 2) * 3 > 0.3){
            speed = calcDistance(padx, pady) / (pe.target.offsetWidth / 2) * 3
        }else{
            speed = 0;
        }
        joystick.style.left = (pe.target.offsetWidth / 2 + padx) + "px";
        joystick.style.top = (pe.target.offsetHeight / 2 + pady) + "px";
    }
})



class Main {
    constructor() {
        this.canvas = document.createElement('canvas');
        document.getElementById('canvas').appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        window.addEventListener('resize', this.resize.bind(this));
        this.resize();
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.bullets = [];
        this.tick = 0;
        for (var i = 0; i < 20; i++) {
            this.bullets.push(new Butllet(this.ctx));
        }
        window.addEventListener('keydown', this.keyPress.bind(this));
        window.addEventListener('keyup', this.keyUp.bind(this));
        window.requestAnimationFrame(this.animate.bind(this));
        this.plane = new Plane(this.ctx, 175, 175);
    }

    resize() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.width = document.getElementById('canvas').clientWidth;
        this.canvas.height = document.getElementById('canvas').clientHeight;
        this.ctx.width = this.canvas.width;
        this.ctx.height = this.canvas.height;
    }

    animate() {
        this.tick++;
        var joystick = document.getElementById('joystick');
        window.requestAnimationFrame(this.animate.bind(this));
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.plane.render();

        for (var i = 0; i < this.bullets.length; i++) {
            if(this.bullets[i].fromx < -11 || this.bullets[i].fromx > this.canvas.width + 11 || this.bullets[i].fromy < - 11 || this.bullets[i].fromy > this.canvas.height + 11){
                this.bullets[i] = new Butllet(this.ctx);
            }
            if(calcDistance(this.bullets[i].fromx - this.plane.x, this.bullets[i].fromy - this.plane.y) < this.plane.radius){
                var al = alert('You Died!\n'+$('#score').html());
                this.left = false;
                this.right = false;
                this.up = false;
                this.down = false;
                this.bullets = [];
                this.tick = 0;
                mouseClick = false;
                padAngle = 0;
                speed = 0;
                for (var i = 0; i < 20; i++) {
                    this.bullets.push(new Butllet(this.ctx));
                }
                this.plane = new Plane(this.ctx, 175, 175);
                $('#bulletCount').html("Bullet : 20");
                $('#score').html("Score : 0");
                break;
            }
            this.bullets[i].render();
        }        
        if(this.tick % 100 == 0){
            this.bullets.push(new Butllet(this.ctx));
            $('#bulletCount').html("Bullet : " + this.bullets.length);
        }
        if(this.tick % 10 == 0){
            $('#score').html("Score : " + this.tick / 10);
        }
        let horizental = this.left ? -1 : this.right ? 1 : 0;
        let vertical = this.up ? -1 : this.down ? 1 : 0;
        let padR = $('#pad').width() / 2;
        if(horizental != 0 || vertical != 0){
            padx = padR  + (horizental * padR );
            pady = padR  + (vertical * padR );
            if(horizental == 1){
                pady = padR  - 0.1 + (vertical * padR );
            }
            padAngle = getAangle(padR ,padR , padx, pady);
            if(horizental != 0 && vertical != 0){
                padx = padR + (padR / Math.sqrt(2) * horizental);
                pady = padR + (padR / Math.sqrt(2) * vertical);
            }
            speed = 3;
            joystick.style.left = padx + "px";
            joystick.style.top = pady + "px";
        }else{
            if(!mouseClick){
                joystick.style.left = padR  + "px";
                joystick.style.top = padR  + "px";
                padAngle = 0;
            }
        }
    }

    keyPress(e) {
        if (e.keyCode == 37) {
            this.left = true
        } else if (e.keyCode == 39) {
            this.right = true;
        }
        if (e.keyCode == 38) {
            this.up = true;
        } else if (e.keyCode == 40) {
            this.down = true;
        }
    }

    keyUp(e) {
        if (e.keyCode == 37) {
            this.left = false;
        } else if (e.keyCode == 39) {
            this.right = false;
        }
        if (e.keyCode == 38) {
            this.up = false;
        } else if (e.keyCode == 40) {
            this.down = false;
        }
    }
}

class Plane {
    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.radius = 5;
    }
    render() {
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        if(padAngle == 0){
            this.x = this.x;
            this.y = this.y;
        }else{
            if(speed < 1){
                speed = 1;
                
            }
            if(this.x + Math.cos(padAngle) * speed > this.radius && this.x + Math.cos(padAngle) * speed < ctx.width - this.radius){
                this.x = this.x + Math.cos(padAngle) * speed;
            }
            if(this.y + Math.sin(padAngle) * speed > this.radius && this.y + Math.sin(padAngle) * speed < ctx.height - this.radius){
                this.y = this.y + Math.sin(padAngle) * speed;
            }
        }
        ctx.fillStyle = '#000';
        ctx.arc(this.x, this.y, this.radius, 0, 360);
        ctx.fill();
        ctx.restore();
    }
}

class Butllet {
    constructor(ctx) {
        this.ctx = ctx;
        this.x = 0;
        this.y = 0;
        var rand = Math.floor(Math.random() * 4);
        this.speed = Math.floor(Math.random() * 3) + 1;
        if(rand == 0){ //bottom
            this.fromx = Math.floor(Math.random() * document.getElementById('canvas').clientWidth);
            this.fromy = document.getElementById('canvas').clientHeight + 10;
            this.tox = Math.floor(Math.random() * document.getElementById('canvas').clientWidth) * 1.5;
            this.toy = -20;
        }else if(rand == 1){ //top
            this.fromx = Math.floor(Math.random() * document.getElementById('canvas').clientWidth);
            this.fromy = - 10;
            this.tox = Math.floor(Math.random() * document.getElementById('canvas').clientWidth) * 1.5;
            this.toy = document.getElementById('canvas').clientHeight + 20;
        }else if(rand == 2){ //left
            this.fromx = - 10;
            this.fromy = Math.floor(Math.random() * document.getElementById('canvas').clientHeight);
            this.tox = document.getElementById('canvas').clientWidth + 20;
            this.toy = Math.floor(Math.random() * document.getElementById('canvas').clientHeight) * 1.5;
        }else if(rand == 3){ //right
            this.fromx = document.getElementById('canvas').clientWidth + 10;
            this.fromy = Math.floor(Math.random() * document.getElementById('canvas').clientHeight);
            this.tox = -20
            this.toy = Math.floor(Math.random() * document.getElementById('canvas').clientHeight) * 1.5;
        }
    }
    render() {
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = '#f00';
        let angle = getAangle(this.fromx, this.fromy, this.tox, this.toy);
        this.fromx += Math.cos(angle) * this.speed;
        this.fromy += Math.sin(angle) * this.speed;
        ctx.arc(this.fromx, this.fromy, 1, 0, 360);
        ctx.fill();
        ctx.restore();
    }
}

window.onload = () => {
    new Main();
}
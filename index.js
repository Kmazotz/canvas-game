const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const score = document.querySelector('span#game-punctuation');
const modalRestart = document.querySelector('div#game-over');
const restart = document.querySelector('button#restartGame');

const modalStart = document.querySelector('div#game-start');
const start = document.querySelector('button#startGame');

const getNickName = document.querySelector('input#nickname');

let NickName = "NickName";

//#region sizes
canvas.width = innerWidth;
canvas.height = innerHeight;
//#endregion

//#region Player
class Player {

    constructor(x, y, color, radius){
        this.x = x;
        this.y = y;

        this.radius = radius;
        this.color = color;
    }

    /**
     * Draw player with characteristics
     */
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        
        ctx.fill();
    }
}

class Projectile{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;

        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        
        ctx.fill();
    }

    update(){
        this.draw()

        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;

        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        
        ctx.fill();
    }

    update(){
        this.draw()

        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Particle{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;

        this.color = color;
        this.velocity = velocity;
        this.Alpha = 1;
    }

    draw(){
        ctx.save();
        ctx.globalAlpha = this.Alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        
        ctx.fill();
        ctx.restore();
    }

    update(){
        this.draw()

        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.Alpha -= 0.01
    }
}

/**
 * Player attributes
 */
const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 'white', 10);

let projectiles = [];
let particles = [];
let Enemies = [];

function init(){
    player = new Player(x, y, 'white', 10);

    projectiles = [];
    particles = [];
    Enemies = [];
    
    document.querySelector('p#game-nick-name').innerHTML = NickName;
    score.innerHTML = 0;
    
}

/**Enemies settings */

function spawnEnemies(){
    setInterval(() => {

        const random = Math.random() * 30;

        const radius = (random < 15) ? 15 : random;

        let x;
        let y;

        if( Math.random() < 0.5 ){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random * canvas.height;;
        }else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

        const angle = Math.atan2(canvas.height / 2  - y, canvas.width / 2 - x);

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        Enemies.push(new Enemy(x, y, radius, color, velocity));

    }, 1000);
}

let animationId;
let punctuation = 0;

function animate(){
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.draw();

    particles.forEach((particle, particleIndex) => {

        if(particle.Alpha <= 0){
            particles.splice(particleIndex, 1);
        }else{
            particle.update();
        }

    });

    projectiles.forEach((projectile, index) => {
        projectile.update();

        if(
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ){
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
    });

    Enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

         /**
         * When enemy touch player.
         */
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        if(dist - enemy.radius - player.radius < 1){
            modalRestart.classList.add('active');
            document.querySelector('h2#game-over-score').innerHTML = punctuation;
            cancelAnimationFrame(animationId);
        }

        projectiles.forEach((projectile, ProjectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            if(dist - enemy.radius - projectile.radius < 1)
            {
                //Draw explossion.
                for (let i = 0; i < 8; i++) {

                    particles.push(new Particle(
                        projectile.x, 
                        projectile.y, 
                        Math.random() * 2, 
                        enemy.color, 
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 8),
                            y: (Math.random() - 0.5) * (Math.random() * 8)
                        }
                    ))                    
                }

                if(enemy.radius - 10 > 10){

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    });

                    setTimeout(() => {
                        projectiles.splice(ProjectileIndex, 1);
                    }, 0);

                    //Increase our puntuation.
                    punctuation += 1;
                    score.innerHTML = punctuation;

                }else{
                    setTimeout(() => {
                        Enemies.splice(enemyIndex, 1);
                        projectiles.splice(ProjectileIndex, 1);
                    }, 0);

                    //remove from escene.
                    punctuation += 5;
                    score.innerHTML = punctuation;
                }
                
            }
        });
    });
}

window.addEventListener('click', (e) => {

    const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2);

    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }

    projectiles.push(new Projectile(x, y, 5, 'white', velocity));
});

restart.addEventListener('click', () => {
    punctuation = 0;
    modalRestart.classList.remove('active');
    init();
    animate();
    spawnEnemies();
});

start.addEventListener('click', () => {
    if( getNickName.value === ''){
        setTimeout(() =>{
            getNickName.classList.add('error')
        }, 0)
        
        setTimeout(() =>{
            getNickName.classList.remove('error')
        }, 500)
        
    }else{
        NickName = getNickName.value;
        modalStart.classList.remove('active');
        init();
        animate();
        spawnEnemies();
    }

});




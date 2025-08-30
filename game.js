import { Simple1DNoise } from "./helpers/perlin.js";
import { Player } from "./helpers/player.js";
import { RocketParticleSystem } from "./helpers/rocket.js";
import { make_sky } from "./helpers/sky.js";
import { make_asteroid } from "./helpers/asteroid.js";
import { collisionSAT } from "./helpers/collisions.js";
import { INITIAL_FUEL, MIN_HEIGHT_DUST, SPAWN_ASTEROID_PROB } from "./settings.js";

export class Game {
  perlin = new Simple1DNoise();

  camera_offset = { x: 0, y: 0 };
  goUp = false;
  xRotation = 0;
  attractPoint = [0, 0];
  dead = false;
  dead_time = 0;
  mouse_coord = { x: 0, y: 0 };
  is_boosting = 0;
  asteroids = [];
  player_particles = 500;

  pageNeeded = 0;

  constructor(canvas, ctx, player_weight, boost_duration, player_vel){
    this.canvas = canvas
    this.particles = new RocketParticleSystem(ctx);
    this.sky = make_sky(ctx, 40);
    this.player = new Player(ctx, 10, 1, 25, 50, "#929990", player_weight, INITIAL_FUEL);
    this.boost_time = boost_duration;
    this.player_gas = { y: 160 / player_vel, x: 180 / player_vel };

    this.player.move(0, -400);
  }
  handleKeyDown(e){
    if ((e.key == "w" || this.goUp) && this.player.fuel > 0) this.goUp = true;
    if (e.key == "Shift" && this.boost_time > 0) this.is_boosting = true;
  }
  handleKeyUp(e){
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") this.xRotation = 0;
    else if (e.key == "Shift") this.is_boosting = false;
    else {
      this.goUp = false;
    }

  }
  rocket_up (increment=1.0) {
    this.player.force.x += (Math.sin(this.player.totalRotation) / this.player_gas.x) * increment;
    this.player.force.y -= (Math.cos(this.player.totalRotation) / this.player_gas.y) * increment;
    this.player.fuel -= 1;
    this.goUp = true;
  };

  handleMouseMovement(e){
    this.mouse_coord.x = e.clientX;
    this.mouse_coord.y = e.clientY;
  }
  generate(){
    //if (this.asteroids.length != 0) return;
    if (Math.random() > (1.0 - SPAWN_ASTEROID_PROB)) 
      this.asteroids.push(make_asteroid({ x: this.player.x, y: this.player.y }));
  }
  generateAttractPoints(){
    return [
      this.perlin.getVal(this.player.lst[1][0] / 200) * 500 + this.camera_offset.y,
      this.perlin.getVal(this.player.lst[2][0] / 200) * 500 + this.camera_offset.y,
      this.perlin.getVal(this.player.lst[0][0] / 200) * 500 + this.camera_offset.y,
    ];
  }
  initDiedAnimation() {
    for (let i = 0; i < this.player_particles; i++) {
      this.particles.emit(
        {
          x: this.player.lst[3][0] + this.camera_offset.x,
          y: this.player.lst[3][1] + this.camera_offset.y,
        },
        { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 },
        i % 2 == 0 ? "#916846" : "#929990",
      );
    }
    this.dead = true;
    //window.location.href = "game.html";
  }

  update(dt=1){
    if (this.dead){
      this.generate()
      this.particles.update();
      return;
    };

    this.camera_offset = {
      x: -this.player.x + this.canvas.width / 2,
      y: -this.player.y + this.canvas.height / 2,
    };
    this.player.rotate_with({
      x: -this.mouse_coord.x + this.canvas.width / 2,
      y: -this.mouse_coord.y + this.canvas.height / 2,
    });

    let attractPoint = this.generateAttractPoints();
    if (this.player.checkFloorCollision(attractPoint, this.camera_offset)){
      if (this.player.isInRightPosition(attractPoint, this.camera_offset)){
        this.pageNeeded = 1 // Tells the bro to go to the winning html page
      }else if (!this.dead) {
        this.initDiedAnimation();
        this.pageNeeded = 2 // Dying animation
      }
    }
    this.boost_time += dt * (this.is_boosting ? -1 : 0.1);
    if (this.boost_time < -10) this.boost_time = -10;
    if (this.boost_time > this.boost_duration) this.boost_time = this.boost_duration;
    //console.log(is_boosting, boost_time);
    if (this.goUp && this.player.fuel > 0) {
      this.rocket_up(dt * (this.is_boosting && this.boost_time > 0 ? 4.0 : 1.0));
      this.particles.emit(
        {
          x: this.player.lst[3][0] + this.camera_offset.x,
          y: this.player.lst[3][1] + this.camera_offset.y,
        },
        { x: -Math.sin(this.player.totalRotation), y: Math.cos(this.player.totalRotation) },
        this.is_boosting && this.boost_time > 0 ? "#cc9e78" : "#916846",
        { x: -this.player.force.x, y: -this.player.force.y },
        this.is_boosting && this.boost_time > 0 ? 2.3 : 1.0,
      );
      let attractPoint = this.generateAttractPoints();
      if ((attractPoint[1]- (this.player.lst[1][1] + this.camera_offset.y) < MIN_HEIGHT_DUST) && Math.abs(this.player.totalRotation) < 0.6){
        console.log(this.player.lst[1][1] + this.camera_offset.y - attractPoint[1]);
        let howNear = (attractPoint[1]- (this.player.lst[1][1] + this.camera_offset.y))/20;
        for (let i = 0; i < 3; i++) {
          let t = Math.random()
          this.particles.emit(
            {
              x: this.player.lst[0][0]*t + this.player.lst[3][0]*(1-t)  + this.camera_offset.x,
              y: attractPoint[0]*t + attractPoint[2]*(1-t) + 0.1
            },
            { x: -Math.sin(this.player.totalRotation), y: Math.cos(this.player.totalRotation) },
            "#fafaff",
            { x: 2.0*(this.player.force.x + (2.0*Math.random()-1))/howNear, y: -0.5 },
            1.0,
          )
        }
      }

    }
    this.asteroids.forEach((asteroid) => {
      const asteroid_shape = asteroid.getShape(this.camera_offset);
      const intersection = collisionSAT(asteroid_shape, this.player.getShapePosition(this.camera_offset));
      if ( intersection != 10000 ){
        this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
        this.initDiedAnimation()
      }

      //console.log(asteroid.points, this.player.getShapePosition(this.camera_offset), intersection);
      if ( asteroid.update(this.perlin, dt) ){
        this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
        let center = { x: 0, y: 0 };
        asteroid_shape.forEach(element => {
          center.x += element.x;
          center.y += element.y;
        });
        center.x /= asteroid_shape.length;
        center.y /= asteroid_shape.length;
        
        for (let i = 0; i < 100; i++) {
          this.particles.emit(
            {
              x: center.x,
              y: center.y
            },
            { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 },
            i % 2 == 0 ? "#fafaff" : "#929990",
          );
        }
      }


    });

    this.generate()
    this.player.update(dt);
    this.particles.update();
  }


  drawTerrain(ctx){
    ctx.beginPath();
    ctx.moveTo(this.player.x > 0 ? -this.player.x : -this.camera_offset.x, this.canvas.height);
    // i made this to always start at a number divisible by 40, in this way the starting point of each line don't change at each offset
    let start_pos = -Math.floor(this.camera_offset.x / 40) * 40 - 40;
    for (let i = start_pos; i < canvas.width + this.player.x; i += 40)
      ctx.lineTo(
        i + this.camera_offset.x,
        this.perlin.getVal(i / 200) * 500 + this.camera_offset.y,
      );
    ctx.lineTo(
      this.canvas.width + (this.player.x > 0 ? this.player.x : this.camera_offset.x),
      this.canvas.height,
    );
    ctx.closePath();
    ctx.fillStyle = "#121211";
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }


  drawText(ctx){
    if (this.died) return
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Fuel: " + this.player.fuel, 10, 30);
    ctx.fillText(
      "Y-velocity: " + -Math.floor(this.player.force.y * 100) / 100,
      10,
      60,
    );

  }


  draw(ctx){
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#1c1c1b";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.dead) {
      this.dead_time += 0.5;
      this.camera_offset.y -= 0.5 * (this.dead_time / 100);
      this.sky.draw(this.camera_offset);
      this.particles.draw()
      this.drawTerrain(ctx);
      return
    }

    this.sky.draw(this.camera_offset);
    this.player.draw(this.camera_offset);
    this.particles.draw();
    this.asteroids.forEach((asteroid) => {
      asteroid.draw(ctx, this.camera_offset);
    });

    this.drawTerrain(ctx);
  }



}

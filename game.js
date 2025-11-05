import { getBiome, getFloorValue, Simple1DNoise } from "./helpers/perlin.js";
import { Player } from "./helpers/player.js";
import { RocketParticleSystem } from "./helpers/rocket.js";
import { make_sky } from "./helpers/sky.js";
import { make_asteroid } from "./helpers/asteroid.js";
import { collisionSAT } from "./helpers/collisions.js";
import { biomeData, INITIAL_FUEL, MIN_HEIGHT_DUST, N_DIFFERENT_TREES, PROB_TREE, SATResult, SPAWN_ASTEROID_PROB } from "./settings.js";
import { make_tree } from "./helpers/trees.js";
import { make_vector2d, vector2Distance } from "./helpers/Vector2.js";
import { Rover } from "./helpers/Rover.js";




export class Game {
  perlin = new Simple1DNoise();
  tree_perlin = new Simple1DNoise();

  camera_offset = { x: 0, y: 0 };
  goUp = false;
  xRotation = 0;
  attractPoint = [0, 0];
  dead = false;
  dead_time = 0;
  mouse_coord = { x: 0, y: 0 };
  is_boosting = 0;

  asteroids = [];
  trees = [];

  player_particles = 500;
  pageNeeded = 0;
  total_time = 0.0;
  width = 0.0;

  constructor(canvas, ctx, player_weight, boost_duration, player_vel){
    this.width = canvas.width;

    this.canvas = canvas
    this.particles = new RocketParticleSystem(ctx);
    this.sky = make_sky(ctx, 40);

    const pos_y = getFloorValue(this.perlin, 10.0)-600;
    this.player = new Player(10, pos_y, 25, 50, "#929990", player_weight, INITIAL_FUEL, { y: 160 / player_vel, x: 180 / player_vel });
    this.boost_time = boost_duration;

    for (let i = 0; i < N_DIFFERENT_TREES; i++)
      this.trees.push(make_tree(
        Math.PI/3 + 0.5*(Math.random()-0.5), //0.5 + Math.random()*(Math.PI-0.5), 
        70, 
        3 + Math.floor(Math.random()*4), 1.2 + Math.random()/2.0));

    this.rover = new Rover({x: 0.0, y: 100});
    this.camera_offset = make_vector2d(-this.player.pos.x + this.canvas.width / 2.0, -this.player.pos.y + this.canvas.height / 2);
  }

  reset(ctx, player_weight, boost_duration, player_vel){
    this.camera_offset = { x: 0, y: 0 };
    this.goUp = false;
    this.xRotation = 0;
    this.attractPoint = [0, 0];
    this.dead = false;
    this.dead_time = 0;
    this.mouse_coord = { x: 0, y: 0 };
    this.is_boosting = 0;

    this.asteroids = [];
    this.trees = [];

    this.player_particles = 500;
    this.pageNeeded = 0;
    this.total_time = 0.0;

    this.particles = new RocketParticleSystem(ctx);
    this.sky = make_sky(ctx, 40);

    const pos_y = getFloorValue(this.perlin, 10.0)-600;
    this.player = new Player(10, pos_y, 25, 50, "#929990", player_weight, INITIAL_FUEL, { y: 160 / player_vel, x: 180 / player_vel });
    this.boost_time = boost_duration;

    for (let i = 0; i < N_DIFFERENT_TREES; i++)
      this.trees.push(make_tree(
        Math.PI/3 + 0.5*(Math.random()-0.5), //0.5 + Math.random()*(Math.PI-0.5), 
        70, 
        3 + Math.floor(Math.random()*4), 1.2 + Math.random()/2.0));

    const pos_x = getFloorValue(this.perlin, 0.0);
    this.player.updatePosition(make_vector2d(0.0, pos_x-1200.0));   //move(0, -400);
    this.rover = new Rover({x: 0.0, y: 100});
    this.camera_offset = make_vector2d(-this.player.pos.x + this.canvas.width / 2.0, -this.player.pos.y + this.canvas.height / 2);
  }


  handleKeyDown(e){
    if ((e.key == "w" || this.player.goUp) && this.player.fuel > 0) this.player.goUp = true;
    if (e.key == "Shift" && this.boost_time > 0) this.is_boosting = true;
  }
  handleKeyUp(e){
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") this.xRotation = 0;
    else if (e.key == "Shift") this.is_boosting = false;
    else {
      this.player.goUp = false;
    }

  }

  handleMouseMovement(e){
    this.mouse_coord.x = e.clientX;
    this.mouse_coord.y = e.clientY;
  }
  generate(){
    const b = getBiome(this.player.pos.x);
    if (Math.random() > (1.0 - SPAWN_ASTEROID_PROB - biomeData[b].da)) 
      this.asteroids.push(make_asteroid({ x: this.player.pos.x, y: this.player.pos.y }));
  }
  generateAttractPoints(){
    return [
      getFloorValue(this.perlin, this.player.tShape[1].x),
      getFloorValue(this.perlin, this.player.tShape[2].x),
      getFloorValue(this.perlin, this.player.tShape[0].x),
    ];
  }
  initDiedAnimation() {
    for (let i = 0; i < this.player_particles; i++) {
      this.particles.emit(
        {
          x: this.player.tShape[3].x ,
          y: this.player.tShape[3].y ,
        },
        { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 },
        i % 2 == 0 ? "#916846" : "#929990",
      );
    }
    this.dead = true;
    //window.location.href = "game.html";
  }
  updateIfDead(dt){
    this.generate();
    this.updateAsteroids(dt);
    this.particles.update(dt);
  }
  checkFloorCollision(attractPoint){
    if (this.dead){
      return true;
    };
    if (this.player.checkFloorCollision(attractPoint)){
      if (this.player.isInRightPosition(attractPoint)){
        this.pageNeeded = 1 // Tells the bro to go to the winning html page
      }else if (!this.dead) {
        this.initDiedAnimation();
        this.pageNeeded = 2 // Dying animation
      }
      return true;
    }
    return false 
  }

  generateDustParticles(attractPoint){
    if ((attractPoint[1] - (this.player.tShape[1].y) < MIN_HEIGHT_DUST) && Math.abs(this.player.rot) < 0.6){
      //console.log(this.player.lst[1][1] + this.camera_offset.y - attractPoint[1]);
      let howNear = (attractPoint[1] - this.player.tShape[1].y)/40;
      for (let i = 0; i < 3; i++) {
        let t = Math.random()
        this.particles.emit(
          {
            x: this.player.tShape[0].x*t + this.player.tShape[3].x*(1-t),
            y: attractPoint[0]*t + attractPoint[2]*(1-t) + 0.1 
          },
          { x: 2.0*(this.player.force.x + (2.0*Math.random()-1))/howNear, y: -0.25 },
          "#fafaff",
          null,
          1.0, 20 
        )
      }
    }
  }

  updateAsteroids(dt){
    this.asteroids.forEach((asteroid) => {
      const asteroid_shape = asteroid.getShape();
      let center = asteroid.getCenter(); 
      let sizeAsteroid = Math.sqrt((center.x - asteroid_shape[0].x)*(center.x - asteroid_shape[0].x) + (center.y - asteroid_shape[0].y)*(center.y - asteroid_shape[0].y));

      if (vector2Distance(center, this.player.pos) < (sizeAsteroid+100)){
        //console.log("size: ", sizeAsteroid, vector2Distance(center, this.player.pos));
        const intersection = collisionSAT(asteroid_shape, this.player.tShape);
        if ( intersection != SATResult.NOT_COLLISION){
          this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
          this.initDiedAnimation()
        }
      }
      //console.log(asteroid_shape)
      const ast_speed = 0.5;
      sizeAsteroid = (center.x - asteroid_shape[0].x)*(center.x - asteroid_shape[0].x) + (center.y - asteroid_shape[0].y)*(center.y - asteroid_shape[0].y);

      this.particles.emit({x: center.x, y: center.y } ,
        { x: -asteroid.dir.x*ast_speed, y: -asteroid.dir.y*ast_speed }, "#916846", 
        { x: -asteroid.dir.x*ast_speed, y: -asteroid.dir.y*ast_speed }, sizeAsteroid/600.0, sizeAsteroid/300);
      if ( asteroid.update(this.perlin, this.particles, dt) ){
        asteroid.emitDeathParticles(this.particles);
        this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
      }
    });
  }

  update(dt=1){
    this.total_time += dt;
    const mouse_dir = make_vector2d(-this.mouse_coord.x + this.canvas.width / 2.0, -this.mouse_coord.y + this.canvas.height / 2);

    const collision_indx = this.rover.update(this.perlin, this.asteroids, dt);
    if (collision_indx >= 0){
      this.asteroids[collision_indx].emitDeathParticles(this.particles);
      this.asteroids.splice(collision_indx, 1);
    }

    let attractPoint = this.generateAttractPoints();
    if (this.checkFloorCollision(attractPoint)){
      this.updateIfDead(dt);
      return true;
    };


    this.player.update(dt, mouse_dir, (this.is_boosting && this.boost_time > 0 ? 4.0 : 1.0));
    this.particles.update(dt);
    this.updateAsteroids(dt);

    this.boost_time += dt * (this.is_boosting ? -1 : 0.1);
    if (this.boost_time < -10) this.boost_time = -10;
    if (this.boost_time > this.boost_duration) this.boost_time = this.boost_duration;

    //console.log(is_boosting, boost_time);
    if (this.player.goUp && this.player.fuel > 0) {
      this.player.generateParticles(this.particles, this.is_boosting, this.boost_time, 100.0/dt);
      this.generateDustParticles(attractPoint);
    }

    this.generate()
    this.camera_offset = make_vector2d(-this.player.pos.x + this.canvas.width / 2.0, -this.player.pos.y + this.canvas.height / 2);
  }


  drawTerrain(ctx){
    ctx.beginPath();
    ctx.moveTo(this.player.pos.x > 0 ? -this.player.pos.x : -this.camera_offset.x, this.canvas.height);
    // i made this to always start at a number divisible by 40, in this way the starting point of each line don't change at each offset
    let start_pos = -Math.floor(this.camera_offset.x / 40) * 40 - 40;
    for (let i = start_pos; i < canvas.width + this.player.pos.x; i += 40)
      ctx.lineTo(
        i + this.camera_offset.x,
        getFloorValue(this.perlin, i) + this.camera_offset.y,
      );
    ctx.lineTo(
      this.canvas.width + (this.player.pos.x > 0 ? this.player.pos.x : this.camera_offset.x),
      this.canvas.height,
    );
    ctx.closePath();
    ctx.fillStyle = "#121211";
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawTrees(ctx){
    const step_val = 28;
    let tree_increase;
    let start_pos = -Math.floor(this.camera_offset.x / step_val) * step_val - step_val;
    let tree_value;
    let tree_prev_step = 2;
    for (let i = start_pos-step_val*2; i < canvas.width + this.player.pos.x+step_val*2; i += step_val){
      tree_increase = biomeData[getBiome(i + this.camera_offset.x)].da*20.0;
      tree_value = this.tree_perlin.getVal(i/20);
      if (tree_prev_step > 2 && tree_value > (1.0 - PROB_TREE - tree_increase)){
        const idx = Math.floor(this.perlin.getVal(i*200 + 100)*N_DIFFERENT_TREES);
        const initial_pos = {x : i + this.camera_offset.x, y: getFloorValue(this.perlin, i) + this.camera_offset.y};
        this.trees[idx].draw(ctx, initial_pos, this.camera_offset);
        tree_prev_step = 0;
      }
      tree_prev_step += 1
    }

  }


  drawText(ctx){
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("" + Math.floor(this.total_time*100)/10000.0, this.width/2.0-this.width/32, 40);
    if (this.died) return
    ctx.font = "20px Arial";
    ctx.fillText("Fuel: " + this.player.fuel, 10, 30);
    ctx.fillText(
      "Y-velocity: " + -Math.floor(this.player.force.y * 100) / 100,
      10,
      60,
    );

    let attractPoint = this.generateAttractPoints();
    if (attractPoint[1] - (this.player.tShape[1].y + this.camera_offset.y) < MIN_HEIGHT_DUST*2) {
      let alignP1 = this.player.tShape[1].y + this.camera_offset.y - attractPoint[0]
      let alignP2 = this.player.tShape[2].y + this.camera_offset.y - attractPoint[2]
      ctx.fillText("align left: " + -Math.floor(alignP1*100.0)/100.0, this.canvas.width-200, 30);
      ctx.fillText("align right: " + -Math.floor(alignP2*100.0)/100.0, this.canvas.width-200, 60);
    }

  }


  draw(ctx){
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#1c1c1b";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.dead) {
      this.dead_time += 0.5;
      this.camera_offset.y -= 0.5 * (this.dead_time / 10);
    }

    this.sky.draw(this.camera_offset);
    if (!this.dead)
      this.player.draw(ctx, this.camera_offset);
    this.particles.draw(this.camera_offset);
    this.asteroids.forEach((asteroid) => {
      asteroid.draw(ctx, this.camera_offset);
    });
    this.drawTrees(ctx);
    this.drawTerrain(ctx);
    this.rover.Draw(ctx, this.camera_offset);
  }



}

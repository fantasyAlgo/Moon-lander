let clamp = (num, min, max) => Math.min(Math.max(num, min), max);
let lerp = (n1, n2, t) => n1 + (n2 - n1) * t;
let sameInInterval = (a, b, interval) => Math.abs(a - b) < interval;

export class RocketParticleSystem {
  constructor(ctx) {
    this.ctx = ctx;
    this.active_particles = [];
  }
  emit(start_pos, vel, color = "#916846", end_vel = null, avr_size = 1) {
    const start_time = 1 + (Math.random() * 2 - 1) / 10;
    this.active_particles.push({
      start_time: start_time,
      time_rem: start_time,
      pos: start_pos,
      vel: {
        x: vel.x + (Math.random() * 2 - 1) / 2,
        y: vel.y + (Math.random() * 2 - 1) / 10,
      },
      size: (Math.random() * 4 + 1) * avr_size,
      color: color,
      end_vel:
        end_vel != null
          ? {
              x: end_vel.x + (Math.random() * 2 - 1) / 2,
              y: end_vel.y + (Math.random() * 2 - 1) / 10,
            }
          : null,
    });
  }
  update() {
    let length = this.active_particles.length;
    let curr_vel;
    //let particle;
    for (let i = 0; i < length; i++) {
      const particle = this.active_particles[i];
      if (this.active_particles[i].time_rem < 0) {
        this.active_particles.shift();
        i -= 1;
        length -= 1;
        continue;
      }
      curr_vel =
        particle.end_vel != null
          ? {
              x: lerp(
                particle.vel.x,
                particle.end_vel.x,
                particle.start_time - particle.time_rem * particle.start_time,
              ),
              y: lerp(
                particle.vel.y,
                particle.end_vel.y,
                particle.start_time - particle.time_rem * particle.start_time,
              ),
            }
          : {x: particle.vel.x, y: particle.vel.y} ;
      this.active_particles[i].pos.x += curr_vel.x;
      this.active_particles[i].pos.y += curr_vel.y;
      this.active_particles[i].time_rem -= 0.01;
    }
  }
  draw() {
    let length = this.active_particles.length;
    let size;
    //let particle;
    for (let i = 0; i < length; i++) {
      const particle = this.active_particles[i];
      this.ctx.fillStyle = particle.color;
      size = lerp(
        particle.size,
        0,
        particle.start_time - particle.time_rem * particle.start_time,
      );
      this.ctx.fillRect(particle.pos.x, particle.pos.y, size, size);
    }
  }
}

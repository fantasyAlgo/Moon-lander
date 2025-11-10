# Moon-lander
![moonVideo.mp4]()

**The game in the online site is in the 'asteroid' branch**
### What is this
This is a simple game made in javascript and canvas with no other libraries. 
It consist of a little spaceship that needs to land perfectly in a procedurally generated world with a lot of asteroids.
**The polished version of the game is in the 'asteroid' branch.**
### Features
Here is a list of some features present in the game
- Particle system implementation
- Convex hull implementation and asteroid generation
- SAT collision detection for polygon-polygon and polygon-floor collisions
- Recursive trees generation implementation
- Biomes
- Rover implementation using springs and some linear algebra to keep the model attached.
- Cookie system to keep track of the best score.
- Bullet system

### How to run
**The game is online**, but if you want to run it locally, run:
```bash
git clone -b asteroid https://github.com/fantasyAlgo/Moon-lander.git
cd Moon-lander
python3 -m http.server // live-server works too.
```
### How to play
- Use the mouse to change the rotation of the ship
- Use 'w' to go forward
- Use 'shift' to sprint for a few seconds
- To win, land in a flat terrain, with nearly no y-speed and be perfectly balanced (Honestly it's hard to win).

Good luck!

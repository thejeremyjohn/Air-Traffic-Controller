### Background and game mechanics

Pathfinder is based on the mobile game Air Control. 

Emojis move in from outside the board, approaching in a straight line from some random vector. There are three variations of emojis, each having a different size and movement speed. They can also be either red or blue. There are two landing areas on the board. One is read and the other is blue, indicating which color emoji is able to touch down.

Emojis cannot land themselves. The player's goal is to draw each emojis path to their landing area, avoiding collisions with other emojis. Every emoji landed adds +1 to the player's score and a collision is an instant game over.

As the player's score increases, the frequency with which emojis spawn increases.

### Additional Details and strategy

An emoji will begin following a path as soon as the player begins drawing it. When an emoji reaches the end of a path which does not touch its landing area, the emoji will continue in a straight line from its most recent vector.

As the board gets crowded, it will become necessary to draw more circuitous paths to try to queue up when emojis will reach their landing areas. The player can also slow down the action at any point, to make things less hectic.

### Functionality & MVP

Players will be able to:

- [ ] Play, pause, and slow
- [ ] Click (or hold SPACEBAR) and drag to draw routes for planes

In addition, this project will include:

- [ ] On-screen instructions that appear in the early phase of the game.
- [ ] A production README

### Wireframes

This app consists of a single screen with game board and game controls. Besides clicking and dragging, game controls  include `play`, `pause`,  and `slow` buttons. Below that are HTML links to my Github and LinkedIn.

![wireframes](https://github.com/thejeremyjohn/Air-Traffic-Controller/blob/master/pathfinder.png)

### Architecture and Technologies

This project will be implemented with the following technologies:

- `JavaScript` for game logic
- `Canvas` for rendering shapes and/or
- `CSS3` for rendering shapes, transformations, animations
- `Webpack` to bundle js files

In addition to the entry file, there will be three scripts involved in this project:

`board.js`: will designate the fixed position of buttons and landing areas and handle landing animations if any.

`plane.js`: will hold the plane movement logic, track their positions at all times, and trigger events upon collision.

`game.js`: will keep score and render game over prompt.

### Implementation Timeline

**Day 1**: Setup all necessary Node modules, including getting webpack up and running. Get a skeleton going for the entry file and the three scripts described above. Experiment with putting some basic shapes on the board.

**Day 2**: Write handler for click and drag events. Devise a strategy for random-ish plane spawning from outside the board. Implement score tracking.

**Day 3**: Implement circular collision boxes for planes and perhaps the same for landing areas. Add Pause/Play button. Begin styling

**Day 4**: Panic about everything that doesn't work yet. Style, style, style.

### Bonus features

- [ ] Alternate gameplay speeds
- [ ] Alternate boards with their own styles and landing areas
- [ ] Ability to choose what variety of planes can spawn in

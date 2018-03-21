## Sample JS Project Proposal: Conway's Game of Life with Variations

### Background

Air Traffic Controller is based on the existing mobile title Air Control. The game allows 1-player interactions with a rectangular board. 2D-shapes (airplanes with circular collision boxes) move in from outside the board, approaching in a straight line from some random vector. Some planes travel faster than others and/or have a different size.

There are two to three designated spots on the board where planes can land (landing strips for planes / helipads for helicopters). When a plane enroute collides with a landing area, it lands and is safe, contributing +1 the player's score. At all other times a plane has the potential to collide with another plane which would trigger game over.

Planes cannot land themselves even if their random approach vector happens to take them directly over a landing area. The player directs planes to land by click and dragging a route to a landing area. As the player's score increases, the frequency with which planes spawn increases.

### Additional Details

A plane will begin following a route as soon as it is clicked upon. Players should not be able to hold a plane in one spot, however they can make unrealistically tight spirals to keep a plane in the same area for a while. When a plane reaches the end of a route which does not collide with a landing area, the plane will continue in a straight light from it's most recent vector.

### Functionality & MVP

Players will be able to:

- [ ] Play and Pause
- [ ] Click and drag to draw routes for planes

In addition, this project will include:

- [ ] An About modal describing the background and rules of the game
- [ ] A production README

### Wireframes

This app will consist of a single screen with game board, game controls, and nav links to my Github and LinkedIn. Game controls will include `play`, `pause`, and `click&drag` to draw plane routes.

![wireframes](https://github.com/thejeremyjohn/Air-Traffic-Controller/blob/master/air_traffic_controller.png)

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

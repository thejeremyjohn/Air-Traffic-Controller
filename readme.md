[Play the game!](https://jeremyjohn.me/pathfinder/)

### Background and game mechanics

Pathfinder is based on the mobile game Air Control. 

Emojis move in from outside the board, approaching in a straight line from some random vector. There are three variations of emojis, each having a different size and movement speed. They can also be either red or blue. There are two landing areas on the board. One is read and the other is blue, indicating which color emoji is able to touch down.

Emojis cannot land themselves. The player's goal is to draw each emojis path to their landing area, avoiding collisions with other emojis. Every emoji landed adds +1 to the player's score and a collision is an instant game over.

As the player's score increases, the frequency with which emojis spawn increases.

[![Pathfinder](https://github.com/thejeremyjohn/Air-Traffic-Controller/blob/master/pathfinder_gameplay.gif)](https://jeremyjohn.me/pathfinder/)

### Additional Details and strategy

An emoji will begin following a path as soon as the player begins drawing it. When an emoji reaches the end of a path which does not touch its landing area, the emoji will continue in a straight line from its most recent vector.

As the board gets crowded, it will become necessary to draw more circuitous paths to try to queue up when emojis will reach their landing areas. The player can also slow down the action at any point, to make things less hectic.

### Functionality & MVP

Players are able to:

- Play, pause, and slow
- Click (or hold SPACEBAR) and drag to draw routes for planes

In addition, this project includes on-screen instructions that appear in the early phase of the game as well as a highscores leaderboard that appears upon losing and entering player name.

### Architecture and Technologies

This project was implemented with the following technologies:

- `JavaScript` for game logic
- `Canvas` for rendering lines, shapes and images
- `CSS3` for styling the page
- `Firebase` for reading and writing highscores

### Future Plans

- Mute button
- Display highscore ranking alongside the top 5

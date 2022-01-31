# Gablin Maze

Gablin Maze is the prototype of a HTML5 webapp that implements a simple 2D game with levels to overcome.  

The game aim is to guide the main character (represented by a little cat) inside a maze with the goal to found the exit.  

It is a level game with increasing difficulty in which each level is represented by a different maze to overcome.

The game was implemented with Node.js and Typescript using [PixiJS](https://pixijs.com/) Engine.
The project include a docker image with all need to build and run the game.

**Notes**:  
At present this software can be only considered a prototype with a good gameplay, music, level and scoring management, that includes a random maze generator also. The source code could be improved with a better organization and decoupling, then with new features.

## How to play

The game can be played on desktop and mobile platform.  
It requires only a web server to serve the static contents of the game.  

- Click on the stage to enable the audio background (music and sounds)
- Use the arrow keys or click on the stage to move the character in the maze
- Guide the character to found the maze exit

## How build and run the game

Create the docker developer container and login:

```bash
make shell
```

The following command should be executed inside the docker container.

Install dependencies (only the first time):

```bash
make install # npm install
```

Build:

```bash
make build # gulp dist
```

```console
[16:56:26] Using gulpfile /workspaces/gablin-maze-game/gulpfile.js
[16:56:26] Starting 'dist'...
[16:56:26] Starting 'clean'...
[16:56:26] Finished 'clean' after 4.78 ms
[16:56:26] Starting 'make_game'...
[16:56:31] Finished 'make_game' after 4.9 s
[16:56:31] Starting 'copy_lib'...
[16:56:31] Finished 'copy_lib' after 10 ms
[16:56:31] Starting 'copy_res'...
[16:56:31] Finished 'copy_res' after 2.19 ms
[16:56:31] Finished 'dist' after 4.92 s
```

Start the server:

```bash
make start # npm start
```

```console
> gablin-game@1.0.0 start
> http-server ./public -p 40080 -o

Starting up http-server, serving ./public
Available on:
  http://127.0.0.1:40080
  http://172.17.0.2:40080
Hit CTRL-C to stop the server
```

Open your browser at the above url, enjoy:  

- [http://127.0.0.1:40080]

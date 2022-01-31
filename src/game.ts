import './pixi'
// 
import { keyboard } from './helper/keyboard';
import { Point, wayType, Cell } from './models';
//
import { MazeContainer, CatSprite } from './objects'
import { ProgressContainer } from './pixiex/progress';
//
import * as manifest_sounds from '../res/sounds.json';

// Graphic Text Styles
const styles = {
    default: new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 36,
        fill: "white",
        stroke: '#ff3300',
        strokeThickness: 4,
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
    }),
    debug: new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 36,
        fill: "white",
        stroke: '#ff3300',
        strokeThickness: 4,
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
    }),
};

enum gameStatus {
    gameBoot  =  0, // => gameLoad
    gameLoad  =  1, // => gameInit
    gameInit  =  2, // => gameHome
    //
    gameHome  =  6, // => levelMenu
    //
    levelMenu = 50, // => levelLoad
    levelLoad = 51, // => levelInit
    levelInit = 52, // => levelOpen
    levelOpen = 55, // => levelPlay
    levelPlay = 56, // => levelFail, levelExit
    levelFail = 57, // => levelInit
    levelExit = 58, // => levelLoad
    //
    gameExit  = 98,
}

interface gameSettings {
    automove: boolean,
}

enum playType {
    standard =  1, //
    time     =  2, // Time Trial
}

class Game {

    // Application
    protected app: PIXI.Application;

    // Debug enabled
    protected debug: boolean;

    // Game Status
    protected status: gameStatus = gameStatus.gameBoot;

    // Game Settings
    protected settings: gameSettings = {
        automove: true,
    };

    // Play Data
    protected play = {
        // Type
        type: playType.standard,
        // Level = 1,..,k
        level: 0,
        // Time
        time: {
            // Elapsed Time
            elapsed: 0,
            // Total Time
            total: 15,
        },
        // Points
        points: 0,
    }

    // Process 
    protected process: (delta:number) => void = (delta) => {};

    readonly resourceList: string[] = [
        "res/images/cat.png",
    ];

    // Current Maze Cell
    protected cell: Cell;

    // LevelExit Point
    protected exitXY: Point;

    // Graphic layers
    protected layers = {
        // Info Area
        info: new PIXI.Container(),
        // Level Area
        level: new PIXI.Container(),
        // Debug Area
        debug: new PIXI.Container(),
    };

    // Graphic objects
    protected objects = {
        // Info
        info: {
            // current level
            level: new PIXI.Text(`LEVEL-${this.play.level}`, styles.default),
            // time remaining
            timer: new ProgressContainer(1016, 12, 200, 32, 8),
            // total points
            points: new PIXI.Text(`${this.play.points}`, styles.default),
        },
        // Maze
        maze: new MazeContainer(),
        // Cat
        cat: new CatSprite(),
        //
        debug: {
            // current maze cell
            cell: new PIXI.Graphics(),
            // maze point (cell)
            mp: new PIXI.Text("", styles.debug),
            // cat point
            cp: new PIXI.Text("", styles.debug),
            // cat velocity
            cv: new PIXI.Text("", styles.debug),
            // generic message
            msg: new PIXI.Text("", styles.debug),
        },
    };
    
    constructor(app: PIXI.Application, debug: boolean = false) {
        this.app = app;
        this.debug = debug;
    }

    protected changingStatus(oldStatus: gameStatus, newStatus: gameStatus): boolean {
        let canChange: boolean = true;
        if (canChange) {
            /**
             * Old Status Exit
             */
            switch (oldStatus) {
                case gameStatus.levelInit:
                    PIXI.sound.stopAll();
                    break;
                case gameStatus.levelPlay:
                    PIXI.sound.stopAll();
                    break;
            }
            /**
             * New Status Enter
             */
            switch (newStatus) {
                case gameStatus.levelMenu:
                    alert("are you ready ?");
                    break;
                case gameStatus.levelPlay:
                    const sounds = [
                        'loop1', 
                        'loop2', 
                        'loop3', 
                        'loop4', 
                    ];
                    const sound = sounds[(this.play.level % sounds.length)];
                    PIXI.sound.play(sound, { loop: true });
                    break;
            }
        }
        return canChange;
    }

    protected setStatus(status: gameStatus) {
        if (this.status == status) {
            console.warn(`setStatus from ${this.status} to ${status}`);
        } else {
            console.log(`setStatus from ${this.status} to ${status}`);
            if (this.changingStatus(this.status, status)) {
                this.status = status;
                // Set the process function (based on the game status)
                switch (this.status) {
                    case gameStatus.gameHome:
                        this.process = this.processGameHome;
                        break;
                    case gameStatus.levelMenu:
                        this.process = this.processLevelMenu;
                        break;
                    case gameStatus.levelLoad:
                        this.process = this.processLevelLoad;
                        break;
                    case gameStatus.levelInit:
                        this.process = this.processLevelInit;
                        break;     
                    case gameStatus.levelPlay:
                        this.process = this.processLevelPlay;
                        break;
                    case gameStatus.levelFail:
                        this.process = this.processLevelFail;
                        break;
                    case gameStatus.levelExit:
                        this.process = this.processLevelExit;
                        break;
                    case gameStatus.gameExit:
                        this.process = this.processGameExit;
                        break;
                }
            }
        }
    }

    /**
     * Game Boot
     */
    public boot() {
        this.load();
    }

    /**
     * Game Load (resources, etc.)
     */
    protected load() {
        this.setStatus(gameStatus.gameLoad);
        // Add images to the PIXI loader
        PIXI.Loader.shared.add(this.resourceList);
        // Add sounds to the PIXI loader
        for (const key in manifest_sounds) {
            PIXI.Loader.shared.add(key, `res/${manifest_sounds[key]}`);
        }
        PIXI.Loader.shared
            // .on("progress", this.loadProgressHandler.bind(this))
            .load(() => this.init());
    }

    /**
     * Game Init (sprites, etc.)
     */
    protected init() {
        this.setStatus(gameStatus.gameInit);
        /**
         * Init Layers & Objects
         */
        this.layers.info.visible = false;
        this.layers.level.visible = false;
        this.layers.debug.visible = false;
        //
        this.objects.info.level.visible = false;
        this.objects.info.timer.visible = false;
        //
        this.objects.info.points.position.set(300, 0);
        // Init Current Maze Cell Indicator
        if (this.debug) {
            this.objects.debug.cell.lineStyle(2, 0xFF0000, 1);
            this.objects.debug.cell.beginFill(0x003366);
            this.objects.debug.cell.drawRect(this.objects.maze.edgeSize * 2, this.objects.maze.edgeSize * 2, this.objects.maze.cellSize.w - this.objects.maze.edgeSize * 4, this.objects.maze.cellSize.h - this.objects.maze.edgeSize * 4);
            this.objects.debug.cell.endFill();
        }
        // Init Cat sprite
        this.objects.cat.texture = PIXI.Loader.shared.resources["res/images/cat.png"].texture;
        this.objects.cat.scale.set(0.8);
        this.objects.cat.anchor.set(0.5,0.5);
        this.objects.cat.velocity = this.objects.maze.cellSize.w / 16;
        this.objects.cat.addListener("move", this.onMove.bind(this));
        // 
        if (this.debug) {
            this.objects.debug.mp.x  = 0;
            this.objects.debug.cp.x  = 250;
            this.objects.debug.cv.x  = 500;
            this.objects.debug.msg.x = 750;
            //
            this.objects.debug.cv.text = "Test";
        }
        /**
         * Add Objects to the Layers
         */
        this.layers.info.addChild(
            this.objects.info.level,
            this.objects.info.timer,
            this.objects.info.points
        );
        //
        this.layers.level.addChild(this.objects.maze);
        this.layers.level.addChild(this.objects.debug.cell);
        this.layers.level.addChild(this.objects.cat);
        //
        if (this.debug) {
            this.layers.debug.addChild(this.objects.debug.mp);
            this.layers.debug.addChild(this.objects.debug.cp);
            this.layers.debug.addChild(this.objects.debug.cv);
            this.layers.debug.addChild(this.objects.debug.msg);
        }
        /**
         * Add Layers to the Stage
         */
        this.layers.info.visible = true;
        //
        if (this.debug) {
            this.app.stage.addChild(this.layers.debug);
        }
        this.app.stage.addChild(this.layers.level);
        this.app.stage.addChild(this.layers.info);
        // Initialize 
        this.initKeyboard();
        //
        this.setStatus(gameStatus.gameHome);
        // Start the game loop by adding the `gameLoop` function to Pixi's `ticker` and providing it with a `delta` argument
        this.app.ticker.add(delta => this.loop(delta));
    }

    /**
     * Game Loop
     */
    protected loop(delta: number) {
        // Update the current game state:
        this.process(delta);
    }

    /**
     * Load progress Handler
     * @param loader 
     * @param resource 
     */
    protected loadProgressHandler(loader: PIXI.Loader, resource) {
        //Display the file `url` currently being loaded
        console.log("loading: " + resource.url); 
      
        //Display the percentage of files currently loaded
        console.log("progress: " + loader.progress + "%"); 
      
        //If you gave your files names as the first argument 
        //of the `add` method, you can access them like this
        //console.log("loading: " + resource.name);
    }

    /**
     * Get the cell center coordinates to position the cat 
     */
    protected getCatTargetPoint(): Point {
        const cell = this.objects.maze.getCellAt(this.objects.cat.x, this.objects.cat.y);
        return new Point(
            ((cell.i + 0.5) * (this.objects.maze.cellSize.w)),
            ((cell.j + 0.5) * (this.objects.maze.cellSize.h))
        );
    }

    /**
     * Check if the cat is on the X center point of the current maze cell
     */
    protected isCenterX(): boolean {
        const cp = this.objects.maze.getCellXY(this.cell);
        return (this.objects.cat.x == cp.x);
    }

    /**
     * Check if the cat is on the Y center point of the current maze cell
     */
    protected isCenterY(): boolean {
        const cp = this.objects.maze.getCellXY(this.cell);
        return (this.objects.cat.y == cp.y);
    }

    /**
     * Check if the cat is on the center point of the current maze cell
     */
    protected isCenterXY(): boolean {
        // Current Cell Center point
        const cp = this.objects.maze.getCellXY(this.cell);
        return ((this.objects.cat.x == cp.x) && (this.objects.cat.y == cp.y));
    }

    protected initKeyboard() {
        // Capture the keyboard arrow keys
        const left = keyboard("ArrowLeft"),
                up = keyboard("ArrowUp"),
             right = keyboard("ArrowRight"),
              down = keyboard("ArrowDown");

        // Left arrow key
        left.press = () => {
            switch (this.status) {
                case gameStatus.levelPlay:
                    if (this.isCenterY()) {
                        this.objects.cat.way = wayType.WEST;
                    }
                    break;
            }
        };
/*
        left.release = () => {
            switch (this.status) {
                case gameStatus.levelPlay:
                    if ((!right.isDown) && (!this.settings.automove)) {
                        this.objects.cat.way = wayType.NONE;
                    }
                    break;
            }
        };
*/
        // Up arrow key
        up.press = () => {
            switch (this.status) {
                case gameStatus.levelPlay:
                    if (this.isCenterX()) {
                        this.objects.cat.way = wayType.NORTH;
                    }
                    break;
            }
        };
/*
        up.release = () => {
            switch (this.status) {
                case gameStatus.levelPlay:
                    if ((!down.isDown) && (!this.settings.automove)) {
                        this.objects.cat.way = wayType.NONE;
                    }
                    break;
            }
        };
*/

        // Right arrow key
        right.press = () => {
            switch (this.status) {
                case gameStatus.levelPlay:
                    if (this.isCenterY()) {
                        this.objects.cat.way = wayType.EAST;
                    }
                    break;
            }
        };
/*
        right.release = () => {
            switch (this.status) {
                case gameStatus.levelPlay:
                    if ((!left.isDown) && (!this.settings.automove)) {
                        this.objects.cat.way = wayType.NONE;
                    }
                    break;
            }
        };
*/
        // Down arrow key
        down.press = () => {
            switch (this.status) {
                case gameStatus.levelPlay:
                    if (this.isCenterX()) {
                        this.objects.cat.way = wayType.SOUTH;
                    }
                    break;
            }
        };
/*
        down.release = () => {
            switch (this.status) {
                case gameStatus.levelPlay:
                    if ((!up.isDown) && (!this.settings.automove)) {
                        this.objects.cat.way = wayType.NONE;
                    }
                    break;
            }
        };
*/
    }

    /**
     * Get all cat move ways
     */
    protected getPossibleWays(): wayType[] {
        let ways = [];
        // Current Cell Center point
//        const cp = this.objects.maze.getCellXY(this.cell);
//        if ((this.objects.cat.x == cp.x) && (this.objects.cat.y == cp.y)) {
        if (true) {
            if (!this.cell.wall.top) {
                ways.push(wayType.NORTH);
            }
            if (!this.cell.wall.right) {
                ways.push(wayType.EAST);
            }
            if (!this.cell.wall.bottom) {
                ways.push(wayType.SOUTH);
            }
            if (!this.cell.wall.left) {
                ways.push(wayType.WEST);
            }
        }
        return ways;
    }

    /**
     * Listener on Cat Move
     */
    protected onMove() {
        this.cell = this.objects.maze.getCellAt(this.objects.cat.x, this.objects.cat.y);
        if (this.debug) {
            if (this.cell) {
                this.objects.debug.cell.position.set(
                    this.cell.i * this.objects.maze.cellSize.w,
                    this.cell.j * this.objects.maze.cellSize.h
                );
                this.objects.debug.mp.text = `mp(${this.cell.i},${this.cell.j})`;
            }
            //
            this.objects.debug.cp.text = `cp(${this.objects.cat.x},${this.objects.cat.y})`;
            this.objects.debug.cv.text = `cv(${this.objects.cat.vx},${this.objects.cat.vy})`;
        }
    }

    protected updateElapsedTime(delta: number) {
        this.play.time.elapsed += (delta / 100);
        if (this.play.time.elapsed >= this.play.time.total) {
            if (this.play.type == playType.time) {
                this.setStatus(gameStatus.levelFail);
            }
        }
        this.objects.info.timer.setLevel(this.play.time.total - this.play.time.elapsed);
    }

    protected updatePoints(delta: number) {
        this.play.points += Math.max(0, Math.ceil(1000 * (this.play.time.total - this.play.time.elapsed)));
    }

    protected updateCatPosition(delta: number) {
        if (this.objects.cat.way) {
            if (this.cell) {
                // save the current position
                let cp = this.objects.cat.position.clone();
                // get the target point
                const tp = this.getCatTargetPoint();
                if (this.debug) {
                    this.objects.debug.msg.text = `tp(${tp.x},${tp.y})`;    
                }
                // Apply the velocity values to the cat's position to make it move
                if (this.objects.cat.vx) {
                    // Update the cat's velocity
                    // this.cat.vx = 3 + delta;
                    cp.x += this.objects.cat.vx;
                    // Reset move velocity on the wall side
                    if (
                        (this.cell.wall.left  && this.objects.cat.vx < 0 && cp.x < tp.x) || 
                        (this.cell.wall.right && this.objects.cat.vx > 0 && cp.x > tp.x)/* || (this.cat.vx != 0 && cell.wall.top  || cell.wall.bottom)*/) 
                    {
                        cp.x = tp.x;
                        // this.objects.cat.vx = 0;
                    }
                }
                if (this.objects.cat.vy) {
                    // Update the cat's velocity
                    // this.cat.vy = 3 + delta;
                    cp.y += this.objects.cat.vy;
                    if (
                        (this.cell.wall.top    && this.objects.cat.vy < 0 && cp.y < tp.y) || 
                        (this.cell.wall.bottom && this.objects.cat.vy > 0 && cp.y > tp.y)/* || (this.cat.vy != 0 && cell.wall.left || cell.wall.right )*/) 
                    {
                        cp.y = tp.y;
                        // this.objects.cat.vy = 0;
                    }
                }
                if (cp.x != this.objects.cat.x || cp.y != this.objects.cat.y) {
                    this.objects.cat.position.set(cp.x, cp.y);
                    this.objects.cat.emit("move", this.objects.cat.position);
                    /**
                     * Check cat position for Level Exit
                     */
                    const levelExit = ((this.objects.cat.x == this.exitXY.x) && (this.objects.cat.y == this.exitXY.y));
                    if (levelExit) {
                        this.setStatus(gameStatus.levelExit);
                    }
                    /**
                     * Auto move
                     */
                    if ((this.settings.automove) && (this.isCenterXY())) {
                        let invertedWay: wayType;
                        switch (this.objects.cat.way) {
                            case wayType.NORTH:
                                invertedWay = wayType.SOUTH;
                                break;
                            case wayType.SOUTH:
                                invertedWay = wayType.NORTH;
                                break;
                            case wayType.WEST:
                                invertedWay = wayType.EAST;
                                break;
                            case wayType.EAST:
                                invertedWay = wayType.WEST;
                                break;
                        }
                        const ways = this.getPossibleWays().filter((value) => { return (value != invertedWay) });
                        if (ways.length == 1) {
                            const way = ways[0];
                            if (this.objects.cat.way != way) {
                                this.objects.cat.way = way;
                                PIXI.sound.play('boing');
                            }
                        } else {
                            this.objects.cat.way = wayType.NONE;
                            PIXI.sound.play('boing');
                        }
                    }
                }
            }
        }
    }

    protected processGameHome(delta: number) {
        this.setStatus(gameStatus.levelMenu);
    }

    protected processLevelMenu(delta: number) {
        this.setStatus(gameStatus.levelLoad);
    }

    protected processLevelLoad(delta: number) {
        this.play.level += 1;
        //
        const hSize = 16;
        const vSize =  9;
        this.objects.maze.make(hSize, vSize);
        //
        this.setStatus(gameStatus.levelInit);
    }

    protected processLevelInit(delta: number) {
        this.play.time.elapsed = 0;
        //
        this.objects.info.level.text = `LEVEL-${this.play.level}`;
        this.objects.info.timer.set(this.play.time.elapsed, this.play.time.total);
        this.objects.info.points.text = `Points: ${this.play.points}`;
        // Draw the Maze
        this.objects.maze.draw();
        // Align to Center
        this.layers.level.position.x = (this.app.view.width  - this.layers.level.width ) / 2;
        this.layers.level.position.y = (this.app.view.height - this.layers.level.height) / 2;
        if (this.debug) {
            this.layers.debug.y = this.layers.level.y + this.layers.level.height;
            this.layers.debug.visible = true;
        }
        //
        this.exitXY = this.objects.maze.getCellExitXY();
        //
        const p = this.objects.maze.getCellStartXY();    
        this.objects.cat.position.set(p.x, p.y);
        this.onMove();
        //
        this.objects.info.level.visible = true;
        this.objects.info.timer.visible = true;
        this.layers.level.visible = true;
        //
        this.setStatus(gameStatus.levelPlay);
    }

    public processLevelPlay(delta: number) {
        this.updateElapsedTime(delta);
        this.updateCatPosition(delta);
    }

    public processLevelFail(delta: number) {
        PIXI.sound.play('buzzer');
        alert("Level failed");
        this.objects.cat.way = wayType.NONE;
        this.layers.level.visible = false;
        this.layers.debug.visible = false;
        this.setStatus(gameStatus.levelInit);
    }

    public processLevelExit(delta: number) {
        PIXI.sound.play('success');
        alert("Level completed");
        this.objects.cat.way = wayType.NONE;
        this.layers.level.visible = false;
        this.layers.debug.visible = false;
        this.updatePoints(delta);
        this.setStatus(gameStatus.levelLoad);
    }

    public processGameExit(delta: number) {
    }

}

export default Game;

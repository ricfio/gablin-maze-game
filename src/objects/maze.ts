import '../pixi'
import { Point, Maze, Cell } from '../models';
// 
export class MazeContainer extends PIXI.Container {

    protected model: Maze;

    public readonly edgeSize: number = 2;
    public readonly cellSize = {
        w: 64,
        h: 64,
    };

    constructor() {
        super();
        this.model = new Maze(false);
    }

    public make(hSize: number, vSize: number) {
        this.model.make(hSize, vSize);
        this.model.printOut();
    }

    /**
     * Draw the Maze (inside the PIXI Container)
     */
    public draw() : void {
        this.removeChildren();
        //
        const maze: Maze = this.model;
        // Create the maze walls
        const wall = new PIXI.Graphics();
        wall.lineStyle(this.edgeSize * 2, 0x00FFFF, 1);
        //
//          outer.beginFill(0x66CCFF);
//          wall.drawRect(0, 0, m.width, m.height);
//          outer.endFill();
        // 
        const p: PIXI.Point = new PIXI.Point(0, 0);
        wall.moveTo(p.x, p.y);
        //
        for (let x=0; x<maze.hSize; x++) {
            const y = 0;
            const cell = maze.grid[x][y];
            // TOP WALL (MAZE)
            if (cell.wall.top) {
                p.x = this.cellSize.w * x;
                p.y = this.cellSize.h * y;
                wall.moveTo(p.x, p.y);
                wall.lineTo(p.x + this.cellSize.w, p.y);
            }
        }
        //
        for (let y=0; y<maze.vSize; y++) {
            for (let x=0; x<maze.hSize; x++) {
                const cell = maze.grid[x][y];
                // LEFT WALL (CELL)
                if (cell.wall.left) {
                    p.x = this.cellSize.w * x;
                    p.y = this.cellSize.h * y;
                    wall.moveTo(p.x, p.y);
                    wall.lineTo(p.x, p.y + this.cellSize.h);
                }
            }
            if (true) {
                // RIGHT WALL (MAZE)
                const x = maze.hSize - 1;
                const cell = maze.grid[x][y];
                if (cell.wall.right) {
                    p.x = this.cellSize.w * x + this.cellSize.w;
                    p.y = this.cellSize.h * y;
                    wall.moveTo(p.x, p.y);
                    wall.lineTo(p.x, p.y + this.cellSize.h);
                }
            }
            //
            for (let x=0; x<maze.hSize; x++) {
                // BOTTOM WALL (CELL)
                const cell = maze.grid[x][y];
                if (cell.wall.bottom) {
                    p.x = this.cellSize.w * x;
                    p.y = this.cellSize.h * y + this.cellSize.h;
                    wall.moveTo(p.x, p.y);
                    wall.lineTo(p.x + this.cellSize.w, p.y);
                }
            }
        }
        //
        this.addChild(wall);
    }

    /**
     * Get the Maze Cell at coordinates x,y on the PIXI Container
     * @param x Coordinate X
     * @param y Coordinate Y
     */
    public getCellAt(x: number, y: number): Cell {
        const cx = Math.floor(x / this.cellSize.w);
        const cy = Math.floor(y / this.cellSize.h);
        return (((cx >= 0 && cx < this.model.hSize) && (cy >= 0 && cy < this.model.vSize)) ? this.model.grid[cx][cy] : null);
    }

    /**
     * Get the coordinates XY of the cell (center point)
     * @param cell 
     */
    public getCellXY(cell: Cell): Point {
        return new Point(
            ((cell.i + 0.5) * (this.cellSize.w)),
            ((cell.j + 0.5) * (this.cellSize.h))
        )
    }

    /**
     * Get the coordinates XY of the exit cell (center point)
     * @param cell 
     */
    public getCellStartXY(): Point {
        return this.getCellXY(this.model.cellStart);
    }

    /**
     * Get the coordinates XY of the exit cell (center point)
     * @param cell 
     */
    public getCellExitXY(): Point {
        return this.getCellXY(this.model.cellExit);
    }

}

import { ways } from './way';
import { Cell } from './cell';

export class Maze 
{
    // Debug enabled
    protected debug: boolean;

    // Maze Grid Horizontal size
    protected _hSize: number;
    // Maze Grid Vertical size
    protected _vSize: number;

    // Maze Grid (_hSize*_vSize cells)
    protected _grid: Cell[][] = [];

    protected _cellStart: Cell;
    protected _cellExit: Cell;

    constructor(debug: boolean = false) {
        this.debug = debug;
    }

    public get hSize(): number {
        return this._hSize;
    }
    
    public get vSize(): number {
        return this._vSize;
    }
    
    public get grid(): Cell[][] {
        return this._grid;
    }

    public get cellStart(): Cell {
        return this._cellStart;
    }

    public get cellExit(): Cell {
        return this._cellExit;
    }

    /**
     * get a random integer between min and max
     * @param {Number} min 
     * @param {Number} max
     * @return {Number} random generated integer 
     */
    protected getRandom(min: number, max: number): number {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    /**
     * Shuffle Array
     * @param array 
     */
    protected shuffleArray(array: any[]): any[] {
        let currentIndex: number = array.length;
        let temporaryValue: number;
        let randomIndex: number;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    /**
     * Make a Maze
     */
    public make(hSize: number, vSize: number) {
        let visited: boolean[][] = [];
        // Initialize an empty maze (grid of hSize*vSize dimensions)
        this._hSize = hSize;
        this._vSize = vSize;
        for (let i=0; i<this._hSize; i++) {
            this._grid[i] = [];
            visited[i] = [];
            for (let j = 0; j<this._vSize; j++) {
                this._grid[i][j] = new Cell(i, j);
                visited[i][j] = false;
            }
        }
        // 
//            this.cellStart = this.cell[this.getRandom(0, this.width-1)[this.getRandom(0, this.height-1)];
//            this.cellStart = this.cell[this.getRandom(0, this.width-1)[0]];
        this._cellStart = this._grid[0][0];
//            this._cellStart.wall.top = false;
        // 
        this._cellExit = this._grid[this.hSize-1][this.vSize-1];
        this._cellExit.wall.right = false;
        // 
        let path: Cell[] = [];
        this.make_walkFrom(this._cellStart, visited, path);
    }

    /**
     * Save the Maze to json file
     */
    public save(filepath: string) {
        throw "not implemented";
    }

    /**
     * Load the Maze from json file
     */
    public load(filepath: string) {
        throw "not implemented";
    }

    /**
     * Actually prints the Maze, on stdOut. Put in a separate method to allow extensibility
     */
    public printOut() {
//            console.log(this._grid);
        const V_WALL = '---+';
        const V_OPEN = '   +';
        const H_WALL = '|';
        const H_OPEN = ' ';
        // 
        const EOL = "\n";
        // 
        let str = '+';
        for (let i=0; i<this._hSize; i++) {
            const j = 0;
            const cell = this._grid[i][j];
            // TOP WALL (MAZE)
            str += (cell.wall.top) ? V_WALL : V_OPEN;
        }
        str += EOL;
        //
        for (let j=0; j<this._vSize; j++) {
            for (let i=0; i<this._hSize; i++) {
                const cell = this._grid[i][j];
                // LEFT WALL (CELL)
                str += (cell.wall.left) ? H_WALL : H_OPEN;
                // 
                str += '   ';
            }
            if (true) {
                // RIGHT WALL (MAZE)
                const i = this._hSize - 1;
                const cell = this._grid[i][j];
                str += (cell.wall.right) ? H_WALL : H_OPEN;
            }
            //
            str += EOL;
            str += '+';
            for (let i=0; i<this._hSize; i++) {
                // BOTTOM WALL (CELL)
                const cell = this._grid[i][j];
                str += (cell.wall.bottom) ? V_WALL : V_OPEN;
            }
            str += EOL;
        }
        console.log(str);
    }

    /**
     * Walk from a cell to remove a wall between the cell and a neighbor cell
     * @param cell 
     * @param visited 
     * @param path 
     */
    private make_walkFrom(cell: Cell, visited: boolean[][], path: Cell[]) {
        // mark the cell as visited
        visited[cell.i][cell.j] = true;
        // add cell to path
        path.push(cell);
        // get list of all unvisited neighbors
        let neighbors: Cell[] = this.make_getUnvisitedNeighbors(cell, visited);
//            console.log(cell, "Nears", JSON.stringify(neighbors));
        if (neighbors.length == 0) {
            // Dead end, we need now to backtrack, if there's still any cell left to be visited
//                console.log("Start backtracking along path", JSON.stringify(this.path));
            path.pop();
            if (path.length > 0) {
                const next = path.pop();
                this.make_walkFrom(next, visited, path);
            }
        } else {            
            // randomize neighbors, as per request
            neighbors = this.shuffleArray(neighbors);
            // 
            const next = neighbors[0];
            if (cell.i == next.i) {
                // UP Cell
                let uCell: Cell;
                // DOWN Cell
                let dCell: Cell;
                if (cell.j < next.j) {
                    uCell = cell;
                    dCell = next; 
                } else {
                    uCell = next;
                    dCell = cell; 
                }
                uCell.wall.bottom = dCell.wall.top = false;
            }
            if (cell.j == next.j) {
                // LEFT Cell
                let lCell: Cell;
                // RIGHT Cell
                let rCell: Cell;
                if (cell.i < next.i) {
                    lCell = cell;
                    rCell = next; 
                } else {
                    lCell = next;
                    rCell = cell;
                }
                lCell.wall.right = rCell.wall.left = false;            
            }
            this.make_walkFrom(next, visited, path);
        }
    }

    /**
     * get unvisited neighboors cells
     */
    private make_getUnvisitedNeighbors(cell: Cell, visited: boolean[][]): Cell[] 
    {
        let neighbors: Cell[] = [];
        Object.keys(ways).forEach(key => {
            const way = ways[key];
            const x = cell.i + way.x;
            const y = cell.j + way.y;
            if (x >= 0 && x < this._hSize && y >= 0 && y < this._vSize) {
                // Check if the cell x,y is unvisited
                if (!visited[x][y]) {
                    neighbors.push(this._grid[x][y]);
                }
            }
        });
        return neighbors;
    }
}

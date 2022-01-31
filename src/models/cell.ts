interface wallState 
{
    top: boolean,
    right: boolean,
    bottom: boolean,
    left: boolean,
}

export class Cell
{
    readonly i: number;
    readonly j: number;

    constructor(i: number, j: number) {
        this.i = i;
        this.j = j;
    }

    public wall: wallState = {
        top: true,
        right: true,
        bottom: true,
        left: true,
    }
}

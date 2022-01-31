import '../pixi'
//
export class ProgressContainer extends PIXI.Container 
{
    protected _width: number;
    protected _height: number;
    protected _radius: number;

    protected level: number;
    protected total: number;

    protected settings = {
        line: {
            width: 2,
            color: 0xFF0000,
        },
        fill: {
            color: 0x003366,
        },
    }

    protected outer: PIXI.Graphics = new PIXI.Graphics();
    protected inner: PIXI.Graphics = new PIXI.Graphics();

    public get width(): number {
        return this._width;
    } 

    public set width(value: number) {
        if (this._width != value) {
            this._width = value;
            this.redraw();
        }
    } 

    public get height(): number {
        return this._height;
    } 

    public set height(value: number) {
        if (this._height != value) {
            this._height = value;
            this.redraw();
        }
    }

    constructor(x: number, y: number, width: number, height: number, radius: number = 1) {
        super();
        this.x = x;
        this.y = y;
        this._width = width;
        this._height = height;
        this._radius = radius;
        //
        this.redraw();
        this.addChild(this.inner, this.outer);
    }

    protected drawOuter() {
        this.outer.clear();
        this.outer.lineStyle(this.settings.line.width, this.settings.line.color, 1);
        this.outer.drawRoundedRect(0, 0, this.width, this.height, this._radius);
    }

    protected drawInner() {
        this.inner.clear();
        this.inner.beginFill(this.settings.fill.color);
        this.inner.drawRect(
            (0           + this.settings.line.width    ), 
            (0           + this.settings.line.width    ), 
            (this.width  - this.settings.line.width * 2) * ((this.total) ? (this.level / this.total) : 1), 
            (this.height - this.settings.line.width * 2)
        );
        this.inner.endFill();
    }

    public redraw() {
        this.drawOuter();
        this.drawInner();
    }
 
    public setLevel(level: number) {
        level = Math.min(Math.max(0, level), this.total);
        if (this.level != level) {
            this.level = level;
            this.drawInner();
        }
    }

    public setTotal(total: number) {
        this.total = Math.max(0, total);
        this.setLevel(this.level);
    }

    public set(level: number, total: number) {
        this.setLevel(level);
        this.setTotal(total);
    }

}
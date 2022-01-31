import '../pixi'
import { wayType, wayVect } from '../models';
//
export class CatSprite extends PIXI.Sprite {

    protected _way: wayType;

    protected _velocity: number;

    protected _vx: number;
    protected _vy: number;

    public get vx(): number {
        return this._vx;
    }

    public get vy(): number {
        return this._vy;
    }

    public get way(): wayType {
        return this._way;
    }

    public set way(value: wayType) {
        this._way = value;
        this._vx = wayVect[this._way].x * this._velocity;
        this._vy = wayVect[this._way].y * this._velocity;
    }

    public set velocity(value: number) {
        this._velocity = value;
    }

}

import { Point } from './point';

// Ways
export const ways = {
    NORTH: new Point(0, -1),
    SOUTH: new Point(0, +1),
    WEST : new Point(-1, 0),
    EAST : new Point(+1, 0),
}

/**
 * Way Type
 */
export enum wayType {
    NONE  = 0,
    NORTH = 1,
    SOUTH = 2,
    WEST  = 3,
    EAST  = 4,
}

/**
 * Way Vector
 */
export const wayVect: Point[] = [
    new Point( 0,  0),
    ways.NORTH,
    ways.SOUTH,
    ways.WEST,
    ways.EAST,
]

import { Schema, type } from '@colyseus/schema';

export class PlayerState extends Schema {
    @type('number') x: number = 400;
    @type('number') y: number = 300;
    @type('string') direction: string = 'left';
    @type('string') room: string = 'default';
}

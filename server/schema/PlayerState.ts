import { Schema, type } from '@colyseus/schema';

export class PlayerState extends Schema {
    @type('number') x: number = 400;
    @type('number') y: number = 300;
    @type('string') direction: string = 'left';
    @type('string') room: string = 'default';
    
    // Player appearance properties
    @type('string') username?: string;
    @type('string') hairKey?: string;
    @type('string') topKey?: string;
    @type('string') bottomKey?: string;
    @type('string') shoeKey?: string;
    @type('string') boardKey?: string;
    @type('string') eyesKey?: string;
    @type('string') bodyKey?: string;
    @type('string') headKey?: string;
    
    constructor(options?: any) {
        super();
        if (options) {
            this.username = options.username;
            this.hairKey = options.hairKey;
            this.topKey = options.topKey;
            this.bottomKey = options.bottomKey;
            this.shoeKey = options.shoeKey;
            this.boardKey = options.boardKey;
            this.eyesKey = options.eyesKey;
            this.bodyKey = options.bodyKey;
            this.headKey = options.headKey;
        }
    }
}

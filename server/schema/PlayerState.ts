import { Schema, type } from '@colyseus/schema';

export class PlayerState extends Schema {
    @type('number') x: number = 400;
    @type('number') y: number = 300;
    @type('string') direction: string = 'left';
    @type('string') room: string = 'default';
    @type('string') username: string = '';
    @type('string') gender: string = '';
    @type('string') hair: string = '';
    @type('string') top: string = '';
    @type('string') bottom: string = '';
    @type('string') shoes: string = '';
    @type('string') board: string = '';
    @type('string') face_acc: string = '';
    @type('string') body_acc: string = '';
    @type('string') outfit: string = '';
    @type('string') eyes: string = '';
    @type('string') body: string = '';
    @type('string') head: string = '';

    constructor(options?: {
        username?: string;
        gender?: string;
        hair?: string;
        top?: string;
        bottom?: string;
        shoes?: string;
        board?: string;
        face_acc?: string;
        body_acc?: string;
        outfit?: string;
        x?: number;
        y?: number;
        direction?: string;
        eyes?: string;
        body?: string;
        head?: string;
    }) {
        super();
        
        if (options) {
            this.username = options.username || '';
            this.gender = options.gender || '';
            this.hair = options.hair || '';
            this.top = options.top || '';
            this.bottom = options.bottom || '';
            this.shoes = options.shoes || '';
            this.board = options.board || '';
            this.face_acc = options.face_acc || '';
            this.body_acc = options.body_acc || '';
            this.outfit = options.outfit || '';
            this.x = options.x || 400;
            this.y = options.y || 300;
            this.direction = options.direction || 'left';
            this.eyes = options.eyes || '';
            this.body = options.body || '';
            this.head = options.head || '';
        }
    }
}

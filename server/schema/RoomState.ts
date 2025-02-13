import { Schema, type, MapSchema } from '@colyseus/schema';
import { PlayerState } from './PlayerState';

export class RoomState extends Schema {
    @type({ map: PlayerState }) players = new MapSchema<PlayerState>(); // All players in the room
}

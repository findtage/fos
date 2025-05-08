import { Room, Client } from 'colyseus';
import { RoomState } from '../schema/RoomState';
import { PlayerState } from '../schema/PlayerState';

export class GameRoom extends Room<RoomState> {
    onCreate(options: any): void {
        this.setState(new RoomState());

        // Handle player movement
        this.onMessage('move', (client: Client, data: { x: number; y: number; direction: string }) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                //TODO: update so it tracks player lerping. Not a high priority for now.
                player.x = data.x;
                player.y = data.y;
                player.direction = data.direction;

                // Broadcast movement updates only to players in the same room
                this.broadcastToRoom(player.room, 'playerMoved', { id: client.sessionId, x: player.x, y: player.y, direction: player.direction }, client);
                //console.log("Player movement detected, new coords x: "+player.x+", y: "+player.y)
            }
        });

        this.onMessage("chat", (client, message) => {
            console.log(`Received chat message from ${client.sessionId}: ${message.message}`);
    
            // Broadcast the chat message to all players in the room
            this.broadcast("chat", {
                id: client.sessionId,
                message: message.message,
            });
        });

        this.onMessage("playAnimation", (client, data) => {
            const { animationKey } = data;
            const player = this.state.players.get(client.sessionId);
        
            if (player) {
                // Broadcast the animation to all other players
                this.broadcast("playAnimation", {
                    id: client.sessionId,
                    animationKey,
                }, { except: client });
            }
        });

        this.onMessage("outfitChange", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                // Broadcast the hair update to all clients
                this.broadcast("outfitChange", {
                    playerId: client.sessionId,
                    hairKey: data.hairKey,
                    topKey: data.topKey,
                    bottomKey: data.bottomKey,
                    shoeKey: data.shoeKey,
                    boardKey: data.boardKey
                });
            }
        });

        this.onMessage("appearanceChange", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                // Broadcast the hair update to all clients
                this.broadcast("appearanceChange", {
                    playerId: client.sessionId,
                    eyesKey: data.eyesKey,
                    bodyKey: data.bodyKey,
                    headKey: data.headKey
                });
            }
        });
    }

    onJoin(client: Client, options: any): void {
        const newPlayer = new PlayerState(options);
        newPlayer.room = options.roomName || 'default'; // Assign the room from options or default
        newPlayer.x = options.x;
        newPlayer.y = options.y;
        newPlayer.direction = options.playerDirection;
        this.state.players.set(client.sessionId, newPlayer);

        console.log(`Player ${client.sessionId} joined room: ${newPlayer.room}`);

        const playersInRoom = Array.from(this.state.players.entries())
            .filter(([_, player]) => player.room === newPlayer.room)
            .map(([id, player]) => ({
                id,
                ...player
        }));
        
        client.send('currentPlayers', playersInRoom);

        // Notify other players in the same room about the new player
        
        this.broadcastToRoom(newPlayer.room, 'newPlayer', { id: client.sessionId, ...options });

    }

    onLeave(client: Client): void {
        const player = this.state.players.get(client.sessionId);
        if (player) {
            console.log(`Player ${client.sessionId} left room: ${player.room}`);
            this.broadcastToRoom(player.room, 'playerLeft', { id: client.sessionId });
        }
        this.state.players.delete(client.sessionId);
    }

    /**
     * Broadcast messages only to players in the same room.
     */
    private broadcastToRoom(roomName: string, type: string, message: any, except?: Client): void {
        this.clients
            .filter((c) => this.state.players.get(c.sessionId)?.room === roomName)
            .forEach((c) => {
                if (c !== except) {
                    c.send(type, message);
                }
            });
    }
}
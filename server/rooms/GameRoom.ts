import { Room, Client } from 'colyseus';
import { RoomState, HomeRoomState } from '../schema/RoomState';
import { PlayerState } from '../schema/PlayerState';

export class GameRoom extends Room<RoomState> {
    onCreate(options: any): void {
        this.setState(new RoomState());

        // Handle player movement
        this.onMessage('move', (client: Client, data: { x: number; y: number; direction: string }) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                player.x = data.x;
                player.y = data.y;
                player.direction = data.direction || 'left';

                // Broadcast movement updates only to players in the same room
                this.broadcastToRoom(player.room, 'playerMoved', { id: client.sessionId, x: player.x, y: player.y, direction: player.direction }, client);
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
                    playerGender: data.playerGender,
                    hairKey: data.hairKey,
                    topKey: data.topKey,
                    bottomKey: data.bottomKey,
                    shoeKey: data.shoeKey,
                    boardKey: data.boardKey,
                    outfitKey: data.outfitKey,
                    faceAccKey: data.faceAccKey,
                    bodyAccKey: data.bodyAccKey
                });
            }
        });

        this.onMessage("appearanceChange", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                // Broadcast the hair update to all clients
                this.broadcast("appearanceChange", {
                    playerId: client.sessionId,
                    playerGender: data.playerGender,
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

export class HomeRoom extends Room<RoomState> {
    onCreate(options: any): void {
        this.setState(new RoomState());
        console.log(`Home room created for: ${options.homeID}`);

        // Handle player movement
        this.onMessage('move', (client: Client, data: { x: number; y: number; direction: string }) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                player.x = data.x;
                player.y = data.y;
                player.direction = data.direction || 'left';

                this.broadcast("playerMoved", { id: client.sessionId, x: player.x, y: player.y, direction: player.direction }, { except: client });
            }
        });

        this.onMessage("chat", (client, message) => {
            console.log(`Chat from ${client.sessionId}: ${message.message}`);
            this.broadcast("chat", { id: client.sessionId, message: message.message });
        });

        this.onMessage("playAnimation", (client, data) => {
            const { animationKey } = data;
            const player = this.state.players.get(client.sessionId);
            if (player) {
                this.broadcast("playAnimation", { id: client.sessionId, animationKey }, { except: client });
            }
        });

        this.onMessage("outfitChange", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                this.broadcast("outfitChange", {
                    playerId: client.sessionId,
                    playerGender: data.playerGender,
                    hairKey: data.hairKey,
                    topKey: data.topKey,
                    bottomKey: data.bottomKey,
                    shoeKey: data.shoeKey,
                    boardKey: data.boardKey,
                    outfitKey: data.outfitKey,
                    faceAccKey: data.faceAccKey,
                    bodyAccKey: data.bodyAccKey
                });
            }
        });

        this.onMessage("appearanceChange", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
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
        const homeOwner = options.homeID;
        const newPlayer = new PlayerState(options);
        newPlayer.room = homeOwner; // Home is identified by the owner's username
        this.state.players.set(client.sessionId, newPlayer);

        console.log(`Player ${client.sessionId} joined home: ${homeOwner}`);

        const playersInHome = Array.from(this.state.players.entries()).map(([id, player]) => ({
            id,
            ...player
        }));

        client.send('currentPlayers', playersInHome);

        // Notify other players in the home
        this.broadcast("newPlayer", { id: client.sessionId, ...options }, { except: client });
    }

    onLeave(client: Client): void {
        const player = this.state.players.get(client.sessionId);
        if (player) {
            console.log(`Player ${client.sessionId} left home: ${player.room}`);
            this.broadcast("playerLeft", { id: client.sessionId });
        }
        this.state.players.delete(client.sessionId);
    }
}
import { Room, Client } from 'colyseus';
import { RoomState } from '../schema/RoomState';
import { PlayerState } from '../schema/PlayerState';

// Type definitions for message payloads
interface MoveMessage {
    x: number;
    y: number;
    direction: string;
}

interface ChatMessage {
    message: string;
}

interface AnimationMessage {
    animationKey: string;
}

interface OutfitChangeMessage {
    hairKey?: string;
    topKey?: string;
    bottomKey?: string;
    shoeKey?: string;
    boardKey?: string;
}

interface AppearanceChangeMessage {
    eyesKey?: string;
    bodyKey?: string;
    headKey?: string;
}

interface JoinOptions {
    roomName?: string;
    x: number;
    y: number;
    playerDirection: string;
    username?: string;
    hairKey?: string;
    topKey?: string;
    bottomKey?: string;
    shoeKey?: string;
    boardKey?: string;
    eyesKey?: string;
    bodyKey?: string;
    headKey?: string;
}

// Broadcast message types
interface PlayerMovedBroadcast {
    id: string;
    x: number;
    y: number;
    direction: string;
}

interface ChatBroadcast {
    id: string;
    message: string;
}

interface AnimationBroadcast {
    id: string;
    animationKey: string;
}

interface OutfitChangeBroadcast {
    playerId: string;
    hairKey?: string;
    topKey?: string;
    bottomKey?: string;
    shoeKey?: string;
    boardKey?: string;
}

interface AppearanceChangeBroadcast {
    playerId: string;
    eyesKey?: string;
    bodyKey?: string;
    headKey?: string;
}

interface NewPlayerBroadcast extends JoinOptions {
    id: string;
}

interface PlayerLeftBroadcast {
    id: string;
}

interface CurrentPlayersData {
    id: string;
    room: string;
    x: number;
    y: number;
    direction: string;
    username?: string;
    hairKey?: string;
    topKey?: string;
    bottomKey?: string;
    shoeKey?: string;
    boardKey?: string;
    eyesKey?: string;
    bodyKey?: string;
    headKey?: string;
}

export class GameRoom extends Room<RoomState> {
    onCreate(options: any): void {
        this.setState(new RoomState());

        // Handle player movement
        this.onMessage('move', (client: Client, data: MoveMessage) => {
            const player: PlayerState | undefined = this.state.players.get(client.sessionId);
            if (player) {
                //TODO: update so it tracks player lerping. Not a high priority for now.
                player.x = data.x;
                player.y = data.y;
                player.direction = data.direction;

                // Broadcast movement updates only to players in the same room
                const moveData: PlayerMovedBroadcast = { 
                    id: client.sessionId, 
                    x: player.x, 
                    y: player.y, 
                    direction: player.direction 
                };
                this.broadcastToRoom(player.room, 'playerMoved', moveData, client);
                //console.log("Player movement detected, new coords x: "+player.x+", y: "+player.y)
            }
        });

        this.onMessage("chat", (client: Client, message: ChatMessage) => {
            console.log(`Received chat message from ${client.sessionId}: ${message.message}`);
    
            // Broadcast the chat message to all players in the room
            const chatData: ChatBroadcast = {
                id: client.sessionId,
                message: message.message,
            };
            this.broadcast("chat", chatData);
        });

        this.onMessage("playAnimation", (client: Client, data: AnimationMessage) => {
            const { animationKey } = data;
            const player: PlayerState | undefined = this.state.players.get(client.sessionId);
        
            if (player) {
                // Broadcast the animation to all other players
                const animationData: AnimationBroadcast = {
                    id: client.sessionId,
                    animationKey,
                };
                this.broadcast("playAnimation", animationData, { except: client });
            }
        });

        this.onMessage("outfitChange", (client: Client, data: OutfitChangeMessage) => {
            const player: PlayerState | undefined = this.state.players.get(client.sessionId);
            if (player) {
                // Broadcast the outfit change to all clients
                const outfitData: OutfitChangeBroadcast = {
                    playerId: client.sessionId,
                    hairKey: data.hairKey,
                    topKey: data.topKey,
                    bottomKey: data.bottomKey,
                    shoeKey: data.shoeKey,
                    boardKey: data.boardKey
                };
                this.broadcast("outfitChange", outfitData);
            }
        });

        this.onMessage("appearanceChange", (client: Client, data: AppearanceChangeMessage) => {
            const player: PlayerState | undefined = this.state.players.get(client.sessionId);
            if (player) {
                // Broadcast the appearance change to all clients
                const appearanceData: AppearanceChangeBroadcast = {
                    playerId: client.sessionId,
                    eyesKey: data.eyesKey,
                    bodyKey: data.bodyKey,
                    headKey: data.headKey
                };
                this.broadcast("appearanceChange", appearanceData);
            }
        });
    }

    onJoin(client: Client, options: JoinOptions): void {
        const newPlayer: PlayerState = new PlayerState(options);
        newPlayer.room = options.roomName || 'default'; // Assign the room from options or default
        newPlayer.x = options.x;
        newPlayer.y = options.y;
        newPlayer.direction = options.playerDirection;
        this.state.players.set(client.sessionId, newPlayer);

        console.log(`Player ${client.sessionId} joined room: ${newPlayer.room}`);

        const playersInRoom: CurrentPlayersData[] = Array.from(this.state.players.entries())
            .filter(([_, player]) => player.room === newPlayer.room)
            .map(([id, player]) => ({
                id,
                room: player.room,
                x: player.x,
                y: player.y,
                direction: player.direction,
                username: player.username,
                hairKey: player.hairKey,
                topKey: player.topKey,
                bottomKey: player.bottomKey,
                shoeKey: player.shoeKey,
                boardKey: player.boardKey,
                eyesKey: player.eyesKey,
                bodyKey: player.bodyKey,
                headKey: player.headKey
        }));
        
        client.send('currentPlayers', playersInRoom);

        // Notify other players in the same room about the new player
        const newPlayerData: NewPlayerBroadcast = { 
            id: client.sessionId, 
            ...options 
        };
        this.broadcastToRoom(newPlayer.room, 'newPlayer', newPlayerData);
    }

    onLeave(client: Client): void {
        const player: PlayerState | undefined = this.state.players.get(client.sessionId);
        if (player) {
            console.log(`Player ${client.sessionId} left room: ${player.room}`);
            const playerLeftData: PlayerLeftBroadcast = { id: client.sessionId };
            this.broadcastToRoom(player.room, 'playerLeft', playerLeftData);
        }
        this.state.players.delete(client.sessionId);
    }

    /**
     * Broadcast messages only to players in the same room.
     */
    private broadcastToRoom(roomName: string, type: string, message: any, except?: Client): void {
        this.clients
            .filter((c: Client) => this.state.players.get(c.sessionId)?.room === roomName)
            .forEach((c: Client) => {
                if (c !== except) {
                    c.send(type, message);
                }
            });
    }
}
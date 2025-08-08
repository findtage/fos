import { Room, Client } from 'colyseus';
import { RoomState, HomeRoomState } from '../schema/RoomState';
import { PlayerState } from '../schema/PlayerState';
import boardsMetadata from '../data/boards_metadata.json';

export class FashionShowRoom extends Room<RoomState> {
    private botCount = 0;
    private botInterval: NodeJS.Timeout | null = null;

    host: string | null = null;
    contestants: string[] = [];
    bots: string[] = [];
    eliminated: string[] = [];
    roomID: string | null = null;
    totalPlayers: number = 0;
    readyToStart: boolean = false;
    contestantsChanging: boolean = false;
    contestantScores: Map<string, number> = new Map();
    colorThemes: string[] = ['Black', 'Red', 'White', 'Orange', 'Pink', 'Purple', 'Blue', 'Green', 'Yellow', 'Brown', 'Bright', 'Dark'];
    categoryThemes: string[] = [
      "Animal",
      "Beach",
      "Earthy",
      "Fantasy/Magical",
      "Food",
      "Formal/Prom",
      "Goofy",
      "Holiday",
      "Patterned/Star",
      "Professional",
      "Retro",
      "Preppy/School",
      "Spooky",
      "Sporty",
      "Winter"
    ];

    onCreate(options: any): void {
        this.setState(new RoomState());
        console.log(`Fashion show room created by ID: ${options.fashionShowID}`);

        this.roomID = options.fashionShowID;
        this.host = options.fashionShowID.substring('fashionShow'.length);

        this.botInterval = setInterval(() => {
            if (this.botCount >= 5) {
                clearInterval(this.botInterval!);
                return;
            }

            this.spawnBotPlayer(this.botCount);
            this.botCount++;
        }, 1000);

        this.onMessage('move', (client: Client, data: { x: number; y: number; direction: string }) => {
            //console.log('Moving player to', data.x, data.y);
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

        this.onMessage("hostStartFashionShow", (client) => {
          const player : any = this.state.players.get(client.sessionId);
          if (player.username === this.host) {
            console.log(`Host ${player.username} is starting the fashion show.`);
            this.broadcast("startRoundOne", [...this.colorThemes].sort(() => Math.random() - 0.5).slice(0, 3)); // Random 3
            // Start 10 sec timer, if no theme is sent back, randomly selected theme and relay theme
          }
        });

        this.onMessage("roundOneThemeSelected", (client, data) => {
          const player : any = this.state.players.get(client.sessionId);
          if (player.username === this.host) {
            console.log(`Host ${player.username} selected ${data}.`);
            this.broadcast("relayRoundOneTheme", data);

            setTimeout(() => {
              this.contestantsChanging = true;
              console.log("70 seconds are up. Ending round one.");
              this.broadcast("roundOneChangingOver", this.contestantScores);
              this.contestantsChanging = false;
              this.contestantScores.clear();
            }, 70000);
          }
        });

        this.onMessage("sendOutfit", (client, data) => {
            const player : any = this.state.players.get(client.sessionId);
            const outfitScore = getOutfitScore(data);
            this.contestantScores.set(player.username, outfitScore);
            client.send("individualOutfitScore", {
              score: outfitScore
            });
        });
        
    }

    onJoin(client: Client, options: any): void {
        const fashionShowID = options.fashionShowID;
        const newPlayer = new PlayerState(options);
        newPlayer.room = options.fashionShowID;
        this.state.players.set(client.sessionId, newPlayer);

        console.log(`Player ${client.sessionId} joined show: ${fashionShowID}`);

        const playersInShow = Array.from(this.state.players.entries()).map(([id, player]) => ({
            id,
            ...player
        }));

        client.send('currentPlayers', playersInShow);

        this.broadcast("newPlayer", { id: options.username, ...options }, { except: client }); // temp fix

        if (options.username != this.host) {
            this.contestants.push(options.username);
            console.log(`Contestant ${options.username} added to show: ${fashionShowID}`);
            this.totalPlayers++;
        }

        if (this.totalPlayers >= 5 && !this.readyToStart) {
          this.broadcast("readyToStart");
        }
    }

    onLeave(client: Client): void {
        const player : any = this.state.players.get(client.sessionId);

        console.log(player);
        if (player) {
            console.log(`Player ${client.sessionId} left home: ${player.room}`);
            this.broadcast("playerLeft", { id: client.sessionId });
        }
        this.state.players.delete(client.sessionId);

        if (player.username != this.host) {
            const index = this.contestants.indexOf(player.username);
            if (index !== -1) {
                this.contestants.splice(index, 1);
                console.log(`Contestant ${player.username} removed from show: ${player.room}`);
                this.totalPlayers--;
            }
        } else {
          // If the host leaves, bot host will take over
        }

        if (this.botInterval) {
            clearInterval(this.botInterval);
            this.botInterval = null;
        }

        if (this.totalPlayers < 5 && this.readyToStart) {
          this.broadcast("notReadyToStart");
        }
    }

    private spawnBotPlayer(index: number) {
        const botData = generateRandomCharacter();
        const pt = getRandomPointInRunwayZone(index);

        const sessionId = `bot_${botData.username}_${Date.now()}`;

        const fakeOptions = botData;
        fakeOptions.x = pt.x;
        fakeOptions.y = pt.y;

        // Simulate a new PlayerState (just like onJoin)
        const newPlayer = new PlayerState(fakeOptions);
        newPlayer.x = pt.x;
        newPlayer.y = pt.y;
        newPlayer.direction = 'left'; // Default direction for bots
        //newPlayer.room = 'default'; // or whatever logic you use for assigning rooms

        this.state.players.set(sessionId, newPlayer);

        this.broadcast("newPlayer", { id: sessionId, ...fakeOptions });
        console.log(`🤖 Spawned bot ${botData.username} at (${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);

        this.bots.push(botData.username);
        this.totalPlayers++;

        if (this.totalPlayers >= 5 && !this.readyToStart) {
          this.broadcast("readyToStart");
        }
    }
}

const boyNames = ['noah','liam','jacob','william','mason','ethan','michael','alexander','james','elijah','benjamin','daniel','aiden','logan','jayden','matthew','lucas','david','jackson','joseph','anthony','samuel','joshua','gabriel','andrew','john','christopher','oliver','dylan','carter','isaac','luke','henry','owen','ryan','nathan','wyatt','caleb','sebastian','jack','christian','jonathan','julian','landon','levi','isaiah','hunter','aaron','thomas','charles'];

const girlNames = ['emma', 'mila', 'olivia','sophia','isabella','ava','mia','abigail','emily','charlotte','madison','elizabeth','amelia','evelyn','ella','chloe','harper','avery','sofia','grace','victoria','addison','lily','natalie','aubrey','zoey','lillian','hannah','layla','brooklyn','scarlett','zoe','camila','samantha','riley','leah','aria','savannah','audrey','anna','allison','gabriella','hailey','claire','penelope','aaliyah','sarah','nevaeh','kaylee','stella'];

const categoriesByGender = {
  female: {
    hair:    530,
    top:     383,
    bottom:  176,
    shoe:    378,
    outfit:  231,
    facc:    127,
    bacc:    373,
  },
  male: {
    mhair:   148,
    mtop:    109,
    mbottom:  72,
    mshoe:    69,
    moutfit: 103,
    mfacc:    24,
    mbacc:    35,
  },
  shared: {
    body:      5,
    eyes:     13,
  }
};

const RUNWAY_ZONES = [
  { x: 395, y: 407, w: 650, h: 95 },
  { x: 124, y: 351, w: 90, h: 180 },
  { x: 676, y: 351, w: 90, h: 180 },
  { x: 725, y: 362, w: 128, h: 190, ellipse: true },
  { x: 77, y: 356, w: 128, h: 165, ellipse: true }
];

function randInt(max: number): number {
  return Math.floor(Math.random() * (max + 1));
}

function generateRandomUsername(gender: string): string {
  const names = gender === 'male' ? boyNames : girlNames;
  const name = names[Math.floor(Math.random() * names.length)];
  const digits = Array.from({ length: randInt(4) + 2 }, () => randInt(9)).join('');
  return name + digits;
}

function pickRandomBoard(): string {
  const boardIds = Object.keys(boardsMetadata);
  return boardIds[Math.floor(Math.random() * boardIds.length)];
}

function generateRandomCharacter(): any {
  const gender = Math.random() < 0.5 ? 'male' : 'female';
  const username = generateRandomUsername(gender);
  const board = pickRandomBoard();
  const useOutfit = Math.random() < 0.5;

  const result: any = { username, gender, board };

  const bodyMax = categoriesByGender.shared.body;
  const eyesMax = categoriesByGender.shared.eyes;
  const bodyIdx = randInt(bodyMax);
  const eyesIdx = randInt(eyesMax);
  const bodyPrefix = gender === 'male' ? 'mbody' : 'body';
  const headPrefix = gender === 'male' ? 'mhead' : 'head';
  const eyesPrefix = gender === 'male' ? 'meyes' : 'eyes';
  result.body = `${bodyPrefix}${bodyIdx}`;
  result.head = `${headPrefix}${bodyIdx}`;
  result.eyes = `${eyesPrefix}${eyesIdx}`;

  const hairKey = gender === 'male' ? 'mhair' : 'hair';
  result.hair = `${hairKey}${randInt((categoriesByGender[gender] as any)[hairKey])}`;

  if (useOutfit) {
    const outfitKey = gender === 'male' ? 'moutfit' : 'outfit';
    result.outfit = `${outfitKey}${randInt((categoriesByGender[gender] as any)[outfitKey])}`;
    result.top = 'none';
    result.bottom = 'none';
  } else {
    const topKey = gender === 'male' ? 'mtop' : 'top';
    const bottomKey = gender === 'male' ? 'mbottom' : 'bottom';
    result.outfit = 'none';
    result.top = `${topKey}${randInt((categoriesByGender[gender] as any)[topKey])}`;
    result.bottom = `${bottomKey}${randInt((categoriesByGender[gender] as any)[bottomKey])}`;
  }

  const shoeKey = gender === 'male' ? 'mshoe' : 'shoe';
  result.shoes = `${shoeKey}${randInt((categoriesByGender[gender] as any)[shoeKey])}`;

  const faccKey = gender === 'male' ? 'mfacc' : 'facc';
  result.face_acc = Math.random() < 0.3
    ? `${faccKey}${randInt((categoriesByGender[gender] as any)[faccKey])}`
    : 'none';

  const baccKey = gender === 'male' ? 'mbacc' : 'bacc';
  result.body_acc = Math.random() < 0.4
    ? `${baccKey}${randInt((categoriesByGender[gender] as any)[baccKey])}`
    : 'none';

  return result;
}

function getRandomPointInRunwayZone(index: number): { x: number; y: number } {
  const zone = RUNWAY_ZONES[index % RUNWAY_ZONES.length];
  if (zone.ellipse) {
    const angle = 2 * Math.PI * Math.random();
    const rx = (zone.w / 2) * Math.random();
    const ry = (zone.h / 2) * Math.random();
    return {
      x: zone.x + rx * Math.cos(angle),
      y: zone.y + ry * Math.sin(angle)
    };
  } else {
    return {
      x: zone.x - zone.w / 2 + Math.random() * zone.w,
      y: zone.y - zone.h / 2 + Math.random() * zone.h
    };
  }
}

function getOutfitScore(outfit: any): number {
  let score = 0;
  return score;
}
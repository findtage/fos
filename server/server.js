const { Server } = require('colyseus');
const express = require('express');
const http = require('http');
const path = require('path');
const { GameRoom } = require('./rooms/GameRoom');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
//app.use(cors({ origin: "https://c99a-98-14-219-221.ngrok-free.app", credentials: true }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.get("/api/ping", (req, res) => {
    res.status(200).json({ success: true });
});

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Create HTTP and WebSocket servers
const server = http.createServer(app);
const gameServer = new Server({
    server,
});

// Define a Colyseus room
gameServer.define('downtown', GameRoom).enableRealtimeListing();
gameServer.define('starcafe', GameRoom).enableRealtimeListing();
gameServer.define('leshop', GameRoom).enableRealtimeListing();
gameServer.define('salon', GameRoom).enableRealtimeListing();
gameServer.define('topmodel', GameRoom).enableRealtimeListing();
gameServer.define('topmodelvip', GameRoom).enableRealtimeListing();

gameServer.define('uptown', GameRoom).enableRealtimeListing();
gameServer.define('furnitureshop', GameRoom).enableRealtimeListing();
gameServer.define('mymall', GameRoom).enableRealtimeListing();
gameServer.define('idfoneshop', GameRoom).enableRealtimeListing();
gameServer.define('costumeshop', GameRoom).enableRealtimeListing();
gameServer.define('boardshop', GameRoom).enableRealtimeListing();
gameServer.define('botique', GameRoom).enableRealtimeListing();

gameServer.define('missioncenter', GameRoom).enableRealtimeListing();

gameServer.define('pet_town', GameRoom).enableRealtimeListing();
gameServer.define('petshop', GameRoom).enableRealtimeListing();
gameServer.define('petclass', GameRoom).enableRealtimeListing();
gameServer.define('petschool', GameRoom).enableRealtimeListing();

gameServer.define('carnival', GameRoom).enableRealtimeListing();
gameServer.define('arcade', GameRoom).enableRealtimeListing();

gameServer.define('forest', GameRoom).enableRealtimeListing();
gameServer.define('wizard', GameRoom).enableRealtimeListing();
gameServer.define('grotto', GameRoom).enableRealtimeListing();
gameServer.define('grotto_secret_one', GameRoom).enableRealtimeListing();
gameServer.define('grotto_secret_two', GameRoom).enableRealtimeListing();
gameServer.define('creaturearea', GameRoom).enableRealtimeListing();
gameServer.define('creatureshop', GameRoom).enableRealtimeListing();

gameServer.define('beach', GameRoom).enableRealtimeListing();
gameServer.define('tanstore', GameRoom).enableRealtimeListing();
gameServer.define('danceclub', GameRoom).enableRealtimeListing();

gameServer.define('school_outside', GameRoom).enableRealtimeListing();
gameServer.define('school_inside', GameRoom).enableRealtimeListing();
gameServer.define('mathroom', GameRoom).enableRealtimeListing();
gameServer.define('englishroom', GameRoom).enableRealtimeListing();
gameServer.define('school_upstairs', GameRoom).enableRealtimeListing();
gameServer.define('cafeteria', GameRoom).enableRealtimeListing();
gameServer.define('gym', GameRoom).enableRealtimeListing();

gameServer.define('ship', GameRoom).enableRealtimeListing();
gameServer.define('restaurant', GameRoom).enableRealtimeListing();

gameServer.define('mountain', GameRoom).enableRealtimeListing();
gameServer.define('cabin', GameRoom).enableRealtimeListing();

gameServer.define('lighthouse', GameRoom).enableRealtimeListing();
gameServer.define('lighthouse_inside', GameRoom).enableRealtimeListing();
gameServer.define('lighthouse_roof', GameRoom).enableRealtimeListing();

gameServer.define('castle', GameRoom).enableRealtimeListing();
gameServer.define('castleyard', GameRoom).enableRealtimeListing();
gameServer.define('castleinside', GameRoom).enableRealtimeListing();

gameServer.define('island', GameRoom).enableRealtimeListing();
gameServer.define('spa', GameRoom).enableRealtimeListing();
gameServer.define('resort', GameRoom).enableRealtimeListing();
gameServer.define('islandstore', GameRoom).enableRealtimeListing();

gameServer.define('dock', GameRoom).enableRealtimeListing();
gameServer.define('oasis', GameRoom).enableRealtimeListing();

gameServer.define('minigame', GameRoom).enableRealtimeListing();

gameServer.define('home', GameRoom).enableRealtimeListing();


// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

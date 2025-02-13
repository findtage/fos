HOW TO RUN:
- install node.js
- let ur computer know this is a nodejs file run: `npm init`
- install node modules (packages) run: `npm install`
- run locally (only on ur computer) run: `npx ts-node server/server.js`

- (optional) run on ngrok (private temporary hosting for development, other players can join w/ link)
- install ngrok, https://ngrok.com/docs/getting-started/?os=windows
- run `ngrok http 3000` on cmd
- then change socket.js, comment out line 6, remove comment from line 9, after the `wss://` add in the link ngrok gives you
- run `npx ts-node server/server.js` from project folder

for [assets](https://mega.nz/file/AcAk3KhY#vi4osWc_d7nojMF9-1pPCWgikOsPLhBgz6M3XUVS85Y):
place all folders inside project_directory/assets

known bugs:
- when a player joins a room with other players, the default direction all players are facing is left [FIXED]
- displaying only one chat at a time [FIXED]
- chat bubble is on a lower level than chat text, so other players chat text collides
- player chat still stays after they leave room, but destroyed within 8 sec [FIXED]
- chat will disappear for local payer after 8 seconds on screen, if switches away, seconds will pause (but for server, it will disppear after 8 sec)
- when zooming in or out of the page, button positions changes for animation buttons [FIXED]
- non recurring: console.log displayed message could not be send, chat UI froze, retested hasnt happened since. Dont know why it occured

features missing from things that are kinda complete:
- movement, player with the lower y value (lower on screen) should appear above other players in terms of layering
- a bunch of bgs from map r missing (comet, pet town, carnival) [ADDED] (check doc for missing bgs)
- attach rooms [DONE]

missing features to work on soon:
- figure out a way to store assets [DONE]
- inventory (w/ database) [DONE] - hairs + tops
- clothing change (multiplayer) [DONE] - hairs + tops
- mini games

features long term:
- animations (jump/cry/etc) [ADDED]
- login (database) / authentication [ADDED]
- create player
- proper time out / log out 


HOW TO RUN:
- install node.js (remember to add it into path)
- install node modules (packages) run in project folder: `npm install`

- (firebase setup): create a project on firebase
- enable authentication and realtime database
- go to project settings, service account, select nodejs and generate a new private key
- rename the json file as 'firebaseServiceAccount.json' and add it to your server/firebase
- go to realtime database, copy the reference link and add it to your firebaseAdmin.js in database url

- run locally (only on ur computer) run in project folder: `npx ts-node server/server.js`

[FOR HOSTING I suggest only do this if you have programming experience]
- (optional) run on ngrok (private temporary hosting for development, other players can join w/ link)
- install ngrok, https://ngrok.com/docs/getting-started
- run `ngrok http 3000` in terminal
- then change all localhost:3000 in the code to the link from ngrok
- run `npx ts-node server/server.js` from project folder



known bugs:
- any pass is working rn (make login client sided)
- chat bubble is on a lower level than chat text, so other players chat text collides
- non recurring: console.log displayed message could not be send, chat UI froze, retested hasnt happened since. Dont know why it occured

features missing from things that are kinda complete:
- movement, player with the lower y value (lower on screen) should appear above other players in terms of layering
- a bunch of bgs from map r missing (comet, music room, hall of fame, qblast, photobooth) (check doc for missing bgs)
- some hair placements + additional hairs, shirts, shoes, boards
- outfits, costumes
- other 6 anims 
- put clothing items in containers and resize it so its aligned and not overlapping
- several depth fixes

missing features to work on soon:
- fashion show
- idfones
- mini games [Added Type Boo, Mouse Out]
- shops [Finished Sun Block]
- homes + furniture
- currency
- buddies
- proper time out / log out 





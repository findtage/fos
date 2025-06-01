import { mapTransition } from "./roomTransition.js";
import { toggleEmotePopup } from "./animations.js";
import { openInventory } from "./inventory.js";
import { getPlayerAvatarData } from "../game.js";
import { createChatWindow, setActiveInput, isInputActive, getChatWindowStatus, addToChatLog, getChatLog  } from "./components.js";

export function createMenu(scene, player, room) {
  const { width, height } = scene.cameras.main;

  // Define button configurations
  const buttonConfigs = [
    { name: 'home', x: 13, y: 9, screenX: 13, screenY: height - 50, callback: () => console.log('Go to Home') },
    { name: 'map', x: 72, y: 9, screenX: 72, screenY: height - 50, callback: () => console.log('Open map') },
    { name: 'inventory', x: 130, y: 9, screenX: 130, screenY: height - 50, callback: () => console.log('Open Inventory') },
    { name: 'buddies', x: 631, y: 9, screenX: 631, screenY: height - 50, callback: () => console.log('Open Buddies') },
    { name: 'email', x: 689, y: 9, screenX: 689, screenY: height - 50, callback: () => console.log('Open Email') },
    { name: 'settings', x: 750, y: 9, screenX: 750, screenY: height - 50, callback: () => console.log('Open Settings') },
    { name: 'emote', x: 257, y: 14, screenX: 257, screenY: height - 45, boxWidth: 31, boxHeight: 30, callback: () => console.log('Click animations') },
    { name: 'enterButton', x: 567, y: 14, screenX: 567, screenY: height - 45, boxWidth: 40, boxHeight: 30, callback: () => console.log("Clicked send chat")}
  ];

  // Add the PNG as the background UI
  const uiImage = scene.add.image(0, height, 'ui').setOrigin(0, 1).setScrollFactor(0);

  // Add buttons using interactive rectangles over the specified areas
  buttonConfigs.forEach(({ name, x, y, screenX, screenY, boxWidth=39, boxHeight=37, callback }) => {
    const button = scene.add
      .rectangle(screenX, screenY, boxWidth, boxHeight, 0xffffff, 0) // Invisible interactive rectangle
      .setOrigin(0, 0)
      .setInteractive()
      .setScrollFactor(0);

    //button.on('pointerdown', callback);
    button.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();
      callback();
    });

    button.on('pointerup', (pointer, localX, localY, event) => {
      event.stopPropagation();

      if (name === 'map') {
        openMapPopup(scene);
      }

      if (name == "emote"){
        toggleEmotePopup(scene, player, room);
      }

      if (name == "home"){
        scene.scene.start('Home', {playerHomeID: getPlayerAvatarData().username})
      }

      if (name == "inventory"){
        openInventory(scene, player, room);
      }

      if (name == 'enterButton'){
        if (isTyping == true){
          if (fullText.trim()) {
            sendChatMessage(scene, player, room, fullText.trim()); // Send the chat message
            fullText = ''; // Clear input
            textOffset = 0;
            inputField.setText('');
          }
        }
      }

      if (name == 'buddies'){
        if (getChatWindowStatus() != 'active'){
          createChatWindow(scene, player, room);
        }  
      }

    });

    // Optional hover effect
    button.on('pointerover', () => {
      button.setFillStyle(0x2D2D2D, 0.3); // Add slight highlight on hover
    });
    button.on('pointerout', () => {
      button.setFillStyle(0xffffff, 0); // Remove highlight
    });
  });

  // CHAT UI
  const maxCharacters = 100;
  const maxWidth = 265; // Maximum visible width of the input field
  const placeholderText = 'Click to type...                                                       '
  
  const inputBackground = scene.add.rectangle(
    width / 2 - 110,
    height - 40,
    maxWidth + 5,
    24, // Height of the text box
    'rgba(82, 81, 77, 0.3)', // Semi-transparent yellow
    0.5 // Full opacity
  ).setOrigin(0, 0).setInteractive().setScrollFactor(0);

  inputBackground.on('pointerup', (pointer, localX, localY, event) => {
    event.stopPropagation();
  });

  // Create the input field as a Phaser.Text object
  const inputField = scene.add.text(width / 2 - 110, height - 40, placeholderText, {
    fontSize: '14px',
    color: '#FFFFFF',
    fontFamily: 'Arial',
    backgroundColor: 'rgba(82, 81, 77, 0.0)', // Semi-transparent yellow
    padding: { x: 8, y: 5 },
  }).setOrigin(0, 0).setInteractive().setScrollFactor(0);
  
  let isTyping = false;
  let fullText = ''; // The full input text
  let textOffset = 0; // The offset to handle scrolling
  
  // Focus on the input field when clicked
  inputField.on('pointerup', (pointer, localX, localY, event) => {
    event.stopPropagation();
    setActiveInput("bottomInput");
    isTyping = true;
    if (fullText === '') {
      inputField.setText('');
    }
  });

  
  // Capture keyboard input
  scene.input.keyboard.on('keydown', (event) => {
    if (!isInputActive("bottomInput")) return;
    if (isTyping) {
      if (event.key === 'Enter') {
        if (fullText.trim()) {
          sendChatMessage(scene, player, room, fullText.trim()); // Send the chat message
          fullText = ''; // Clear input
          textOffset = 0;
          inputField.setText('');
        }
      } else if (event.key === 'Backspace') {
        // Handle backspace: Remove the last character
        fullText = fullText.slice(0, -1);
        textOffset = Math.max(0, textOffset - 1); // Adjust the offset
        inputField.setText(fullText.slice(textOffset)); // Display the last visible part
      } else if (event.key.length === 1 && fullText.length < maxCharacters) {
        // Add the character to the full text
        fullText += event.key;
  
        // Check if the text exceeds the maximum width
        if (inputField.width > maxWidth) {
          textOffset++; // Move the offset to the right
        }
  
        // Update the visible text
        inputField.setText(fullText.slice(textOffset));
      }
    }
  });
}

export function preloadMenu(scene) {
  scene.load.image('ui', '../assets/ui/menu_bar.png');
  scene.load.image('map', '../assets/ui/map-1.png');
  scene.load.image('actionmenu', '../assets/ui/actions_menu.png')
  scene.load.image('inventorybg', '../assets/ui/inventory_2018.png')
  scene.load.image('clothSelectionSideBar', '../assets/ui/clothing_selections.png');
  scene.load.image('accSelectionSideBar', '../assets/ui/acc_selection.png');
}

function openMapPopup(scene) {
  const { width, height } = scene.cameras.main;

  // Add a semi-transparent background to block clicks
  const background = scene.add.rectangle(0, 0, width, height, 0x000000, 0.7)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setInteractive(); // Block clicks behind the popup

  // Center the map relative to the camera's current view
  const mapX = width / 2;
  const mapY = height / 2;

  // Add the map image at the center of the screen
  const map = scene.add.image(mapX, mapY, 'map').setOrigin(0.5, 0.5).setScrollFactor(0).setInteractive();
  map.setDepth(2);
  map.on('pointerup', (pointer, localX, localY, event) => {
    event.stopPropagation();
});

  // Define button positions relative to the map's center
  const mapButtonsConfig = [
    { name: 'Downtown', offsetX: width - 499, offsetY: 336, width: 262, height: 68 },
    { name: 'Beach', offsetX: width - (800-171), offsetY: 250, width: 123, height: 71 },
    { name: 'Lighthouse', offsetX: width - (800-101), offsetY: 184, width: 41, height: 55 },
    { name: 'Carnival', offsetX: width - (800-213), offsetY: 139, width: 138, height: 99 },
    { name: 'Forest', offsetX: width - 200, offsetY: 177, width: 128, height: 52},
    { name: 'School', offsetX: width - (800-664), offsetY: 234, width: 105, height: 52 },
    { name: 'Uptown', offsetX: width - (800-398), offsetY: 259, width: 221, height: 52 },
    { name: 'Village', offsetX: width - (800-431), offsetY: 207, width: 100, height: 40},
    { name: 'Castle', offsetX: width - (800-504), offsetY: 114, width: 91, height: 68},
    { name: 'Mountain', offsetX: width - (800-373), offsetY: 83, width: 144, height: 68},
    { name: 'PetTown', offsetX: width - (800-391), offsetY: 151, width: 111, height: 67},
    { name: 'Oasis', offsetX: width - (800-137), offsetY: 43, width: 67, height: 43},
    { name: 'CreatureArea', offsetX: width - (800-585), offsetY: 286, width: 139, height: 46},
    { name: 'Island', offsetX: 52, offsetY: 238, width: 51, height: 64},
    { name: 'Comet', offsetX: 710, offsetY: 77, width: 118, height: 62},
    { name: 'close', offsetX: width - (800-776), offsetY: 23, width: 38, height: 41}
  ];

  // Create map buttons
  const mapButtons = mapButtonsConfig.map(({ name, offsetX, offsetY, width, height }) => {
    const buttonX = offsetX; // Position relative to the map's center
    const buttonY = offsetY; // Position relative to the map's center

    const button = scene.add
      .rectangle(buttonX, buttonY, width, height, 0xffffff, 0) // Invisible interactive rectangle
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .setScrollFactor(0); // Fix to the camera view

    button.setDepth(2)

      // Add pointerdown event
    button.on('pointerdown', (pointer, localX, localY, event) => {
      console.log(`You clicked on ${name}`);
      event.stopPropagation(); // Prevent clicks from propagating
    });

    button.on('pointerup', (pointer, localX, localY, event) => {
      if (name == "close"){
        event.stopPropagation();
        background.destroy();
        map.destroy();
        mapButtons.forEach((button) => button.destroy());
      } else if (name !== "Village" && name !== "Comet"){ // rooms that arent set up
        event.stopPropagation();
        mapTransition(scene, name);
        background.destroy();
        map.destroy();
      } else {
        event.stopPropagation();
      }
    });

    // Optional hover effect
    button.on('pointerover', () => {
      button.setFillStyle(0xdddddd, 0.15); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
    });
    button.on('pointerout', () => {
      button.setFillStyle(0xffffff, 0); // Remove highlight
    });

    return button;
  });
}

// Function to send a chat message
function sendChatMessage(scene, player, room, message) {
  room.send('chat', { id: player.id, message });
  displayChatBubble(scene, player, message);
}

let activeChatBubble = null;

// Function to display a chat bubble
export function displayChatBubble(scene, player, message) {
  if (player.chatBubble) {
    player.chatBubble.destroy();
    player.chatBubbleContainer.destroy();
  }

  addToChatLog(player.username, message);

  const bubble = scene.add.text(player.x, player.y - 140, message, {
    fontSize: '14px',
    fontFamily: 'Arial',
    color: '#000000',
    backgroundColor: 'rgba(231, 230, 226, 0)',
    padding: { x: 10, y: 5 },
    wordWrap: { width: 100, useAdvancedWrap: true },
    align: 'center',
  }).setOrigin(0.5, 1);

  // BUBBLE BACKGROUND LOGIC EXCESSIVE CODE *****
  // Create a graphics object for the bubble
  const bubbleWidth = 100+20+2//Math.max(100, Math.min(150, message.length * 10)); // Dynamic width based on message length
  const bubbleHeight = bubble.height+2; // Fixed height for the bubble
  const cornerRadius = 5; // Rounded corners
  const notchSize = 10; // Size of the notch below the bubble

  // Create a graphics object for the bubble
  const bubbleGraphics = scene.add.graphics();
  bubbleGraphics.fillStyle(0xe7e6e2, 0.9); // Background color with transparency //e7e6e2 cdccc9

  
  // Draw the rounded rectangle
  bubbleGraphics.fillRoundedRect(
    -bubbleWidth / 2,
    -bubbleHeight - notchSize, // Account for the notch
    bubbleWidth,
    bubbleHeight,
    cornerRadius
  );

  // Draw the notch
  bubbleGraphics.beginPath();
  bubbleGraphics.moveTo(-notchSize / 2, -notchSize); // Left of the notch
  bubbleGraphics.lineTo(0, 0); // Point of the notch
  bubbleGraphics.lineTo(notchSize / 2, -notchSize); // Right of the notch
  bubbleGraphics.closePath();
  bubbleGraphics.fillPath();

  const bubbleContainer = scene.add.container(player.x, player.y - 130, [bubbleGraphics]); // BUBBLE BACKGROUND LOGIC EXCESSIVE CODE
  // END BUBBLE BACKGROUND LOGIC EXCESSIVE CODE ***** */


  // Follow the player's movement
  const updateBubblePosition = () => {
    bubbleContainer.setPosition(player.x, player.y - 130);
    bubble.setPosition(player.x, player.y - 140);
    bubble.setDepth(1); // Ensure text is rendered above the graphics
    bubbleContainer.setDepth(0); // Ensure graphics are below the text
  };
  scene.events.on('update', updateBubblePosition);

  player.chatBubble = bubble;
  player.chatBubbleContainer = bubbleContainer;
  //player.chatBubble = bubbleContainer;

  // Remove bubble after 15 seconds
  scene.time.delayedCall(8000, () => {
    if (player.chatBubble === bubble) {
      player.chatBubble = null;
    }
    bubbleContainer.destroy();
    bubble.destroy();
  });
}
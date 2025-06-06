import { sendChatMessage } from "./UIManager.js";

let chatContainerInstance = null;
let chatWindowInstanceStatus = null;
let chatWindowKeyHandler = null;
let activeInputSource = null;
let visibleChatIndexStart = 0;
let chatTextObjects = [];
const visibleCount = 3;
let sessionChatLog = []; // stores { sender, message, timestamp }

export function createChatWindow(scene, player, room) {
	//const container = scene.add.container(0, 0);
	const camera = scene.cameras.main;
	const spawnY = -25;
	const windowWidth = 320;
	const spawnX = camera.scrollX + (camera.width / 2) - (windowWidth / 2) - 350;
	const container = scene.add.container(spawnX, spawnY);


	setChatWindowStatus("active");
	setActiveInput("chatWindow");
	const scrollTrackTop = 259 + 13; 
	const scrollTrackBottom = 319 - 13;
	const scrollTrackHeight = scrollTrackBottom - scrollTrackTop;


	const createRoundedRect = (x, y, width, height, fillColor, strokeColor = null, lineWidth = 2, radius = 8) => {
		const graphics = scene.add.graphics();
		graphics.fillStyle(fillColor, 1);
		if (strokeColor !== null) {
			graphics.lineStyle(lineWidth, strokeColor, 1);
		}
		graphics.fillRoundedRect(0, 0, width, height, radius);
		if (strokeColor !== null) {
			graphics.strokeRoundedRect(0, 0, width, height, radius);
		}
		const textureKey = `rounded-${x}-${y}-${Date.now()}-${Math.random()}`;
		graphics.generateTexture(textureKey, width, height);
		graphics.destroy();
		const image = scene.add.image(x, y, textureKey);
		image.setScrollFactor(1);
		return image;
	};

	// UI ELEMENTS
	const chatWindow = createRoundedRect(389, 271, 320, 233, 5601178, 0x000000, 2);

    chatWindow.setInteractive({ draggable: true });

    let dragOffsetX = 0;
    let dragOffsetY = 0;

    chatWindow.on('pointerdown', (pointer) => {
        dragOffsetX = pointer.x - chatContainerInstance.x;
        dragOffsetY = pointer.y - chatContainerInstance.y;
    });

    chatWindow.on("pointerup", (pointer, localX, localY, event) => {
        event.stopPropagation();
	});

    chatWindow.on('drag', (pointer) => {
        if (chatContainerInstance) {
            chatContainerInstance.x = pointer.x - dragOffsetX;
            chatContainerInstance.y = pointer.y - dragOffsetY;
        }
    });

	const chatWindowHeader = createRoundedRect(389, 280, 318, 213, 802412, 0x000000, 2);
	const chatWindowBody = createRoundedRect(389, 289, 314, 190, 0xffffff);
	const tabContainer = createRoundedRect(290, 225, 110, 45, 1284340);
	const chatRoomTitle = createRoundedRect(389, 239, 308, 26, 3196146);
	const chatOptionsContainer = createRoundedRect(389, 354, 308, 54, 3259111);

	const chatInputContainer = createRoundedRect(389, 363, 308, 38, 9159881);

    // Input state
    let inputBuffer = "";
    const maxCharacters = 100;

    // Add the input text object
    const chatInputText = scene.add.text(chatInputContainer.x - 145, chatInputContainer.y - 15, "", {
        fontFamily: "Arial",
        fontSize: "11.5px",
        color: "#000",
        wordWrap: { width: 280, useAdvancedWrap: true },
        lineSpacing: 4,
    });
    chatInputText.setOrigin(0, 0);
    chatInputText.setScrollFactor(1);

    // Add blinking cursor
    const cursor = scene.add.text(chatInputText.x, chatInputText.y, "|", {
        fontFamily: "Arial",
        fontSize: "11.5px",
        color: "#000",
    });
    cursor.setScrollFactor(1);

    // Make cursor blink
    scene.time.addEvent({
        delay: 500,
        loop: true,
        callback: () => {
            cursor.visible = !cursor.visible;
        }
    });

	const fontSizeNum = 11.5; // separate number version for math
	if (chatWindowKeyHandler) {
		scene.input.keyboard.off("keydown", chatWindowKeyHandler);
	}

	chatWindowKeyHandler = (event) => {
		if (!isInputActive("chatWindow")) return;
		if (!chatInputText || !chatInputText.setText || !chatInputText.scene) return;

		if (event.key === "Enter") {
			if (inputBuffer.trim().length > 0) {
				sendChatMessage(scene, player, room, inputBuffer);

				inputBuffer = "";
				chatInputText.setText("");
				cursor.setPosition(chatInputText.x, chatInputText.y);
			}
		} else if (event.key === "Backspace") {
			inputBuffer = inputBuffer.slice(0, -1);
		} else if (event.key.length === 1 && inputBuffer.length < maxCharacters) {
			inputBuffer += event.key;
		}

		if (!chatInputText || !chatInputText.setText || !chatInputText.scene) return;

		// Create a temporary text object to measure wrapping
		const tempText = scene.add.text(0, 0, inputBuffer, {
			fontFamily: "Arial",
			fontSize: "11.5px",
			wordWrap: { width: 280, useAdvancedWrap: true },
			lineSpacing: 4,
		}).setVisible(false);

		const wrappedLines = tempText.getWrappedText();
		tempText.destroy();

		const visibleLines = wrappedLines.slice(-2);
		if (chatInputText && typeof chatInputText.setText === "function") {
			chatInputText.setText(visibleLines.join("\n"));
		}

		// Cursor positioning
		const lastLine = visibleLines[visibleLines.length - 1] || "";
		const testCursorText = scene.add.text(0, 0, lastLine, chatInputText.style).setVisible(false);
		const cursorX = chatInputText.x + testCursorText.width;
		const cursorY = chatInputText.y + (visibleLines.length - 1) * (fontSizeNum + chatInputText.style.lineSpacing);
		testCursorText.destroy();

		cursor.setPosition(cursorX, cursorY);
	};

	scene.input.keyboard.on("keydown", chatWindowKeyHandler);

	const scrollContainer = createRoundedRect(535, 289, 15, 46, 14277081, 11382189, 1, 4);
	const scrollUpButton = createRoundedRect(535, 259, 15, 12, 932202, 932202, 1, 4);
	const scrollDownButton = createRoundedRect(535, 319, 15, 12, 932202, 932202, 1, 4);

	scrollUpButton.setInteractive().on("pointerup", (pointer, localX, localY, event) => {
		event.stopPropagation();
		if (visibleChatIndexStart > 0) {
			visibleChatIndexStart--;
			renderChatLog();
		}
	});

	scrollDownButton.setInteractive().on("pointerup", (pointer, localX, localY, event) => {
		event.stopPropagation();
		const maxStart = Math.max(0, getChatLog().length - visibleCount);
		if (visibleChatIndexStart < maxStart) {
			visibleChatIndexStart++;
			renderChatLog();
		}
	});

	const scrollDrag = scene.add.rectangle(535, 306, 15, 12, 932202);
	scrollDrag.setScrollFactor(1);
	scrollDrag.setInteractive({ draggable: true });

	scrollDrag.on('drag', (pointer, dragX, dragY) => {
		const clampedY = Phaser.Math.Clamp(dragY, scrollTrackTop, scrollTrackBottom);
		scrollDrag.y = clampedY;

		const totalLines = getChatLog().length;
		const maxStart = Math.max(0, totalLines - visibleCount);

		if (maxStart > 0) {
			const progress = (clampedY - scrollTrackTop) / scrollTrackHeight;
			visibleChatIndexStart = Math.round(progress * maxStart);
			renderChatLog();
		}
	});

	scrollDrag.on("pointerup", (pointer, localX, localY, event) => {
        event.stopPropagation();
	});

	const exitButton = scene.add.ellipse(532, 174, 22, 22, 0xffffff);
	exitButton.setScrollFactor(1);
	exitButton.setInteractive({ useHandCursor: true });
	exitButton.on("pointerup", (pointer, localX, localY, event) => {
		setActiveInput('bottomInput');
		setChatWindowStatus("inactive");
		event.stopPropagation();
		if (chatContainerInstance) {
			chatContainerInstance.destroy(true);
			chatContainerInstance = null;
			if (chatWindowKeyHandler) {
				scene.input.keyboard.off("keydown", chatWindowKeyHandler);
				chatWindowKeyHandler = null;
			}
		}
	});

	const exitButtonLabel = scene.add.text(527, 165, "X", {
		color: "#597DA4",
		fontFamily: "VAGRounded",
		fontSize: "18px",
		fontStyle: "bold",
		resolution: 2
	});
	exitButtonLabel.setScrollFactor(1);

	const headerTitle = scene.add.text(239, 165, "Instant Messenger", {
		fontFamily: "Arial",
		fontSize: "12px",
		fontStyle: "bold",
		stroke: "#000",
		strokeThickness: 2,
		shadow: { stroke: true },
		resolution: 2
	});
	headerTitle.setScrollFactor(1);

	let tabTitleString = "Current Room"

	const tabTitle = scene.add.text(249, 205, "Current Room", {
		fontFamily: "Arial",
		fontSize: "12px",
		fontStyle: "bold",
		stroke: "#000",
		strokeThickness: 1,
		shadow: { stroke: true },
		resolution: 2
	});
	tabTitle.setScrollFactor(1);

	const currentTabTitle = scene.add.text(264, 230, tabTitleString, {
		color: "#000",
		fontFamily: "Arial",
		fontSize: "12px",
		fontStyle: "bold",
		stroke: "#30C4F2",
		strokeThickness: 1,
		shadow: { stroke: true },
		resolution: 2
	});
	currentTabTitle.setScrollFactor(1);

	const emojiButton = scene.add.text(239, 229, "😳", {
		color: "#000",
		fontFamily: "Arial",
		fontStyle: "bold",
		stroke: "#30C4F2",
		strokeThickness: 1,
		shadow: { stroke: true },
		resolution: 2
	});
	emojiButton.setScrollFactor(1);

	const openChatButton = scene.add.text(518, 199, "📬", {
		color: "#000",
		fontFamily: "Arial",
		fontStyle: "bold",
		stroke: "#30C4F2",
		strokeThickness: 1,
		shadow: { stroke: true },
		resolution: 2
	});
	openChatButton.setScrollFactor(1);

	const scrollUpButtonLabel = scene.add.text(529, 251, "▲\n", {
		fontFamily: "Arial",
		fontSize: "10px",
		fontStyle: "bold",
		strokeThickness: 1,
		resolution: 2
	});
	scrollUpButtonLabel.setScrollFactor(1);

	const scrollDownButtonLabel = scene.add.text(529, 311, "▼\n", {
		fontFamily: "Arial",
		fontSize: "10px",
		fontStyle: "bold",
		strokeThickness: 1,
		resolution: 2
	});
	scrollDownButtonLabel.setScrollFactor(1);

	function updateScrollDragPosition() {
		const totalLines = getChatLog().length;
		const maxStart = Math.max(0, totalLines - visibleCount);

		const progress = maxStart === 0 ? 0 : visibleChatIndexStart / maxStart;
		const newY = scrollTrackTop + progress * scrollTrackHeight;
		scrollDrag.y = Phaser.Math.Clamp(newY, scrollTrackTop, scrollTrackBottom);
	}

	function renderChatLog() {
		chatTextObjects.forEach(obj => obj.destroy());
		chatTextObjects = [];

		const fullLog = getChatLog();
		const totalMessages = fullLog.length;

		let currentY = chatWindowBody.y - 30;
		let lineHeight = 12;
		let linesUsed = 0;
		const maxLines = 5;

		for (let i = visibleChatIndexStart; i < totalMessages && linesUsed < maxLines; i++) {
			const entry = fullLog[i];
			const tempText = scene.add.text(0, 0, `${entry.sender}: ${entry.message}`, {
			fontFamily: "Arial",
			fontSize: "11px",
			wordWrap: { width: 280, useAdvancedWrap: true },
			resolution: 2
			}).setVisible(false);

			const wrapped = tempText.getWrappedText();
			const lineCount = wrapped.length;
			tempText.destroy();

			if (linesUsed + lineCount > maxLines) break;

			const text = scene.add.text(
			chatWindowBody.x - 145,
			currentY,
			`${entry.sender}: ${entry.message}`,
			{
				fontFamily: "Arial",
				fontSize: "11px",
				color: "#000",
				wordWrap: { width: 280, useAdvancedWrap: true },
				resolution: 2
			}
			).setOrigin(0, 0).setScrollFactor(1);

			chatTextObjects.push(text);
			container.add(text);

			currentY += lineHeight * lineCount;
			linesUsed += lineCount;
		}

		updateScrollDragPosition();
	}

	// ADD TO CONTAINER (preserving original order)
	container.add([
		chatWindow,
		chatWindowHeader,
		exitButton,
		exitButtonLabel,
		headerTitle,
		chatWindowBody,
		tabContainer,
		chatRoomTitle,
		tabTitle,
		currentTabTitle,
		emojiButton,
		openChatButton,
		chatOptionsContainer,
		chatInputContainer,
		scrollContainer,
		scrollUpButton,
		scrollUpButtonLabel,
		scrollDownButton,
		scrollDownButtonLabel,
		scrollDrag,
        chatInputText,
        cursor
	]);

    chatContainerInstance = container;
	renderChatLog();

	return container;
    
}

export function setActiveInput(source) {
  activeInputSource = source;
}

export function getActiveInput() {
  return activeInputSource;
}

export function isInputActive(source) {
  return activeInputSource === source;
}

export function setChatWindowStatus(status) {
  chatWindowInstanceStatus = status;
}

export function getChatWindowStatus() {
  return chatWindowInstanceStatus;
}

export function addToChatLog(sender, message) {
  const entry = {
    sender,
    message,
    timestamp: new Date().toISOString()
  };

  sessionChatLog.push(entry);

  // Trim to 50 most recent
  if (sessionChatLog.length > 50) {
    sessionChatLog.shift(); // remove oldest
  }
}

export function getChatLog() {
  return sessionChatLog;
}

export function clearChatLog() {
  sessionChatLog = [];
}

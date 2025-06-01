import { homes } from "../assets/data.js";

export function castleCatalog(scene, player, room){
    // Store Logic
    let shopIcon = scene.add.image(766, 36, 'shopIcon').setScrollFactor(0).setOrigin(0.5, 0.5).setDepth(1.5).setInteractive();

    shopIcon.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        openCatalog(scene, player, room)
    });
}

function openCatalog(scene, player, room) {
    // Grays out scene / bg
    const screen_tint = scene.add.rectangle(0, 0, 800, 520)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(2)
        .setInteractive()
        .setFillStyle(0x000000, 0.4);

    screen_tint.on('pointerup', (pointer, localX, localY, event) => event.stopPropagation());

    // Close button
    const close_button = scene.add.image(770, 35, "closeButton")
        .setInteractive()
        .setScrollFactor(0)
        .setDepth(2)
        .setScale(0.75);

    close_button.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        screen_tint.destroy();
        currentPage.destroy();
        homeImages.forEach(img => img.destroy());
        homeTexts.forEach(txt => txt.destroy());
        homePrices.forEach(price => price.destroy());
        ellipse.destroy();
        ellipse_1.destroy();
        ellipse_2.destroy();
        ellipse_3.destroy();
        purchaseButton.destroy();
        close_button.destroy();
    });

    let pageIndex = 0;
    let { pages, homePages } = generatePages(homes);
    let currentPage = scene.add.image(0, 0, pages[pageIndex])
        .setDepth(3)
        .setScrollFactor(0)
        .setOrigin(0);
    let homeImages = [];

    // Navigation Buttons
    const ellipse = scene.add.ellipse(544, 458, 60, 60).setInteractive().setScrollFactor(0).setDepth(2).setFillStyle(0x000000, 0.002);
    const ellipse_1 = scene.add.ellipse(716, 444, 60, 60).setInteractive().setScrollFactor(0).setDepth(2).setFillStyle(0x000000, 0.002);
    const ellipse_2 = scene.add.ellipse(68, 444, 60, 60).setInteractive().setScrollFactor(0).setDepth(2).setFillStyle(0x000000, 0.002);
    const ellipse_3 = scene.add.ellipse(247, 444, 60, 60).setInteractive().setScrollFactor(0).setDepth(2).setFillStyle(0x000000, 0.002);
    
    const purchaseButton = scene.add.rectangle(574, 432, 145, 35).setInteractive().setScrollFactor(0).setDepth(2).setFillStyle(0x000000, 0.002);

    let homeTexts = []; // Store text objects
    let homePrices = [];

    function updatePage(change) {
        pageIndex += change;
        currentPage.setTexture(pages[pageIndex]);
    
        // Remove previous home images and texts
        homeImages.forEach(img => img.destroy());
        homeTexts.forEach(txt => txt.destroy());
        homePrices.forEach(price => price.destroy());
        
        homeImages = [];
        homeTexts = [];
        homePrices = [];
    
        // Show the correct home images if the page contains home data
        if (homePages[pageIndex]) {
            homePages[pageIndex].forEach((imageKey, index) => {
                let homeImg;
                let textX, textY; // Position for text
                let homeKey = imageKey.replace("_home_icon", ""); // Extract homeKey from imageKey
                let homeData = Object.values(homes).find(h => h.path.includes(homeKey)); // Find home data
    
                if (index == 0) {
                    homeImg = scene.add.image(92, 134, imageKey) // Adjust positioning
                        .setDepth(3)
                        .setScrollFactor(0)
                        .setOrigin(0.5);
    
                    textX = 92;
                    textY = 180;
                }
                if (index == 1) {
                    homeImg = scene.add.image(220, 300, imageKey)
                        .setDepth(2)
                        .setScrollFactor(0)
                        .setOrigin(0.5)
                        .setScale(0.5, 0.5)
                        .setCrop(60, 0, 700, 450);
    
                    textX = 220;
                    textY = 350;
                } 
                if (index == 2) {
                    homeImg = scene.add.image(590, 240, imageKey)
                        .setDepth(2)
                        .setScrollFactor(0)
                        .setOrigin(0.5)
                        .setScale(0.5, 0.5)
                        .setCrop(15, 0, 700, 460);
    
                    textX = 590;
                    textY = 280;
                } 
    
                homeImages.push(homeImg);
    
                // Add home name and cost text
                if (homeData) {
                    let homeText = scene.add.text(133, 103, homeData.name, {
                        fontSize: '28px',
                        fill: '#0074C5',
                        fontFamily: 'VAGROUNDED',
                        align: 'left',
                    }).setDepth(3).setScrollFactor(0).setOrigin(0);

                    let homePrice = scene.add.text(164, 417, homeData.cost.toLocaleString('en-US'), {
                        fontSize: '28px',
                        fill: '#431D00',
                        fontFamily: 'VAGROUNDED',
                        align: 'left',
                    }).setDepth(3).setScrollFactor(0).setOrigin(0);
    
                    homeTexts.push(homeText);
                    homePrices.push(homePrice);
                }
            });
        }
    
        // Update button visibility
        ellipse.setVisible(pageIndex === 0);
        ellipse_1.setVisible(pageIndex > 0 && pageIndex < pages.length - 1);
        ellipse_2.setVisible(pageIndex > 0 && pageIndex < pages.length - 1);
        purchaseButton.setVisible(pageIndex > 0 && pageIndex < pages.length - 1);
        ellipse_3.setVisible(pageIndex === pages.length - 1);
        
    }

    // Assign button actions
    ellipse.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        if (pageIndex < pages.length - 1) updatePage(1);
    });

    ellipse_1.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        if (pageIndex < pages.length - 1) updatePage(1);
    });

    ellipse_2.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        if (pageIndex > 0) updatePage(-1);
    });

    ellipse_3.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        if (pageIndex > 0) updatePage(-1);
    });

    purchaseButton.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        console.log("Purchase logic here")
    });

    // Initialize visibility
    updatePage(0);
}

// Generates pages dynamically based on homes
function generatePages(homes) {
    let pages = ["castleCatalog0"]; // Cover page
    let homePages = {}; // Stores images for each home

    Object.entries(homes).forEach(([key, home], index) => {
        let homeKey = home.path.split('/').pop(); // Extract the home name from the path
        let homePageIndex = pages.length; // Index where the home page will be
        let typeOfPage = home.rooms === 2? 1 : 2;

        pages.push(`castleCatalog${typeOfPage}`); // Add a page for this home
        homePages[homePageIndex] = []; // Initialize array for this home's images
        homePages[homePageIndex].push(`${homeKey}_home_icon`); 
        for (let i = 1; i <= home.rooms; i++) {
            homePages[homePageIndex].push(`${homeKey}_home${i}`); // E.g., "default_home1", "default_home2"
        }
    });

    pages.push("castleCatalog3"); // End page
    return { pages, homePages };
}
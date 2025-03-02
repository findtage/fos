export function castleCatalog(scene, player, room){
    // Store Logic
    let shopIcon = scene.add.image(766, 36, 'shopIcon').setScrollFactor(0).setOrigin(0.5, 0.5).setDepth(1.5).setInteractive();

    shopIcon.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        openCatalog(scene, player, room)
    });
}

function openCatalog(scene, player, room){
    console.log("Show Homes Here")
}

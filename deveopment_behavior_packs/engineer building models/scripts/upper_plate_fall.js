import { BlockLocation, world } from '@minecraft/server';

world.afterEvents.worldInitialize.subscribe(() => {
    world.afterEvents.blockPlace.subscribe((event) => {
        const block = event.block;
        if (block.typeId === 'engineer:upper_plate') {
            const below = new BlockLocation(block.x, block.y - 1, block.z);
            const blockBelow = block.dimension.getBlock(below);
            if (!blockBelow || blockBelow.typeId === 'minecraft:air') {
                block.dimension.spawnEntity('minecraft:falling_block', block.location);
                block.setType('minecraft:air');
            }
        }
    });
});

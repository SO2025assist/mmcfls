import { world, Vector3, BlockPermutation, system } from '@minecraft/server';

// Check for unsupported upper_plate blocks on block updates
world.afterEvents.blockUpdate.subscribe((event) => {
  const block = event.block;
  if (block.typeId === 'engineer:upper_plate') {
    const belowPos: Vector3 = { x: block.x, y: block.y - 1, z: block.z };
    const blockBelow = block.dimension.getBlock(belowPos);

    // If no block below or it's air, make the block fall
    if (!blockBelow || blockBelow.isAir) {
      system.run(() => {
        // Spawn a falling block entity
        const fallingBlock = block.dimension.spawnEntity('minecraft:falling_block', {
          x: block.x + 0.5,
          y: block.y,
          z: block.z + 0.5
        });
        
        // Store the block type for when it lands
        fallingBlock.setDynamicProperty('block_type', 'engineer:upper_plate');
        
        // Replace the original block with air
        block.setPermutation(BlockPermutation.resolve('minecraft:air'));
      });
    }
  }
});

// Handle block placement to check for immediate falling
world.afterEvents.blockPlace.subscribe((event) => {
  const block = event.block;
  if (block.typeId === 'engineer:upper_plate') {
    const belowPos: Vector3 = { x: block.x, y: block.y - 1, z: block.z };
    const blockBelow = block.dimension.getBlock(belowPos);

    // If no block below or it's air, make the block fall
    if (!blockBelow || blockBelow.isAir) {
      system.run(() => {
        const fallingBlock = block.dimension.spawnEntity('minecraft:falling_block', {
          x: block.x + 0.5,
          y: block.y,
          z: block.z + 0.5
        });
        fallingBlock.setDynamicProperty('block_type', 'engineer:upper_plate');
        block.setPermutation(BlockPermutation.resolve('minecraft:air'));
      });
    }
  }
});

// Handle falling block landing
world.afterEvents.entitySpawn.subscribe((event) => {
  const entity = event.entity;
  if (entity.typeId === 'minecraft:falling_block') {
    const blockType = entity.getDynamicProperty('block_type');
    if (blockType === 'engineer:upper_plate') {
      system.run(() => {
        const pos: Vector3 = { x: Math.floor(entity.x), y: Math.floor(entity.y), z: Math.floor(entity.z) };
        const dimension = entity.dimension;
        
        // Place the upper_plate block
        dimension.setBlockType(pos, 'engineer:upper_plate');
        
        // Remove the falling block entity
        entity.remove();
      });
    }
  }
});

// Handle block breaking to collapse unsupported upper_plate blocks above
world.afterEvents.blockBreak.subscribe((event) => {
  const block = event.block;
  if (block.typeId === 'engineer:upper_plate') {
    let abovePos: Vector3 = { x: block.x, y: block.y + 1, z: block.z };
    let maxHeight = 100; // Prevent infinite loops
    while (maxHeight > 0) {
      const aboveBlock = block.dimension.getBlock(abovePos);
      if (!aboveBlock || aboveBlock.typeId !== 'engineer:upper_plate') {
        break;
      }
      system.run(() => {
        // Spawn falling block for the unsupported block
        const fallingBlock = block.dimension.spawnEntity('minecraft:falling_block', {
          x: aboveBlock.x + 0.5,
          y: aboveBlock.y,
          z: aboveBlock.z + 0.5
        });
        fallingBlock.setDynamicProperty('block_type', 'engineer:upper_plate');
        aboveBlock.setPermutation(BlockPermutation.resolve('minecraft:air'));
      });
      abovePos.y += 1;
      maxHeight--;
    }
  }
});

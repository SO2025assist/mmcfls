import { world, BlockPermutation, system } from '@minecraft/server';

// Check for unsupported upper_plate blocks on block updates
world.afterEvents.blockUpdate.subscribe(function (event) {
  var block = event.block;
  if (block.typeId === 'engineer:upper_plate') {
    var belowPos = { x: block.x, y: block.y - 1, z: block.z };
    var blockBelow = block.dimension.getBlock(belowPos);

    // If no block below or it's air, make the block fall
    if (!blockBelow || blockBelow.isAir) {
      system.run(function () {
        // Spawn a falling block entity
        var fallingBlock = block.dimension.spawnEntity('minecraft:falling_block', {
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
world.afterEvents.blockPlace.subscribe(function (event) {
  var block = event.block;
  if (block.typeId === 'engineer:upper_plate') {
    var belowPos = { x: block.x, y: block.y - 1, z: block.z };
    var blockBelow = block.dimension.getBlock(belowPos);

    // If no block below or it's air, make the block fall
    if (!blockBelow || blockBelow.isAir) {
      system.run(function () {
        var fallingBlock = block.dimension.spawnEntity('minecraft:falling_block', {
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
world.afterEvents.entitySpawn.subscribe(function (event) {
  var entity = event.entity;
  if (entity.typeId === 'minecraft:falling_block') {
    var blockType = entity.getDynamicProperty('block_type');
    if (blockType === 'engineer:upper_plate') {
      system.run(function () {
        var pos = { x: Math.floor(entity.x), y: Math.floor(entity.y), z: Math.floor(entity.z) };
        var dimension = entity.dimension;
        
        // Place the upper_plate block
        dimension.setBlockType(pos, 'engineer:upper_plate');
        
        // Remove the falling block entity
        entity.remove();
      });
    }
  }
});

// Handle block breaking to collapse unsupported upper_plate blocks above
world.afterEvents.blockBreak.subscribe(function (event) {
  var block = event.block;
  if (block.typeId === 'engineer:upper_plate') {
    var abovePos = { x: block.x, y: block.y + 1, z: block.z };
    var maxHeight = 100; // Prevent infinite loops
    while (maxHeight > 0) {
      var aboveBlock = block.dimension.getBlock(abovePos);
      if (!aboveBlock || aboveBlock.typeId !== 'engineer:upper_plate') {
        break;
      }
      system.run(function () {
        // Spawn falling block for the unsupported block
        var fallingBlock = block.dimension.spawnEntity('minecraft:falling_block', {
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
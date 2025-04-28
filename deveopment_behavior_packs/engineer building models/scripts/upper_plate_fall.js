import { world, BlockLocation, MinecraftBlockTypes, ItemStack } from "@minecraft/server";

// Log script loading
console.log("Engineer Upper Plate script loaded");

world.events.blockPlace.subscribe((event) => {
  if (event.block.typeId === "engineer:upper_plate") {
    console.log(`Placing engineer:upper_plate at ${event.block.location.x}, ${event.block.location.y}, ${event.block.location.z}`);
    const pos = event.block.location;
    const distance = calculateSupportDistance(pos);
    console.log(`Calculated distance: ${distance}`);
    if (distance > 6) {
      console.log("Distance > 6, removing block and spawning item");
      event.block.setType(MinecraftBlockTypes.air);
      try {
        event.dimension.spawnItem(new ItemStack("engineer:upper_plate", 1), pos);
        console.log("Item spawned successfully");
      } catch (e) {
        console.warn("Failed to spawn item: " + e);
      }
    } else {
      try {
        event.block.setPermutation(event.block.permutation.withState("engineer:distance", distance));
        console.log(`Set distance state to ${distance}`);
      } catch (e) {
        console.warn("Failed to set distance state: " + e);
      }
    }
  }
});

function calculateSupportDistance(pos) {
  const belowPos = new BlockLocation(pos.x, pos.y - 1, pos.z);
  const belowBlock = world.getBlock(belowPos);
  if (belowBlock.typeId === "minecraft:air") {
    console.log("Block below is air, returning distance 7");
    return 7;
  }
  if (belowBlock.isSolid()) {
    console.log("Block below is solid, returning distance 0");
    return 0;
  }
  if (belowBlock.typeId === "engineer:upper_plate") {
    const belowDistance = belowBlock.permutation.getState("engineer:distance") || 0;
    console.log(`Block below is engineer:upper_plate with distance ${belowDistance}, returning ${belowDistance + 1}`);
    return belowDistance + 1;
  }
  console.log("No valid support, returning distance 7");
  return 7;
}

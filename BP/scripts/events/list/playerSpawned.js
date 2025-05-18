import { world, system } from "@minecraft/server"

world.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;
  const sentRequestTag = player.getTags().find(d => d.includes("tpaSentRequest:"));
  const requestTag = player.getTags().find(d => d.includes("tpaRequest:"));
  
  system.run(() => {
    sentRequestTag ? player.removeTag(sentRequestTag) : null;
    requestTag ? player.removeTag(removeTag) : null;
  })
  
})
import { world, system } from "@minecraft/server"
import config from "../../config.js"
import messages from "../../messages.js"

const tempCache = new Map()
export function process() {
  for(const player of world.getPlayers()) {
    if(!player.getDynamicProperty("teleporting")) {
      tempCache.delete(player.id);
      continue;
    };
    
    const cached = tempCache.get(player.id);
    const pos = {
      x: Math.floor(player.location.x),
      y: Math.floor(player.location.y),
      z: Math.floor(player.location.z)
    };

    if(cached) {
      if(cached.x === pos.x && cached.y === pos.y && cached.z === pos.z) continue;
      tempCache.delete(player.id)
      player.setDynamicProperty("teleporting", false)
      player?.sendSound(messages.events.moved.message, "note.bassattack")
    } else {
      tempCache.set(player.id, pos)
    }
  }
}

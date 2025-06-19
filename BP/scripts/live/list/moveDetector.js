import { world } from "@minecraft/server"
import { config } from "../../config.js"
const chatPrefix = config.prefix

let tempCache = []
globalThis.moveDetector = () => {
  let teleportData = db.fetch("teleportRequest", true);
  [...world.getPlayers()].forEach(player => {
    if(!player.hasTag("bedrocktpa:isTp")) return;
    
    
    if(tempCache.some(d => d.name === player.name)) {
      if(tempCache.some(d => d.name === player.name && d.recentLocation === player.location)) return;
      tempCache = tempCache.filter(d => d.name !== player.name)
      system.run(() => player.removeTag("bedrocktpa:isTp"))
      player.sendMessage(`${chatPrefix} ${config.Move_Cancel_Message}`)
    } else {
      tempCache.push({
        name: player.name,
        recentLocation: player.location
      })
    }
  })
}
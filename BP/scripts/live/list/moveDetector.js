import { world, system } from "@minecraft/server"
import { config } from "../../config.js"
import * as db from "../../utilities/database.js"
const chatPrefix = config.prefix

let tempCache = []
globalThis.moveDetector = () => {
  world.getPlayers().forEach(player => {
    if(!player.hasTag("bedrocktpa:isTp")) return;
    
    if(tempCache.some(d => d.name === player.name)) {
      if(tempCache.some(d => d.name === player.name && 
        d.recentLocation.x === Math.round(player.location.x) &&
        d.recentLocation.y === Math.round(player.location.y) &&
        d.recentLocation.z === Math.round(player.location.z)
      )) return;
      tempCache = tempCache.filter(d => d.name !== player.name)
      system.run(() => player.removeTag("bedrocktpa:isTp"))
      player.sendMessage(`${chatPrefix} ${config.Move_Cancel_Message}`)
    } else {
      tempCache.push({
        name: player.name,
        recentLocation: {
          x: Math.round(player.location.x),
          y: Math.round(player.location.y),
          z: Math.round(player.location.z)
        }
      })
    }
  })
}
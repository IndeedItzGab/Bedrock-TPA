import { world, system } from "@minecraft/server"
import * as db from "../../utilities/database.js"

globalThis.combatChecker = () => { 
  [...world.getPlayers()].forEach(player => {
    try {
      let hurtedData = db.fetch("bedrocktpa:hurted", true)
      let playerHurtData = hurtedData.find(d => d.name === player.name)
      if(!playerHurtData || playerHurtData?.time >= system.currentTick) return;
      
      system.run(() => player.removeTag("bedrocktpa:hurted"))
      hurtedData = hurtedData.filter(d => d.name !== player.anme)
      db.store("bedrocktpa:hurted", hurtedData)
    } catch (error) {
      console.error(error)
    }
  })
}
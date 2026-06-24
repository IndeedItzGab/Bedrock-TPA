import { world, system, Player} from "@minecraft/server"
import * as db from "../../utilities/DatabaseHandler.js"
import { config } from "../../config.js"
const chatPrefix = config.prefix

world.afterEvents.entityHurt.subscribe((event) => {
  if((event.hurtEntity instanceof Player) && event.hurtEntity.getDynamicProperty("teleporting")) {
    
    let teleportData = db.fetch("teleportRequest", true)
    if(teleportData.some(d => d.requester === event.hurtEntity.name)) {
      db.store("teleportRequest", teleportData.filter(d => d.requester !== event.hurtEntity.name))
    }
    
    event.hurtEntity.setDynamicProperty("hurted", Date.now() + (15*1000))
    event.hurtEntity.setDynamicProperty("teleporting", false)
    event.hurtEntity.sendMessage(`${chatPrefix} ${config.Damaged_Cancel_Message}`)
  }
})
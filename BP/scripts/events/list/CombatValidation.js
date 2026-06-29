import { world, system, Player} from "@minecraft/server"
import Database from "../../utilities/DatabaseHandler.js"
import config from "../../config.js"
import messages from "../../messages.js"

world.afterEvents.entityHurt.subscribe((event) => {
  if(event.hurtEntity.typeId === "minecraft:player"
    && event.hurtEntity.getDynamicProperty("teleporting")
    && (config.overridePackSetting
      ? config.detectCombat
      : world.getPackSettings()["bedrocktpa:detectCombat"])) {
        console.info(event.hurtEntity.typeId)
    
    let teleportData = Database.fetch("teleportRequest", true)
    if(teleportData.some(d => d.requester === event.hurtEntity.name)) {
      Database.store("teleportRequest", teleportData.filter(d => d.requester !== event.hurtEntity.name))
    }
    
    event.hurtEntity.setDynamicProperty("hurted", Date.now() + (15*1000))
    event.hurtEntity.setDynamicProperty("teleporting", false)
    event.hurtEntity?.sendSound(messages.events.combat.message)
  }
})
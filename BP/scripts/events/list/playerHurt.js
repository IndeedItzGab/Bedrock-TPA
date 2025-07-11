import { world, system, Player} from "@minecraft/server"
import * as db from "../../utilities/database.js"
import { config } from "../../config.js"
const chatPrefix = config.prefix

world.afterEvents.entityHurt.subscribe((event) => {
  if(!(event.hurtEntity instanceof Player) || !event.hurtEntity.hasTag("bedrocktpa:isTp")) return;

  let hurtedData = db.fetch("bedrocktpa:hurted", true)
  const victimData = hurtedData.find(d => d.name === event.hurtEntity.name)
  
  let teleportData = db.fetch("teleportRequest", true)
  if(teleportData.some(d => d.requester === event.hurtEntity.name)) {
    db.store("teleportRequest", teleportData.filter(d => d.requester !== event.hurtEntity.name))
  }

  !victimData ? 
      hurtedData.push({ name: event.hurtEntity.name, time: system.currentTick + (15*20)}) :
      victimData.time = system.currentTick + (15*20)

  system.run(() => event.hurtEntity.addTag("bedrocktpa:hurted"))
  system.run(() => event.hurtEntity.removeTag("bedrocktpa:isTp"))
  event.hurtEntity.sendMessage(`${chatPrefix} ${config.Damaged_Cancel_Message}`)
  
  db.store("bedrocktpa:hurted", hurtedData)
})
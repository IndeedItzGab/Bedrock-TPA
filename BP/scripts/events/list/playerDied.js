import { world } from "@minecraft/server"
import { config } from "../../config.js"
import { Local } from "../../utilities/database.js"
const chatPrefix = config.prefix
const db = new Local()

world.afterEvents.entityDie.subscribe(event => {
  const { deadEntity } = event
  if(!(deadEntity instanceof Player)) return;
  
  let backData = db.fetch("backData");
  backData = backData.filter(d => d.name !== deadEntity.name)
  backData.push({
    name: deadEntity.name,
    location: deadEntity.location,
    dimension: deadEntity.dimension.id
  })
  db.store("backData", backData)

  deadEntity.sendMessage(`${chatPrefix} ${config.Death_Message}`)
  
})
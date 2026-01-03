import { world, Player } from "@minecraft/server"
import { config } from "../../config.js"
import * as db from "../../utilities/DatabaseHandler.js"
const chatPrefix = config.prefix

world.afterEvents.entityDie.subscribe(event => {
  const { deadEntity } = event
  if(!(deadEntity instanceof Player)) return;
  
  let backData = db.fetch("backData", true);
  backData = backData.filter(d => d.name !== deadEntity.name)
  backData.push({
    name: deadEntity.name,
    location: deadEntity.location,
    dimension: deadEntity.dimension.id
  })
  db.store("backData", backData)

  deadEntity.sendMessage(`${chatPrefix} ${config.Death_Message}`)
  
})
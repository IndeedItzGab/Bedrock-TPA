import { world, Player } from "@minecraft/server"
import { config } from "../../config.js"
const chatPrefix = config.prefix

world.afterEvents.entityDie.subscribe(event => {
  const { deadEntity } = event
  if(!(deadEntity instanceof Player)) return;
  
  deadEntity.setDynamicProperty("backLocation", JSON.stringify({
    location: deadEntity.location,
    dimension: deadEntity.dimension.id
  }));
  deadEntity.sendMessage(`${chatPrefix} ${config.Death_Message}`)
})
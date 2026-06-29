import { world, Player } from "@minecraft/server"
import config from "../../config.js"
import messages from "../../messages.js"

world.afterEvents.entityDie.subscribe(event => {
  const { deadEntity } = event
  if(!(deadEntity instanceof Player)
    || (config.overridePackSetting
      ? !config.back.saveDeath
      : !world.getPackSettings()["bedrocktpa:saveDeath"])) return;
  
  deadEntity.setDynamicProperty("backLocation", JSON.stringify({
    location: deadEntity.location,
    dimension: deadEntity.dimension.id
  }));
  deadEntity?.sendSound(messages.events.death.message)
})
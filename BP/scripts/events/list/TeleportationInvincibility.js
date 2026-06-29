import { world, system } from "@minecraft/server"
import config from "../../config"

world.beforeEvents.entityHurt.subscribe(event => {
  const { hurtEntity } = event
  if(hurtEntity?.typeId !== "minecraft:player"
    || (config.overridePackSetting
      ? !config.invincibility
      : !world.getPackSettings()["bedrocktpa:invincibility"])) return;

  if(hurtEntity.getDynamicProperty("invincibility") >= Date.now()) {
    event.cancel = true;
  }
})
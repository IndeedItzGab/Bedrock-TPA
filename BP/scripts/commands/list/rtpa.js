import { world, system } from "@minecraft/server";
import { registerCommand } from "../CommandRegistry.js";
import config from "../../config.js";
import messages from "../../messages.js";

const commandInformation = {
  name: "rtpa",
  description: "Teleport to a random location.",
  permissionLevel: 0,
  aliases: [],
  usage: [
    // { will be implemented in the future update for administrators
    //   name: "player",
    //   type: "String",
    //   optional: true,
    // },
  ],
};

let cooldowns = new Map();
registerCommand(commandInformation, (origin, target) => {
  const player = origin.sourceEntity;

  if(player.getGameMode() === "Spectator" && (config.overridePackSetting ? !config.allowSpectator : !world.getPackSettings()["bedrocktpa:allowSpectator"]))
    return player.sendSound(messages.spectatorMode, "note.bassattack");

  // Cooldown
  const cooldown = cooldowns.get(player.id)
  if(cooldown?.tick >= system.currentTick) {
    player.sendSound(`${messages.commandCooldown.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
    return;
  } else {
    cooldowns.set(player.id, {tick: system.currentTick + (config.overridePackSetting ? config.commands.cooldown : world.getPackSettings()["bedrocktpa:commandsCooldown"])*20})
  }

  
  // Main
  const radius = (config.overridePackSetting ? config.randomTeleportationRadius : world.getPackSettings()["bedrocktpa:randomTeleportationRadius"]);
  let xrandom = Math.floor(Math.random() * (radius * 2)) - radius;
  let zrandom = Math.floor(Math.random() * (radius * 2)) - radius;

  const dimension = world.getDimension("overworld")
  player.sendSound(messages.rtpa.start.replace("%time%", (config.overridePackSetting ? config.teleportationDelay : world.getPackSettings()["bedrocktpa:teleportationDelay"])), "note.pling")
  player.setDynamicProperty("teleporting", true)
  system.runTimeout(async () => {
    if(player.getDynamicProperty("teleporting")) {
      if(config.overridePackSetting ? config.back.saveTeleportation : world.getPackSettings()["bedrocktpa:saveTeleportation"]) {
        await player.setDynamicProperty("backLocation", JSON.stringify({
          location: player.location,
          dimension: player.dimension.id
        }))
      }
      player.setDynamicProperty("teleporting", false)
      
      let finding = true;
      while(finding) {
        const tpHigh = system.runInterval(() => {
          player.tryTeleport({
            x: xrandom,
            y: 320,
            z: zrandom
          }, {dimension})
        }, 1)

        while (!dimension.isChunkLoaded({
          x: xrandom,
          y: 320,
          z: zrandom
        })) {
          await new Promise(resolve => {
            system.runTimeout(resolve, 1);
          });
        }

        const topBlock = await dimension?.getTopmostBlock({x: xrandom, z: zrandom})
        const firstBlock = dimension?.getBlock({ x: xrandom, y: topBlock?.location?.y + 1, z: zrandom })
        const secondBlock = dimension?.getBlock({ x: xrandom, y: topBlock?.location?.y + 2, z: zrandom })
        const isLiquid = (firstBlock?.isLiquid || firstBlock?.isWaterlogged) || (secondBlock?.isLiquid || secondBlock?.isWaterlogged)

        if(isLiquid) {
          // Relocate
          xrandom = Math.floor(Math.random() * (radius * 2)) - radius;
          zrandom = Math.floor(Math.random() * (radius * 2)) - radius;
        } else {
          finding = false
          player.setDynamicProperty("invincibility", Date.now() + (5*1000))
          player.sendSound(messages.teleportedSuccess, "mob.endermen.portal")
          player.tryTeleport(firstBlock.location, {dimension})
        }
        system.clearRun(tpHigh)
      }
    }
  }, (config.overridePackSetting ? config.teleportationDelay : world.getPackSettings()["bedrocktpa:teleportationDelay"])*20)
});


import { world, system } from "@minecraft/server";
import { registerCommand } from "../CommandRegistry.js";
import { config } from "../../config.js";
import { soundReply } from "../../utilities/SoundReply.js";
const chatPrefix = config.prefix;

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

  if (player.getGameMode() === "Spectator")
    return soundReply(player, config.Different_Gamemode, "note.bassattack");

  // Cooldown
  const cooldown = cooldowns.get(player.id)
  if(cooldown?.tick >= system.currentTick) {
    soundReply(player, `${config.Cooldown_Message.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
    return;
  } else {
    cooldowns.set(player.id, {tick: system.currentTick + config.commands.cooldown*20})
  }

  
  // Main
  const radius = config.Random_Teleport_Radius;
  let xrandom = Math.floor(Math.random() * (radius * 2)) - radius;
  let zrandom = Math.floor(Math.random() * (radius * 2)) - radius;

  const dimension = world.getDimension("overworld")
  soundReply(player, config.Random_Teleport_Message.replace("%time%", config.delay_teleportation), "note.pling")
  player.setDynamicProperty("teleporting", true)
  system.runTimeout(async () => {
    if(player.getDynamicProperty("teleporting")) {
      await player.setDynamicProperty("backLocation", JSON.stringify({
        location: player.location,
        dimension: player.dimension.id
      }))
      main()
      player.setDynamicProperty("teleporting", false)
    }
  }, config.delay_teleportation*20)
  
  async function main() {
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
      main()
    } else {
      soundReply(player, config.Teleported_Message, "mob.endermen.portal")
      player.tryTeleport(firstBlock.location, {dimension})
    }
    system.clearRun(tpHigh)
  }
});


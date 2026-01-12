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
    {
      name: "player",
      type: "String",
      optional: true,
    },
  ],
};

let cooldowns = new Map();
registerCommand(commandInformation, (origin) => {
  const player = origin.sourceEntity;
  if (player.getGameMode() === "Spectator")
    return player.sendMessage(`${chatPrefix} ${config.Different_Gamemode}`);

  // Cooldown
  const cooldown = cooldowns.get(player.id);
  if (cooldown?.tick >= system.currentTick) {
    soundReply(
      player,
      `${config.Cooldown_Message.replace(
        "%time%",
        (cooldown.tick - system.currentTick) / 20
      )}`,
      "note.bassattack"
    );
    return;
  } else {
    cooldowns.set(player.id, {
      tick: system.currentTick + config.commands.cooldown * 20,
    });
  }

  const radius = config.Random_Teleport_Radius;
  const xrandom = Math.floor(Math.random() * (radius * 2)) - radius;
  const zrandom = Math.floor(Math.random() * (radius * 2)) - radius;

  function getSafeY(dimension, x, z, maxY = 320, minY = -64) {
    for (let y = maxY; y >= minY; y--) {
      const block = dimension.getBlock({ x, y, z });
      if (!block) continue;

      // Skip air & liquids
      if (
        block.typeId !== "minecraft:air" &&
        block.typeId !== "minecraft:water" &&
        block.typeId !== "minecraft:lava"
      ) {
        return y + 1; // stand on top
      }
    }

    // fallback if nothing found
    return 100;
  }

  system.runTimeout(() => {
    const dimensions = {
      overworld: world.getDimension("overworld"),
      nether: world.getDimension("nether"),
      the_end: world.getDimension("the_end"),
    };

    const targetX = xrandom;
    const targetZ = zrandom;
    const dimensionOverworld = dimensions.overworld;

    // Step 1: teleport high so player doesn't fall into unloaded chunks
    system.runTimeout(() => {
      player.teleport(
        { x: targetX, y: 320, z: targetZ },
        { dimension: dimensionOverworld }
      );
    }, config.delay_teleportation * 20);
    soundReply(
      player,
      config.Random_Teleport_Message.replace(
        "%time%",
        config.delay_teleportation
      ),
      "note.pling"
    );

    // Step 2: wait for chunk / block to load
    const waitForChunk = system.runInterval(() => {
      const block = dimensionOverworld.getBlock({
        x: targetX,
        y: 0,
        z: targetZ,
      });

      if (block) {
        // Chunk loaded → find safe Y
        const safeY = getSafeY(dimensionOverworld, targetX, targetZ);

        // Final teleport on top of safe block
        player.teleport(
          { x: targetX, y: safeY, z: targetZ },
          { dimension: dimensionOverworld }
        );

        // Stop interval
        system.clearRun(waitForChunk);
      }
    }, 2); // check every 2 ticks (~0.1s)
  }, 1);

  return {
    status: 0,
  };
});

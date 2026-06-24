import { world, system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import { config } from "../../config.js"
import { soundReply } from "../../utilities/SoundReply.js";

const commandInformation = {
  name: "tpaignore",
  description: "Ignores a player from teleport requests",
  usage:[
    {
      name: "player",
      type: "String",
      optional: false
    }
  ]
}

let cooldowns = new Map()
registerCommand(commandInformation, (origin, target) => {
  const player = origin.sourceEntity
  if(player.getGameMode() === "Spectator")
    return  soundReply(player, config.Different_Gamemode, "note.bassattack");

  // Cooldown
  const cooldown = cooldowns.get(player.id)
  if(cooldown?.tick >= system.currentTick) {
    soundReply(player, `${config.Cooldown_Message.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
    return;
  } else {
    cooldowns.set(player.id, {tick: system.currentTick + config.commands.cooldown*20})
  }

  const targetPlayer = world.getPlayers().find(p => p.name === target)
  if(!targetPlayer)
    return soundReply(player, config.Player_Is_Null, "note.bassattack")

  // Main Function
  const ignorePlayers = JSON.parse(player.getDynamicProperty("ignorePlayers") || "[]")
  if(player.name === targetPlayer.name)
    return soundReply(player, config.Player_Is_Player_tpignore, "note.bassattack")
  
  if(!ignorePlayers?.some(d => d === targetPlayer.name)) {
    ignorePlayers.push(targetPlayer.name)
    player.setDynamicProperty("ignorePlayers", JSON.stringify(ignorePlayers))
    soundReply(player, config.Player_Is_Ignored, "note.pling")
  } else {
    player.setDynamicProperty("ignorePlayers", JSON.stringify(ignorePlayers.filter(d => d !== targetPlayer.name)))
    soundReply(player, config.Player_Is_Already_Ignored, "note.bassattack")
  }
})
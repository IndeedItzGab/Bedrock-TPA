import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/DatabaseHandler.js"
import { soundReply } from "../../utilities/SoundReply.js";
const chatPrefix = config.prefix

const commandInformation = {
  name: "tpatoggle",
  description: "Disables/Enables the teleportation to you or to a specific player.",
  usage:[
    {
      name: "player",
      type: "String",
      optional: true
    }
  ]
}

let cooldowns = new Map()
registerCommand(commandInformation, (origin, target) => {
  
  const player = origin.sourceEntity
  if(player.getGameMode() === "Spectator") return player.sendMessage(`${chatPrefix} ${config.Different_Gamemode}`)

  // Cooldown
  const cooldown = cooldowns.get(player.id)
  if(cooldown?.tick >= system.currentTick) {
    soundReply(player, `${config.Cooldown_Message.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
    return;
  } else {
    cooldowns.set(player.id, {tick: system.currentTick + config.commands.cooldown*20})
  }
  
  let toggle = db.fetch("tpaToggle", true)
  if(target) {
    // Administrative Function
    if(player.playerPermissionLevel !== 2) return player.sendMessage(`${chatPrefix} ${config.No_Permission_Message}`)
    const targetPlayer = world.getPlayers().find(p => p.name === target)
    if(!targetPlayer) return soundReply(player, config.Player_Is_Null, "note.bassattack")
    
    if(toggle.some(d => d.name === targetPlayer.name)) {
      // Enable TPA to a specified player
      toggle = toggle.filter(d => d.name !== targetPlayer.name)
      soundReply(targetPlayer, config.TpaToggle_Activated_Player_2.replace("%player%", player.name), "note.pling")
      soundReply(player, config.TpaToggle_Activated_Player.replace("%player%", targetPlayer.name), "note.banjo")
    } else {
      // Disable TPA to a specified player
      toggle.push({
        name: targetPlayer.name
      })
      soundReply(targetPlayer, config.TpaToggle_Deactivated_Player_2.replace("%player%", player.name), "note.pling")
      soundReply(player, config.TpaToggle_Deactivated_Player.replace("%player%", targetPlayer.name), "note.banjo")
    }
  } else {
    // Non-Administrative Function
    if(toggle.some(d => d.name === player.name)) {
      // Enable TPA to a specified player
      toggle = toggle.filter(d => d.name !== player.name)
      player.sendMessage(`${chatPrefix} ${config.TpaToggle_Activated}`)
      soundReply(player, config.TpaToggle_Activated, "note.pling")
    } else {
      // Disable TPA to a specified player
      toggle.push({
        name: player.name
      })
      soundReply(player, config.TpaToggle_Deactivated, "note.pling")
    }
  }
  
  db.store("tpaToggle", toggle)
})
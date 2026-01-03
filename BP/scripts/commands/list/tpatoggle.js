import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/DatabaseHandler.js"
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

let cooldowns = []
registerCommand(commandInformation, (origin, target) => {
  
  const player = origin.sourceEntity
  if(player.getGameMode() === "Spectator") return player.sendMessage(`${chatPrefix} ${config.Different_Gamemode}`)

  // Cooldown
  const cooldown = cooldowns.find(d => d.name === player.name)
  if(cooldown?.tick >= system.currentTick) {
    player.sendMessage(`${chatPrefix} ${config.Cooldown_Message.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`)
    return;
  } else {
    cooldowns = cooldowns.filter(d => d.name !== player.name)
    cooldowns.push({
      name: player.name,
      tick: system.currentTick + config.tpa_cooldown*20
    })
  }

  let toggle = db.fetch("tpaToggle", true)
  if(target) {
    // Administrative Function
    if(player.playerPermissionLevel !== 2) return player.sendMessage(`${chatPrefix} ${config.No_Permission_Message}`)
    const targetPlayer = world.getPlayers().find(p => p.name === target)
    if(!targetPlayer) return player.sendMessage(`${chatPrefix} ${config.Player_Is_Null}`)
    
    if(toggle.some(d => d.name === targetPlayer.name)) {
      // Enable TPA to a specified player
      toggle = toggle.filter(d => d.name !== targetPlayer.name)
      targetPlayer.sendMessage(`${chatPrefix} ${config.TpaToggle_Activated_Player_2.replace("%player%", player.name)}`)
      player.sendMessage(`${chatPrefix} ${config.TpaToggle_Activated_Player.replace("%player%", targetPlayer.name)}`)
    } else {
      // Disable TPA to a specified player
      toggle.push({
        name: targetPlayer.name
      })
      targetPlayer.sendMessage(`${chatPrefix} ${config.TpaToggle_Deactivated_Player_2.replace("%player%", player.name)}`)
      player.sendMessage(`${chatPrefix} ${config.TpaToggle_Deactivated_Player.replace("%player%", targetPlayer.name)}`)
    }
  } else {
    // Non-Administrative Function
    if(toggle.some(d => d.name === player.name)) {
      // Enable TPA to a specified player
      toggle = toggle.filter(d => d.name !== player.name)
      player.sendMessage(`${chatPrefix} ${config.TpaToggle_Activated}`)
    } else {
      // Disable TPA to a specified player
      toggle.push({
        name: player.name
      })
      player.sendMessage(`${chatPrefix} ${config.TpaToggle_Deactivated}`)
    }
  }
  
  db.store("tpaToggle", toggle)
})
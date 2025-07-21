import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../commandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/database.js"
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

registerCommand(commandInformation, (origin, targetPlayerName) => {
  
  const player = origin.sourceEntity
  if(player.getGameMode() === "Spectator") return player.sendMessage(`${chatPrefix} ${config.Different_Gamemode}`)

  let toggle = db.fetch("tpaToggle", true)
  
  if(targetPlayerName) {
    // Administrative Function
    if(player.playerPermissionLevel < 2) return player.sendMessage(`${chatPrefix} ${config.No_Permission_Message}`)
    const targetPlayer = world.getPlayers().find(p => p.name.toLowerCase() === targetPlayerName.toLowerCase())
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
  return {
    status: 0
  }
})
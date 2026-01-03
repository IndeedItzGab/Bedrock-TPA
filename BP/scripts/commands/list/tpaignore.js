import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/DatabaseHandler.js"
const chatPrefix = config.prefix

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

  const targetPlayer = world.getPlayers().find(p => p.name === target)
  if(!targetPlayer) return player.sendMessage(`${chatPrefix} ${config.Player_Is_Null}`)

  // Main Function
  let ignoreData = db.fetch("tpaIgnoreRequest", true)
  if(player.name === targetPlayer.name) return player.sendMessage(`${chatPrefix} ${config.Player_Is_Player_tpignore}`)
  
  if(!ignoreData.some(d => d?.blocker === player.name && d?.blockedUser === targetPlayer.name)) {
    ignoreData.push({
      blocker: player.name,
      blockedUser: targetPlayer.name
    })
    player.sendMessage(`${chatPrefix} ${config.Player_Is_Ignored}`)
  } else {
    ignoreData = ignoreData.filter(d => d.blocker !== player.name && d.blockedUser !== targetPlayer.name)
    player.sendMessage(`${chatPrefix} ${config.Player_Is_Already_Ignored}`)
  }
  db.store("tpaIgnoreRequest", ignoreData)
  
  return {
    status: 0
  }
})
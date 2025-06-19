import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../commandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/database.js"
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

registerCommand(commandInformation, (origin, targetPlayerName) => {
  
  const player = origin.sourceEntity
  if(player.getGameMode() === "Spectator") return player.sendMessage(`${chatPrefix} ${config.Different_Gamemode}`)

  const targetPlayer = world.getPlayers().find(p => p.name.toLowerCase() === targetPlayerName.toLowerCase())
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
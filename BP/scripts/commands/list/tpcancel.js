import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/DatabaseHandler.js"
const chatPrefix = config.prefix

const commandInformation = {
  name: "tpcancel",
  description: "Cancels a teleportation request to a specific player.",
  aliases: [],
  usage:[
    {
      name: "player",
      type: "String",
      optional: false
    }
  ]
}


registerCommand(commandInformation, (origin, target) => {
  
  const player = origin.sourceEntity
  if(player.getGameMode() === "Spectator") return player.sendMessage(`${chatPrefix} ${config.Different_Gamemode}`)

  const targetPlayer = world.getPlayers().find(p => p.name === target)
  if(!targetPlayer) return player.sendMessage(`${chatPrefix} ${config.Player_Is_Null}`)

  // Main Function
  let teleportData = db.fetch("teleportRequest", true)
  if(!teleportData.some(d => d.requester === player.name && d.receiver === targetPlayer.name)) return player.sendMessage(`${chatPrefix} ${config.No_Teleport_Requests}`)
  if(player.name === targetPlayer.name) return player.sendMessage(`${chatPrefix} ${config.Error_Cancelling_Request}`)
  
  player.sendMessage(`${chatPrefix} ${config.Request_Cancelled}`)
  teleportData = teleportData.filter(d => d.requester !== player.name && d.receiver !== targetPlayer.name)
  db.store("teleportRequest", teleportData)
  
  return {
    status: 0
  }
})
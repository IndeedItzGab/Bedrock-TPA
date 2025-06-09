import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../commandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/database.js"
const chatPrefix = config.prefix

const commandInformation = {
  name: "tpdeny",
  description: "Denies the teleportation request.",
  aliases: [],
  usage:[]
}

registerCommand(commandInformation, (origin) => {
  
  const player = origin.sourceEntity
  if(player.getGameMode() === "Spectator") return player.sendMessage(`${chatPrefix} ${config.Different_Gamemode}`)

  // Main Function
  let teleportData = db.fetch("teleportRequest", true)
  if(!teleportData.some(d => d.receiver === player.name)) return player.sendMessage(`${chatPrefix} ${config.No_Teleport_Requests}`)
  
  const targetPlayer = world.getPlayers().find(p => p.name === teleportData.find(d => d.receiver === player.name).requester)
  player.sendMessage(`${chatPrefix} ${config.Rejected_Message}`)
  targetPlayer.sendMessage(`${chatPrefix} ${config.Rejected_Sender}`)
  teleportData = teleportData.filter(d => d.receiver !== player.name && d.requester !== targetPlayer.name)
  db.store("teleportRequest", teleportData)
  
  return {
    status: 0
  }
})
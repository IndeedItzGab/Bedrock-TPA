import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../commandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/database.js"
const chatPrefix = config.prefix

const commandInformation = {
  name: "tpaccept",
  description: "Accepts the request.",
  aliases: [],
  usage:[]
}

registerCommand(commandInformation, (origin) => {
  
  const player = origin.sourceEntity
  
  // Main Function
  let teleportData = db.fetch("teleportRequest", true)
  let backData = db.fetch("backData", true);
  if(!teleportData.some(d => d.receiver === player.name)) return player.sendMessage(`${chatPrefix} ${config.No_Teleport_Requests}`)
  
  const targetPlayer = world.getPlayers().find(p => p.name === teleportData?.find(d => d.receiver === player.name)?.requester)
  player.sendMessage(`${chatPrefix} ${config.Teleport_Message_Back_To_Player}`)
  
  if(targetPlayer) {
    if(teleportData.find(d => d.receiver === player.name)?.type === "tpa") {
      targetPlayer.sendMessage(`${chatPrefix} ${config.Teleport_Message.replace("%time%", config.delay_teleportation)}`)
      system.runTimeout(() => {
        targetPlayer.tryTeleport(player.location, player.dimension)
        player.sendMessage(`${chatPrefix} ${config.Teleported_Message}`)
        targetPlayer.sendMessage(`${chatPrefix} ${config.Teleported_Message}`)
        
        backData = backData.filter(d => d.name !== targetPlayer.name)
        backData.push({
          name: targetPlayer.name,
          location: targetPlayer.location,
          dimension: targetPlayer.dimension.id
        })
        db.store("backData", backData)
      }, config.delay_teleportation*20)
    } else {
      player.sendMessage(`${chatPrefix} ${config.Teleport_Message.replace("%time%", config.delay_teleportation)}`)
      
      system.runTimeout(() => {
        player.tryTeleport(targetPlayer.location, targetPlayer.dimension)
        player.sendMessage(`${chatPrefix} ${config.Teleported_Message}`)
        targetPlayer.sendMessage(`${chatPrefix} ${config.Teleported_Message}`)
  
        backData = backData.filter(d => d.name !== player.name)
        backData.push({
          name: player.name,
          location: player.location,
          dimension: player.dimension.id
        })
        db.store("backData", backData)
      }, config.delay_teleportation*20)
    }
  } else {
    player.sendMessage(`${chatPrefix} ${config.Invalid_Player}`)
  }
  
  teleportData = teleportData.filter(d => d.receiver !== player.name && d.requester !== targetPlayer.name)
  db.store("teleportRequest", teleportData)
  targetPlayer.sendMessage(`${chatPrefix} ${config.Teleport_Message_Back_To_Sender.replace("%player%", player.name)}`)

  
  return {
    status: 0
  }
})
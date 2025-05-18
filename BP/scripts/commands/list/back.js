import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../commandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/database.js"
const chatPrefix = config.prefix

const commandInformation = {
  name: "back",
  description: "Teleports you to your last location.",
  aliases: [],
  usage:[]
}

registerCommand(commandInformation, (origin) => {
  
  const player = origin.sourceEntity
  
  // Main Function
  let backData = db.fetch("backData", true)
  if(!backData.some(d => d.name === player.name)) return player.sendMessage(`${chatPrefix} ${config.Player_Doesnt_Have_Back_Point_1}`)
  
  let playerBackData = backData.find( d => d.name === player.name)
  system.runTimeout(() => {
    const dimension = world.getDimension(playerBackData.dimension)
    player.tryTeleport(playerBackData.location, {dimension})
    player.sendMessage(`${chatPrefix} ${config.Teleported_Message}`)
    backData = backData.filter(d => d.name !== player.name)
    backData.push({
      name: player.name,
      location: player.location,
      dimension: player.dimension.id
    })
    db.store("backData", backData)
  }, config.delay_teleportation*20)
  
  player.sendMessage(`${chatPrefix} ${config.Teleport_Message.replace("%time%", config.delay_teleportation)}`)

  
  return {
    status: 0
  }
})
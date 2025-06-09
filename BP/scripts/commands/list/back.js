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
  description: "Teleports you or a player to its last positiion.",
  aliases: [],
  usage:[
    {
      name: "player",
      type: 3,
      optional: true
    }
  ]
}

registerCommand(commandInformation, (origin, targetPlayerName) => {
  
  let player = origin.sourceEntity
  let backData = db.fetch("backData", true)
  if(player.getGameMode() === "Spectator") return player.sendMessage(`${chatPrefix} ${config.Different_Gamemode}`)

  if(targetPlayerName) {
    // Administrative Function
    if(!player.isAdmin()) return player.sendMessage(`${chatPrefix} ${config.No_Permission_Message}`)
    const targetPlayer = world.getPlayers().find(p => p.name === targetPlayerName)
    const toggleData = db.fetch("toggleData", true)

    if(!targetPlayer) return player.sendMessage(`${chatPrefix} ${config.Player_Is_Null}`)
    if(toggleData.some(d => d.name === targetPlayerName)) return player.sendMessage(`${chatPrefix} ${config.TpaToggled_Player_Message}`)
    if(!backData.some(d => d.name === targetPlayerName)) return  player.sendMessage(`${chatPrefix} ${config.Player_Doesnt_Have_Back_Point}`)
    
    let playerBackData = backData.find( d => d.name === targetPlayer.name)
    const dimension = world.getDimension(playerBackData.dimension)
    
    system.run(() => targetPlayer.tryTeleport(playerBackData.location, {dimension}))
    targetPlayer.sendMessage(`${chatPrefix} ${config.Teleported_Message}`)
    backData = backData.filter(d => d.name !== targetPlayer.name)
    backData.push({
      name: targetPlayer.name,
      location: targetPlayer.location,
      dimension: targetPlayer.dimension.id
    })
    
    targetPlayer.sendMessage(`${chatPrefix} ${config.Teleported_Message}`)
    player.sendMessage(`${chatPrefix} ${config.Teleported_Message}`)
  } else {
    // Non-Administrative Function
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
    }, config.delay_teleportation*20)
    player.sendMessage(`${chatPrefix} ${config.Teleport_Message.replace("%time%", config.delay_teleportation)}`)
  }
  db.store("backData", backData)
  return {
    status: 0
  }
})
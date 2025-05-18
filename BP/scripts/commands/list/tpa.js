import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../commandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/database.js"
const chatPrefix = config.prefix

const commandInformation = {
  name: "tpa",
  description: "Sends a teleportation request.",
  aliases: [],
  usage:[
    {
      name: "player",
      type: 3,
      optional: false
    }
  ]
}

registerCommand(commandInformation, (origin, targetPlayerName) => {
  
  const player = origin.sourceEntity
  const targetPlayer = world.getPlayers().find(p => p.name.toLowerCase() === targetPlayerName.toLowerCase())
  if(!targetPlayer) return player.sendMessage(`${chatPrefix} ${config.Player_Is_Null}`)
  // Cooldown
  let cooldowns = db.fetch("cooldown", true)
  const cooldown = cooldowns.find(d => d.name === player.name && d.command === "tpa") || []
  if(cooldown?.tick >= system.currentTick) {
    player.sendMessage(`${chatPrefix} ${config.Cooldown_Message.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`)
    return;
  }
  
  cooldowns = cooldowns.filter(d => d.name !== player.name && d.command !== "tpa")
  cooldowns.push({
    name: player.name,
    command: "tpa",
    tick: system.currentTick + config.tpa_cooldown*20
  })
  
  db.store("cooldown", cooldowns)
  // Main Function
  let teleportData = db.fetch("teleportRequest", true)
  let backData = db.fetch("backData", true);
  if(player.name === targetPlayer.name) return player.sendMessage(`${chatPrefix} ${config.Player_Is_Player}`)
  if(targetPlayer.dimension.id !== player.dimension.id) return player.sendMessage(`${chatPrefix} ${config.Player_Not_Same_World}`)
  if(teleportData.some(d => d.requester === player.name && type === "tpa")) return player.sendMessage(`${chatPrefix} ${config.Already_A_TP_Request}`)

  // if TargetPlayer have TPA auto accept enabled
  if(targetPlayer.hasTag("tpaAuto")) {
    player.sendMessage(`${chatPrefix} ${config.Teleport_Message_TPAUTO.replace("%time%", config.delay_teleportation)}`)
    system.runTimeout(() => {
      player.tryTeleport(targetPlayer.location, targetPlayer.dimension)
      player.sendMessage(`${chatPrefix} ${config.Teleported_Message}`)
      targetPlayer.sendMessage(`${chatPrefix} ${config.Teleported_Message_TpAuto.replace("%player%", player.name)}`)
      
      backData = backData.filter(d => d.name !== player.name)
      backData.push({
        name: player.name,
        location: player.location,
        dimension: player.dimension.id
      })
      db.store("backData", backData)
    }, config.delay_teleportation*20)
    return;
  } else {
    targetPlayer.sendMessage(`${chatPrefix} ${config.Sent_Request_On_You.replace("%player%", player.name)}`)
    targetPlayer.sendMessage(`${chatPrefix} ${config.Accept_Message}`)
    targetPlayer.sendMessage(`${chatPrefix} ${config.Deny_Message}`)
    player.sendMessage(`${chatPrefix} ${config.Sending_Teleport_Request.replace("%player%", targetPlayer.name)}`)
  }
  
  teleportData.push({
    requester: player.name,
    receiver: targetPlayer.name,
    type: "tpa"
  })
  
  db.store("teleportRequest", teleportData)
  // Timeout
  system.runTimeout(() => {
    teleportData = db.fetch("teleportRequest", true)
    if(!teleportData.find(d => d.receiver === targetPlayer.name && d.requester === player.name)) return;
    teleportData = teleportData.filter(d => !(d.receiver === targetPlayer.name && d.requester === player.name))
    player.sendMessage(`${chatPrefix} ${config.Timed_Out_Message}`)
    db.store("teleportRequest", teleportData)
  }, config.keep_alive*20)

  return {
    status: 0
  }
})
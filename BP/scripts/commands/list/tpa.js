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
      type: "String",
      optional: false
    }
  ]
}

registerCommand(commandInformation, (origin, targetPlayerName) => {
  
  const player = origin.sourceEntity
  if(player.getGameMode() === "Spectator") return player.sendMessage(`${chatPrefix} ${config.Different_Gamemode}`)

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
  const targetPlayer = world.getPlayers().find(p => p.name.toLowerCase() === targetPlayerName.toLowerCase())
  if(!targetPlayer) return player.sendMessage(`${chatPrefix} ${config.TpaToggled_Player_Message}`)
  
  // Check if the targetPlayer disabled their tpa
  const toggle = db.fetch("tpaToggle", true)
  if(toggle.some(d => d.name === targetPlayer.name)) return player.sendMessage(`${chatPrefix} ${config.TpaToggled_Player_Message}`)
  
  // Check if the targetPlayer ignored player
  const Ignore = db.fetch("tpaIgnoreRequest", true)
  if(Ignore.some(d => d?.blocker === targetPlayer.name && d?.blockedUser === player.name)) return player.sendMessage(`${chatPrefix} ${config.Player_Has_Ignored_You}`)

  let teleportData = db.fetch("teleportRequest", true)
  let backData = db.fetch("backData", true);
  if(player.name === targetPlayer.name) return player.sendMessage(`${chatPrefix} ${config.Player_Is_Player}`)
  //if(targetPlayer.dimension.id !== player.dimension.id) return player.sendMessage(`${chatPrefix} ${config.Player_Not_Same_World}`)
  if(teleportData.some(d => d.requester === player.name && d.type === "tpa")) return player.sendMessage(`${chatPrefix} ${config.Already_A_TP_Request}`)
  if(player.hasTag("bedrocktpa:hurted")) return player.sendMessage(`${chatPrefix} ${config.Damaged_Cancel_Message}`)

  // if TargetPlayer have TPA auto accept enabled
  if(targetPlayer.hasTag("tpaAuto")) {
    player.sendMessage(`${chatPrefix} ${config.Teleport_Message_TPAUTO.replace("%time%", config.delay_teleportation)}`)
    system.run(() => player.addTag("bedrocktpa:isTp"))
    system.runTimeout(() => {
      if(!player.hasTag("bedrocktpa:isTp")) return;
      player.tryTeleport(targetPlayer.location, targetPlayer.dimension)
      player.sendMessage(`${chatPrefix} ${config.Teleported_Message}`)
      targetPlayer.sendMessage(`${chatPrefix} ${config.Teleported_Message_TpAuto.replace("%player%", player.name)}`)
      
      backData = backData.filter(d => d.name !== player.name)
      backData.push({
        name: player.name,
        location: player.location,
        dimension: player.dimension.id
      })
      system.run(() => player.removeTag("bedrocktpa:isTp"))
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
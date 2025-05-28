import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../commandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/database.js"
const chatPrefix = config.prefix

const commandInformation = {
  name: "tpahereall",
  description: "Sends a teleportation request to teleport everyone to you.",
  aliases: [],
  usage:[]
}

registerCommand(commandInformation, (origin) => {
  
  const player = origin.sourceEntity
  if(!player.isAdmin()) return player.sendMessage(`${chatPrefix} ${config.No_Permission_Message}`)

  // Cooldown
  let cooldowns = db.fetch("cooldown", true)
  const cooldown = cooldowns.find(d => d.name === player.name && d.command === "tpahere") || []
  if(cooldown?.tick >= system.currentTick) {
    player.sendMessage(`${chatPrefix} ${config.Cooldown_Message.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`)
    return;
  }
  
  cooldowns = cooldowns.filter(d => d.name !== player.name && d.command !== "tpa")
  cooldowns.push({
    name: player.name,
    command: "tpahere",
    tick: system.currentTick + config.tpa_cooldown*20
  })
  
  db.store("cooldown", cooldowns)
  
  // Main Function
  let teleportData = db.fetch("teleportRequest", true)

  world.getPlayers().forEach(targetPlayer => {
    if(player.name === targetPlayer.name) return
    if(teleportData.some(d => d.receiver === targetPlayer.name && d.type === "tpahere")) return; // Avoid requesting to a player with an on-going teleportation here request
    
    // Check if the targetPlayer disabled their tpa
    const toggle = db.fetch("tpaToggle", true)
    if(toggle.some(d => d.name === targetPlayer.name)) return;
    
    // Check if the targetPlayer ignored player
    const Ignore = db.fetch("tpaIgnoreRequest", true)
    if(Ignore.some(d => d?.blocker === targetPlayer.name && d?.blockedUser === player.name)) return;


    targetPlayer.sendMessage(`${chatPrefix} ${config.Sent_Here_Request_On_You.replace("%player%", player.name)}`)
    targetPlayer.sendMessage(`${chatPrefix} ${config.Accept_Message}`)
    targetPlayer.sendMessage(`${chatPrefix} ${config.Deny_Message}`)

    teleportData.push({
      requester: player.name,
      receiver: targetPlayer.name,
      type: "tpahere"
    })
    
    db.store("teleportRequest", teleportData)
    // Delay the teleportation with the given configuration.
    system.runTimeout(() => {
      teleportData = db.fetch("teleportRequest", true)
      if(!teleportData.find(d => d.receiver === targetPlayer.name && d.requester === player.name && d.type === "tpahere")) return;
      teleportData = teleportData.filter(d => !(d.receiver === targetPlayer.name && d.requester === player.name && d.type === "tpahere"))
      player?.sendMessage(`${chatPrefix} ${config.Timed_Out_Here_Message}`)
      db.store("teleportRequest", teleportData)
    }, config.keep_alive*20)
  })
  player.sendMessage(`${chatPrefix} ${config.Teleport_Message_Back_To_Sender_TPHEREALL}`)
  return {
    status: 0
  }
})
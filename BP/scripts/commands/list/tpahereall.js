import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/DatabaseHandler.js"
import { soundReply } from "../../utilities/SoundReply.js";
const chatPrefix = config.prefix

const commandInformation = {
  name: "tpahereall",
  description: "Sends a teleportation request to teleport everyone to you.",
  permissionLevel: 1,
  aliases: [],
  usage:[]
}

let cooldowns = new Map()
registerCommand(commandInformation, (origin) => {
  
  const player = origin.sourceEntity
  if(player.getGameMode() === "Spectator") return player.sendMessage(`${chatPrefix} ${config.Different_Gamemode}`)

  // Cooldown
  const cooldown = cooldowns.get(player.id)
  if(cooldown?.tick >= system.currentTick) {
    soundReply(player, `${config.Cooldown_Message.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
    return;
  } else {
    cooldowns.set(player.id, {tick: system.currentTick + config.commands.cooldown*20})
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
    soundReply(targetPlayer, config.Deny_Message, "note.banjo")

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
      soundReply(player, config.Timed_Out_Here_Message, "note.bassattack")
      db.store("teleportRequest", teleportData)
    }, config.keep_alive*20)
  })
  soundReply(player, config.Teleport_Message_Back_To_Sender_TPHEREALL, "note.banjp")
  return {
    status: 0
  }
})
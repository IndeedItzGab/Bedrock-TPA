import { world, system } from "@minecraft/server";
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

  // Main Function
  let teleportData = db.fetch("teleportRequest", true)
  for(const targetPlayer of world.getPlayers()) {
    if(player.name === targetPlayer.name) continue;
    if(teleportData.some(d => d.receiver === targetPlayer.name && d.type === "tpahere")) continue; // Avoid requesting to a player with an on-going teleportation here request
    if(targetPlayer.getDynamicProperty("teleportationDisable")) continue;
    if(JSON.parse(targetPlayer.getDynamicProperty("ignorePlayers") || "[]").some(d => d === player.name)) continue;

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
  }
  soundReply(player, config.Teleport_Message_Back_To_Sender_TPHEREALL, "note.banjp")
})
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
  name: "tpahere",
  description: "Sends a teleportation request to teleport the player to you.",
  aliases: [],
  usage:[
    {
      name: "player",
      type: "String",
      optional: false
    }
  ]
}

let cooldowns = new Map()
registerCommand(commandInformation, (origin, target) => {
  
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
  const targetPlayer = world.getPlayers().find(p => p.name === target)
  if(!targetPlayer) return soundReply(player, config.Player_Is_Null, "note.bassattack")
  
  // Check if the targetPlayer disabled their tpa
  const toggle = db.fetch("tpaToggle", true)
  if(toggle.some(d => d.name === targetPlayer.name)) return soundReply(player, config.TpaToggled_Player_Message, "note.bassattack")
 
  // Check if the targetPlayer ignored player
  const Ignore = db.fetch("tpaIgnoreRequest", true)
  if(Ignore.some(d => d?.blocker === targetPlayer.name && d?.blockedUser === player.name)) return soundReply(player, config.Player_Has_Ignored_You, "note.bassattack")

  let teleportData = db.fetch("teleportRequest", true)
  if(player.name === targetPlayer.name) return soundReply(player, config.Player_Is_Player, "note.bassattack")
  //if(targetPlayer.dimension.id !== player.dimension.id) return player.sendMessage(`${chatPrefix} ${config.Player_Not_Same_World}`)
  if(teleportData.some(d => d.requester === player.name && d.type === "tpahere")) return soundReply(player, config.Already_A_TPHere_Request, "note.bassattack")
  if(player.hasTag("bedrocktpa:hurted")) return soundReply(player, config.Damaged_Cancel_Message, "note.bassattack")


  targetPlayer.sendMessage(`${chatPrefix} ${config.Sent_Here_Request_On_You.replace("%player%", player.name)}`)
  targetPlayer.sendMessage(`${chatPrefix} ${config.Accept_Message}`)
  soundReply(targetPlayer, config.Deny_Message, "note.banjo")
  soundReply(player, config.Sending_Teleport_Here_Request.replace("%player%", targetPlayer.name), "note.banjo")
  
  teleportData.push({
    requester: player.name,
    receiver: targetPlayer.name,
    type: "tpahere"
  })
  
  db.store("teleportRequest", teleportData)
  
  // Timeout
  system.runTimeout(() => {
    teleportData = db.fetch("teleportRequest", true)
    if(!teleportData.find(d => d.receiver === targetPlayer.name && d.requester === player.name && d.type === "tpahere")) return;
    teleportData = teleportData.filter(d => !(d.receiver === targetPlayer.name && d.requester === player.name && d.type === "tpahere"))
    soundReply(player, config.Timed_Out_Here_Message, "note.bassattack")
    db.store("teleportRequest", teleportData)
  }, config.keep_alive*20)

  return {
    status: 0
  }
})
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
  name: "tpdeny",
  description: "Denies the teleportation request.",
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
  if(!teleportData.some(d => d.receiver === player.name)) return soundReply(player, config.No_Teleport_Requests, "note.bassattack")
  
  const targetPlayer = world.getPlayers().find(p => p.name === teleportData.find(d => d.receiver === player.name).requester)
  soundReply(player, config.Rejected_Message, "note.fling")
  soundReply(targetPlayer, config.Rejected_Sender, "note.bassattack")
  teleportData = teleportData.filter(d => d.receiver !== player.name && d.requester !== targetPlayer.name)
  db.store("teleportRequest", teleportData)
  
  return {
    status: 0
  }
})
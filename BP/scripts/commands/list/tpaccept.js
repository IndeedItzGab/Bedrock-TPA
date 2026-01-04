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
  name: "tpaccept",
  description: "Accepts the request.",
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
  let backData = db.fetch("backData", true);
  if(!teleportData.some(d => d.receiver === player.name)) return soundReply(player, config.No_Teleport_Requests, "note.bassattack")
  
  const targetPlayer = world.getPlayers().find(p => p.name === teleportData?.find(d => d.receiver === player.name)?.requester)
  soundReply(player, config.Teleport_Message_Back_To_Player, "note.banjo")
  
  if(targetPlayer) {
    if(teleportData.find(d => d.receiver === player.name)?.type === "tpa") {
      soundReply(targetPlayer, config.Teleport_Message.replace("%time%", config.delay_teleportation), "note.pling")
      system.run(() => targetPlayer.addTag(`bedrocktpa:isTp`))
      system.runTimeout(() => {
        if(!targetPlayer.hasTag("bedrocktpa:isTp")) return
        targetPlayer.tryTeleport(player.location, player.dimension)
        soundReply(player, config.Teleported_Message, "mob.endermen.portal")
        soundReply(targetPlayer, config.Teleported_Message, "mob.endermen.portal")
        
        backData = backData.filter(d => d.name !== targetPlayer.name)
        backData.push({
          name: targetPlayer.name,
          location: targetPlayer.location,
          dimension: targetPlayer.dimension.id
        })
        system.run(() => targetPlayer.removeTag(`bedrocktpa:isTp`))
        db.store("backData", backData)
      }, config.delay_teleportation*20)
    } else {
      soundReply(player, config.Teleport_Message.replace("%time%", config.delay_teleportation), "note.pling")
      system.run(() => player.addTag(`bedrocktpa:isTp`))
      system.runTimeout(() => {
        if(!player.hasTag("bedrocktpa:isTp")) return
        player.tryTeleport(targetPlayer.location, targetPlayer.dimension)
        system.run(() => player.removeTag(`bedrocktpa:isTp`))
        soundReply(player, config.Teleported_Message, "mob.endermen.portal")
        soundReply(targetPlayer, config.Teleported_Message, "mob.endermen.portal")
  
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
    soundReply(player, config.Invalid_Player, "note.bassattack")
  }
  
  teleportData = teleportData.filter(d => d.receiver !== player.name && d.requester !== targetPlayer.name)
  db.store("teleportRequest", teleportData)
  targetPlayer.sendMessage(`${chatPrefix} ${config.Teleport_Message_Back_To_Sender.replace("%player%", player.name)}`) // no more sound here since there is already
  return {
    status: 0
  }
})
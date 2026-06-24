import { world, system } from "@minecraft/server";
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
  if(player.getGameMode() === "Spectator")
    return soundReply(player, config.Different_Gamemode, "note.bassattack");

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
  if(!teleportData.some(d => d.receiver === player.name))
    return soundReply(player, config.No_Teleport_Requests, "note.bassattack");
  
  const targetPlayer = world.getPlayers().find(p => p.name === teleportData?.find(d => d.receiver === player.name)?.requester)
  soundReply(player, config.Teleport_Message_Back_To_Player, "note.banjo")
  
  if(targetPlayer) {
    if(teleportData.find(d => d.receiver === player.name)?.type === "tpa") {
      soundReply(targetPlayer, config.Teleport_Message.replace("%time%", config.delay_teleportation), "note.pling")
      targetPlayer.setDynamicProperty("teleporting", true);
      system.runTimeout(() => {
        if(targetPlayer.getDynamicProperty("teleporting")) {
          targetPlayer.setDynamicProperty("backLocation", JSON.stringify({
            location: targetPlayer.location,
            dimension: targetPlayer.dimension.id
          }))
          
          targetPlayer.tryTeleport(player.location, player.dimension)
          targetPlayer.setDynamicProperty("teleporting", false)
          soundReply(player, config.Teleported_Message, "mob.endermen.portal")
          soundReply(targetPlayer, config.Teleported_Message, "mob.endermen.portal")
        }
      }, config.delay_teleportation*20)
    } else {
      soundReply(player, config.Teleport_Message.replace("%time%", config.delay_teleportation), "note.pling");
      player.setDynamicProperty("teleporting", true);
      system.runTimeout(() => {
        if(player.getDynamicProperty("teleporting")) {
          player.setDynamicProperty("backLocation", JSON.stringify({
            location: player.location,
            dimension: player.dimension.id
          }))

          player.tryTeleport(targetPlayer.location, targetPlayer.dimension)
          player.setDynamicProperty("teleporting", false)
          soundReply(player, config.Teleported_Message, "mob.endermen.portal")
          soundReply(targetPlayer, config.Teleported_Message, "mob.endermen.portal")
        }
      }, config.delay_teleportation*20)
    }
  } else {
    soundReply(player, config.Invalid_Player, "note.bassattack")
  }
  
  teleportData = teleportData.filter(d => d.receiver !== player.name && d.requester !== targetPlayer.name)
  targetPlayer.sendMessage(`${chatPrefix} ${config.Teleport_Message_Back_To_Sender.replace("%player%", player.name)}`) // no more sound here since there is already
  db.store("teleportRequest", teleportData)
})
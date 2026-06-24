import { world, system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import { config } from "../../config.js"
import { soundReply } from "../../utilities/SoundReply.js";
const chatPrefix = config.prefix

const commandInformation = {
  name: "tpatoggle",
  description: "Disables/Enables the teleportation to you or to a specific player.",
  usage:[
    {
      name: "player",
      type: "String",
      optional: true
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
  
  if(target) {
    // Administrative Function
    if(player.playerPermissionLevel !== 2) return soundReply(player, config.No_Permission_Message, "note.bassattack")
    const targetPlayer = world.getPlayers().find(p => p.name === target)
    if(!targetPlayer) return soundReply(player, config.Player_Is_Null, "note.bassattack")
    
    if(targetPlayer.getDynamicProperty("teleportationDisable")) {
      // Enable TPA to a specified player
      targetPlayer.setDynamicProperty("teleportationDisable", false)
      soundReply(targetPlayer, config.TpaToggle_Activated_Player_2.replace("%player%", player.name), "note.pling")
      soundReply(player, config.TpaToggle_Activated_Player.replace("%player%", targetPlayer.name), "note.banjo")
    } else {
      // Disable TPA to a specified player
      targetPlayer.setDynamicProperty("teleportationDisable", true)
      soundReply(targetPlayer, config.TpaToggle_Deactivated_Player_2.replace("%player%", player.name), "note.pling")
      soundReply(player, config.TpaToggle_Deactivated_Player.replace("%player%", targetPlayer.name), "note.banjo")
    }
  } else {
    // Non-Administrative Function
    if(player.getDynamicProperty("teleportationDisable")) {
      // Enable TPA to a specified player
      player.setDynamicProperty("teleportationDisable", false)
      soundReply(player, config.TpaToggle_Activated, "note.pling")
    } else {
      // Disable TPA to a specified player
      player.setDynamicProperty("teleportationDisable", true)
      soundReply(player, config.TpaToggle_Deactivated, "note.pling")
    }
  }

})
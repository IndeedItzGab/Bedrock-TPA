import { world, system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import config from "../../config.js"
import messages from "../../messages.js";

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
  if(player.getGameMode() === "Spectator" && (config.overridePackSetting ? !config.allowSpectator : !world.getPackSettings()["bedrocktpa:allowSpectator"]))
    return player.sendSound(messages.spectatorMode, "note.bassattack");

  // Cooldown
  const cooldown = cooldowns.get(player.id)
  if(cooldown?.tick >= system.currentTick) {
    player?.sendSound( `${messages.commandCooldown.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
    return;
  } else {
    cooldowns.set(player.id, {tick: system.currentTick + (config.overridePackSetting ? config.commands.cooldown : world.getPackSettings()["bedrocktpa:commandsCooldown"])*20})
  }
  
  if(target) {
    // Administrative Function
    if(player.playerPermissionLevel !== 2) return player?.sendSound(messages.noPermission, "note.bassattack")
    const targetPlayer = world.getPlayers().find(p => p.name === target)
    if(!targetPlayer) return player?.sendSound(messages.playerIsOffline, "note.bassattack")
    
    if(targetPlayer.getDynamicProperty("teleportationDisable")) {
      // Enable TPA to a specified player
      targetPlayer.setDynamicProperty("teleportationDisable", false)
      targetPlayer.sendSound(messages.tpatoggle.operator.targetActivated.replace("%player%", player.name), "note.pling")
      player?.sendSound(messages.tpatoggle.operator.activated.replace("%player%", targetPlayer.name), "note.banjo")
    } else {
      // Disable TPA to a specified player
      targetPlayer.setDynamicProperty("teleportationDisable", true)
      targetPlayer.sendSound(messages.tpatoggle.operator.targetDeactivated.replace("%player%", player.name), "note.pling")
      player?.sendSound(messages.tpatoggle.operator.deactivated.replace("%player%", targetPlayer.name), "note.banjo")
    }
  } else {
    // Non-Administrative Function
    if(player.getDynamicProperty("teleportationDisable")) {
      // Enable TPA to a specified player
      player.setDynamicProperty("teleportationDisable", false)
      player?.sendSound(messages.tpatoggle.activated, "note.pling")
    } else {
      // Disable TPA to a specified player
      player.setDynamicProperty("teleportationDisable", true)
      player?.sendSound(messages.tpatoggle.deactivated, "note.pling")
    }
  }

})
import { world, system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import config from "../../config.js"
import messages from "../../messages.js";
import Database from "../../utilities/DatabaseHandler.js"

const commandInformation = {
  name: "tpaccept",
  description: "Accepts the request.",
  aliases: [],
  usage:[]
}

let cooldowns = new Map()
registerCommand(commandInformation, (origin) => {
  
  const player = origin.sourceEntity
  if(player.getGameMode() === "Spectator" && (config.overridePackSetting ? !config.allowSpectator : !world.getPackSettings()["bedrocktpa:allowSpectator"]))
    return player.sendSound(messages.spectatorMode, "note.bassattack");

  // Cooldown
  const cooldown = cooldowns.get(player.id)
  if(cooldown?.tick >= system.currentTick) {
    player.sendSound(`${messages.commandCooldown.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
    return;
  } else {
    cooldowns.set(player.id, {tick: system.currentTick + (config.overridePackSetting ? config.commands.cooldown : world.getPackSettings()["bedrocktpa:commandsCooldown"])*20})
  }
  // Main Function
  let teleportData = Database.fetch("teleportRequest", true)
  let backData = Database.fetch("backData", true);
  if(!teleportData.some(d => d.receiver === player.name))
    return player.sendSound(messages.tpaccept.none, "note.bassattack");
  
  const targetPlayer = world.getPlayers().find(p => p.name === teleportData?.find(d => d.receiver === player.name)?.requester)
  player.sendSound(messages.tpaccept.message, "note.banjo")
  
  if(targetPlayer) {
    if(teleportData.find(d => d.receiver === player.name)?.type === "tpa") {
      targetPlayer?.sendSound(messages.tpa.start.replace("%time%", (config.overridePackSetting ? config.teleportationDelay : world.getPackSettings()["bedrocktpa:teleportationDelay"])), "note.pling")
      targetPlayer.setDynamicProperty("teleporting", true);
      system.runTimeout(() => {
        if(targetPlayer.getDynamicProperty("teleporting")) {
          if(config.overridePackSetting ? config.back.saveTeleportation : world.getPackSettings()["bedrocktpa:saveTeleportation"]) {
            targetPlayer.setDynamicProperty("backLocation", JSON.stringify({
              location: targetPlayer.location,
              dimension: targetPlayer.dimension.id
            }))
          }

          targetPlayer.tryTeleport(player.location, player.dimension)
          targetPlayer.setDynamicProperty("teleporting", false)
          targetPlayer.setDynamicProperty("invincibility", Date.now() + (5*1000))
          player.sendSound(messages.teleportedSuccess, "mob.endermen.portal")
          targetPlayer?.sendSound(messages.teleportedSuccess, "mob.endermen.portal")
        }
      }, (config.overridePackSetting ? config.teleportationDelay : world.getPackSettings()["bedrocktpa:teleportationDelay"])*20)
    } else {
      player.sendSound(messages.tpa.start.replace("%time%", (config.overridePackSetting ? config.teleportationDelay : world.getPackSettings()["bedrocktpa:teleportationDelay"])), "note.pling");
      player.setDynamicProperty("teleporting", true);
      system.runTimeout(() => {
        if(player.getDynamicProperty("teleporting")) {
          if(config.overridePackSetting ? config.back.saveTeleportation : world.getPackSettings()["bedrocktpa:saveTeleportation"]) {
            player.setDynamicProperty("backLocation", JSON.stringify({
              location: player.location,
              dimension: player.dimension.id
            }))
          }

          
          player.tryTeleport(targetPlayer.location, targetPlayer.dimension)
          player.setDynamicProperty("invincibility", Date.now() + (5*1000))
          player.setDynamicProperty("teleporting", false)
          player.sendSound(messages.teleportedSuccess, "mob.endermen.portal")
          targetPlayer?.sendSound(messages.teleportedSuccess, "mob.endermen.portal")
        }
      }, (config.overridePackSetting ? config.teleportationDelay : world.getPackSettings()["bedrocktpa:teleportationDelay"])*20)
    }
  } else {
    player.sendSound(config.Invalid_Player, "note.bassattack")
  }
  
  teleportData = teleportData.filter(d => d.receiver !== player.name && d.requester !== targetPlayer.name)
  targetPlayer.sendSound(messages.tpaccept.target.accepted.replace("%player%", player.name))
  Database.store("teleportRequest", teleportData)
})
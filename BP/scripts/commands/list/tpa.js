import { world, system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import config from "../../config.js"
import Database from "../../utilities/DatabaseHandler.js"
import messages from "../../messages.js";

const commandInformation = {
  name: "tpa",
  description: "Sends a teleportation request.",
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
  if(player.getGameMode() === "Spectator" && (config.overridePackSetting ? !config.allowSpectator : !world.getPackSettings()["bedrocktpa:allowSpectator"]))
    return player.sendSound(messages.spectatorMode, "note.bassattack")

  // Cooldown
  const cooldown = cooldowns.get(player.id)
  if(cooldown?.tick >= system.currentTick) {
    player.sendSound(`${messages.commandCooldown.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
    return;
  } else {
    cooldowns.set(player.id, {tick: system.currentTick + (config.overridePackSetting ? config.commands.cooldown : world.getPackSettings()["bedrocktpa:commandsCooldown"])*20})
  }
  
  // Main Function
  const targetPlayer = world.getPlayers().find(p => p.name === target)
  if(!targetPlayer)
    return player.sendSound(messages.playerIsOffline, "note.bassattack");
  if(player.name === targetPlayer.name)
    return player.sendSound(messages.noSelf, "note.bassattack");
  if(targetPlayer.getDynamicProperty("teleportationDisable"))
    return player.sendSound(messages.tpa.disabled, "note.bassattack");
  if(JSON.parse(targetPlayer.getDynamicProperty("ignorePlayers") || "[]").some(d => d === player.name))
    return player.sendSound(messages.tpa.ignored, "note.bassattack");

  let teleportData = Database.fetch("teleportRequest", true)

  if(targetPlayer.dimension.id !== player.dimension.id && (config.overridePackSetting ? !config.interdimensionalTravel : !world.getPackSettings()["bedrocktpa:interdimensionalTravel"]))
    return player.sendSound(messages.tpa.interdimensional, "note.bassattack")
  if(teleportData.some(d => d.requester === player.name && d.type === "tpa"))
    return player.sendSound(messages.tpa.already, "note.bassattack");
  if(player.getDynamicProperty("hurted") >= Date.now())
    return player.sendSound(messages.events.combat.message, "note.bassattack");

  // if TargetPlayer have TPA auto accept enabled
  if(targetPlayer.getDynamicProperty("autoAccept")) {
    player.sendSound(messages.tpa.auto.replace("%time%", (config.overridePackSetting ? config.teleportationDelay : world.getPackSettings()["bedrocktpa:teleportationDelay"])), "note.pling")
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
        player.sendSound(messages.teleportedSuccess, "mob.endermen.portal");
        targetPlayer?.sendSound(messages.tpa.target.auto.replace("%player%", player.name), "mob.endermen.portal");
        player.setDynamicProperty("invincibility", Date.now() + (5*1000))
        player.setDynamicProperty("teleporting", false);
      }
    }, (config.overridePackSetting ? config.teleportationDelay : world.getPackSettings()["bedrocktpa:teleportationDelay"])*20)
    return;
  } else {
    targetPlayer.sendSound(messages.tpa.target.message.replace("%player%", player.name), "note.banjo")
    targetPlayer.sendSound(messages.tpa.target.accept)
    targetPlayer.sendSound(messages.tpa.target.deny)
    player.sendSound(messages.tpa.request.replace("%player%", targetPlayer.name))
  }
  
  teleportData.push({
    requester: player.name,
    receiver: targetPlayer.name,
    type: "tpa"
  })
  
  Database.store("teleportRequest", teleportData)

  // Timeout
  system.runTimeout(() => {
    teleportData = Database.fetch("teleportRequest", true)
    if(!teleportData.find(d => d.receiver === targetPlayer.name && d.requester === player.name)) return;
    teleportData = teleportData.filter(d => !(d.receiver === targetPlayer.name && d.requester === player.name))
    player.sendSound(messages.tpa.timeout, "note.bassattack")
    Database.store("teleportRequest", teleportData)
  }, (config.overridePackSetting ? config.teleportationTimeout : world.getPackSettings()["bedrocktpa:teleportationTimeout"])*20)
})
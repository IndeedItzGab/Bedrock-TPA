import { world, system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import config from "../../config.js"
import Database from "../../utilities/DatabaseHandler.js"
import messages from "../../messages.js";

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
  const targetPlayer = world.getPlayers().find(p => p.name === target)
  if(!targetPlayer)
    return player.sendSound(messages.playerIsOffline, "note.bassattack");
  if(player.name === targetPlayer.name)
    return player.sendSound(messages.noSelf, "note.bassattack");
  if(targetPlayer.getDynamicProperty("teleportationDisable"))
    return player.sendSound(messages.tpa.disabled, "note.bassattack");
  if(JSON.parse(targetPlayer.getDynamicProperty("ignorePlayers") || "[]").some(d => d === player.name))
    return player.sendSound(messages.tpa.ignored, "note.bassattack");
  if(player.getDynamicProperty("hurted") >= Date.now())
    return player.sendSound(messages.events.combat.message, "note.bassattack");
  if(targetPlayer.dimension.id !== player.dimension.id && (config.overridePackSetting ? !config.interdimensionalTravel : !world.getPackSettings()["bedrocktpa:interdimensionalTravel"]))
    return player.sendSound(messages.tpa.interdimensional, "note.bassattack")

  let teleportData = Database.fetch("teleportRequest", true)
  if(teleportData.some(d => d.requester === player.name && d.type === "tpahere"))
    return player.sendSound(messages.tpahere.already, "note.bassattack");

  targetPlayer?.sendSound(messages.tpahere.target.message.replace("%player%", player.name))
  targetPlayer?.sendSound(messages.tpa.target.accept)
  targetPlayer?.sendSound(messages.tpa.target.deny, "note.banjo")
  player.sendSound(messages.tpahere.request.replace("%player%", targetPlayer.name), "note.banjo")
  
  teleportData.push({
    requester: player.name,
    receiver: targetPlayer.name,
    type: "tpahere"
  })
  
  Database.store("teleportRequest", teleportData)
  
  // Timeout
  system.runTimeout(() => {
    teleportData = Database.fetch("teleportRequest", true)
    if(!teleportData.find(d => d.receiver === targetPlayer.name && d.requester === player.name && d.type === "tpahere")) return;
    teleportData = teleportData.filter(d => !(d.receiver === targetPlayer.name && d.requester === player.name && d.type === "tpahere"))
    player.sendSound(messages.tpahere.timeout, "note.bassattack")
    Database.store("teleportRequest", teleportData)
  }, (config.overridePackSetting ? config.teleportationTimeout : world.getPackSettings()["bedrocktpa:teleportationTimeout"])*20)
})
import { world, system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import config from "../../config.js"
import Database from "../../utilities/DatabaseHandler.js"
import messages from "../../messages.js";

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
  if(player.getGameMode() === "Spectator" && (config.overridePackSetting ? !config.allowSpectator : !world.getPackSettings()["bedrocktpa:allowSpectator"]))
    return player.sendSound(messages.spectatorMode, "note.bassattack");

  // Cooldown
  const cooldown = cooldowns.get(player.id)
  if(cooldown?.tick >= system.currentTick) {
    player?.sendSound(`${messages.commandCooldown.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
    return;
  } else {
    cooldowns.set(player.id, {tick: system.currentTick + (config.overridePackSetting ? config.commands.cooldown : world.getPackSettings()["bedrocktpa:commandsCooldown"])*20})
  }

  // Main Function
  let teleportData = Database.fetch("teleportRequest", true)
  for(const targetPlayer of world.getPlayers()) {
    if(
      player.name === targetPlayer.name
      || teleportData.some(d => d.receiver === targetPlayer.name && d.type === "tpahere")
      || targetPlayer.getDynamicProperty("teleportationDisable")
      || JSON.parse(targetPlayer.getDynamicProperty("ignorePlayers") || "[]").some(d => d === player.name)
      || (targetPlayer.dimension.id !== player.dimension.id && (config.overridePackSetting ? !config.interdimensionalTravel : !world.getPackSettings()["bedrocktpa:interdimensionalTravel"]))
    ) continue;

    targetPlayer?.sendSound(messages.tpahere.target.message.replace("%player%", player.name))
    targetPlayer?.sendSound(messages.tpa.target.accept)
    targetPlayer.sendSound(messages.tpa.target.deny, "note.banjo")

    teleportData.push({
      requester: player.name,
      receiver: targetPlayer.name,
      type: "tpahere"
    })
    
    Database.store("teleportRequest", teleportData)
    
    // Delay the teleportation with the given configuration.
    system.runTimeout(() => {
      teleportData = Database.fetch("teleportRequest", true)
      if(!teleportData.find(d => d.receiver === targetPlayer.name && d.requester === player.name && d.type === "tpahere")) return;
      teleportData = teleportData.filter(d => !(d.receiver === targetPlayer.name && d.requester === player.name && d.type === "tpahere"))
      player?.sendSound(messages.tpahere.timeout, "note.bassattack")
      Database.store("teleportRequest", teleportData)
    }, (config.overridePackSetting ? config.teleportationTimeout : world.getPackSettings()["bedrocktpa:teleportationTimeout"])*20)
  }
  player?.sendSound(messages.tpahere.all, "note.banjp")
})
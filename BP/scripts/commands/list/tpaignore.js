import { world, system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import config from "../../config.js"
import messages from "../../messages.js";

const commandInformation = {
  name: "tpaignore",
  description: "Ignores a player from teleport requests",
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
    return  player?.sendSound(messages.spectatorMode, "note.bassattack");

  // Cooldown
  const cooldown = cooldowns.get(player.id)
  if(cooldown?.tick >= system.currentTick) {
    player?.sendSound( `${messages.commandCooldown.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
    return;
  } else {
    cooldowns.set(player.id, {tick: system.currentTick + (config.overridePackSetting ? config.commands.cooldown : world.getPackSettings()["bedrocktpa:commandsCooldown"])*20})
  }

  const targetPlayer = world.getPlayers().find(p => p.name === target)
  if(!targetPlayer)
    return player?.sendSound(messages.playerIsOffline, "note.bassattack")

  // Main Function
  const ignorePlayers = JSON.parse(player.getDynamicProperty("ignorePlayers") || "[]")
  if(player.name === targetPlayer.name)
    return player?.sendSound(messages.tpaignore.noSelf, "note.bassattack")
  
  if(!ignorePlayers?.some(d => d === targetPlayer.name)) {
    ignorePlayers.push(targetPlayer.name)
    player.setDynamicProperty("ignorePlayers", JSON.stringify(ignorePlayers))
    player?.sendSound(messages.tpaignore.success, "note.pling")
  } else {
    player.setDynamicProperty("ignorePlayers", JSON.stringify(ignorePlayers.filter(d => d !== targetPlayer.name)))
    player?.sendSound(messages.tpaignore.already, "note.bassattack")
  }
})
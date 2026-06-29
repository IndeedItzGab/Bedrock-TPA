import { world, system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import config from "../../config.js"
import Database from "../../utilities/DatabaseHandler.js"
import messages from "../../messages.js";

const commandInformation = {
  name: "tpcancel",
  description: "Cancels a teleportation request to a specific player.",
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
    return player?.sendSound(messages.spectatorMode, "note.bassattack");

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
    return player?.sendSound(messages.playerIsOffline, "note.bassattack");
  if(player.name === targetPlayer.name)
    return player?.sendSound(messages.tpcancel.noSelf, "note.bassattack");

  
  let teleportData = Database.fetch("teleportRequest", true)
  if(!teleportData.some(d => d.requester === player.name && d.receiver === targetPlayer.name))
    return player?.sendSound(messages.tpaccept.none, "note.bassattack");
  
  // Main Function
  player?.sendSound(messages.tpcancel.message, "note.fling")
  teleportData = teleportData.filter(d => d.requester !== player.name && d.receiver !== targetPlayer.name)
  Database.store("teleportRequest", teleportData)
})
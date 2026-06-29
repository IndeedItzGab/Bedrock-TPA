import { world, system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import config from "../../config.js"
import Database from "../../utilities/DatabaseHandler.js"
import messages from "../../messages.js";

const commandInformation = {
  name: "tpdeny",
  description: "Denies the teleportation request.",
  aliases: [],
  usage:[]
}


let cooldowns = new Map()
registerCommand(commandInformation, (origin) => {
  
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

  let teleportData = Database.fetch("teleportRequest", true)
  if(!teleportData.some(d => d.receiver === player.name))
    return player?.sendSound(messages.tpaccept.none, "note.bassattack")

  // Main Function
  const targetPlayer = world.getPlayers().find(p => p.name === teleportData.find(d => d.receiver === player.name).requester)
  player?.sendSound(messages.tpdeny.message, "note.fling")
  targetPlayer.sendSound(messages.tpdeny.target.rejected, "note.bassattack")
  teleportData = teleportData.filter(d => d.receiver !== player.name && d.requester !== targetPlayer.name)
  Database.store("teleportRequest", teleportData)
})
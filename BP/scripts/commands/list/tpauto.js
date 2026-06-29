import { system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import config from "../../config.js"
import Database from "../../utilities/DatabaseHandler.js"
import messages from "../../messages.js";

const commandInformation = {
  name: "tpauto",
  description: "Auto accepts /tpa requests from other people",
  aliases: [],
  usage:[]
}

let cooldowns = new Map()
registerCommand(commandInformation, (origin, targetPlayer) => {
  
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
  

  const autoAccept = player.getDynamicProperty("autoAccept")
  player.setDynamicProperty("autoAccept", !autoAccept)
  player?.sendSound( !autoAccept ? messages.tpauto.enabled : messages.tpauto.disabled, "note.pling")
})
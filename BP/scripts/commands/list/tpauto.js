import { system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/DatabaseHandler.js"
import { soundReply } from "../../utilities/SoundReply.js";
const chatPrefix = config.prefix

const commandInformation = {
  name: "tpauto",
  description: "Auto accepts /tpa requests from other people",
  aliases: [],
  usage:[]
}

let cooldowns = new Map()
registerCommand(commandInformation, (origin, targetPlayer) => {
  
  const player = origin.sourceEntity
  if(player.getGameMode() === "Spectator")
    return soundReply(player, config.Different_Gamemode, "note.bassattack");

  // Cooldown
  const cooldown = cooldowns.get(player.id)
  if(cooldown?.tick >= system.currentTick) {
    soundReply(player, `${config.Cooldown_Message.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
    return;
  } else {
    cooldowns.set(player.id, {tick: system.currentTick + config.commands.cooldown*20})
  }
  
  // Main Function
  const autoAccept = player.getDynamicProperty("autoAccept")
  player.setDynamicProperty("autoAccept", !autoAccept)
  soundReply(player, !autoAccept ? config.Enabled_TpAuto : config.Disabled_TpAuto, "note.pling")
})
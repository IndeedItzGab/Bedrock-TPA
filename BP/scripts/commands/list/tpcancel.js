import { world, system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/DatabaseHandler.js"
import { soundReply } from "../../utilities/SoundReply.js";
const chatPrefix = config.prefix

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

  const targetPlayer = world.getPlayers().find(p => p.name === target)
  if(!targetPlayer)
    return soundReply(player, config.Player_Is_Null, "note.bassattack");
  if(player.name === targetPlayer.name)
    return soundReply(player, config.Error_Cancelling_Request, "note.bassattack");

  
  let teleportData = db.fetch("teleportRequest", true)
  if(!teleportData.some(d => d.requester === player.name && d.receiver === targetPlayer.name))
    return soundReply(player, config.No_Teleport_Requests, "note.bassattack");
  
  // Main Function
  soundReply(player, config.Request_Cancelled, "note.fling")
  teleportData = teleportData.filter(d => d.requester !== player.name && d.receiver !== targetPlayer.name)
  db.store("teleportRequest", teleportData)
})
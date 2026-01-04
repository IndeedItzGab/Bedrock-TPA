import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/DatabaseHandler.js"
import { soundReply } from "../../utilities/SoundReply.js";
const chatPrefix = config.prefix

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
  if(player.getGameMode() === "Spectator") return player.sendMessage(`${chatPrefix} ${config.Different_Gamemode}`)

  // Cooldown
  const cooldown = cooldowns.get(player.id)
  if(cooldown?.tick >= system.currentTick) {
    soundReply(player, `${config.Cooldown_Message.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
    return;
  } else {
    cooldowns.set(player.id, {tick: system.currentTick + config.commands.cooldown*20})
  }

  const targetPlayer = world.getPlayers().find(p => p.name === target)
  if(!targetPlayer) return soundReply(player, config.Player_Is_Null, "note.bassattack")

  // Main Function
  let ignoreData = db.fetch("tpaIgnoreRequest", true)
  if(player.name === targetPlayer.name) return soundReply(player, config.Player_Is_Player_tpignore, "note.bassattack")
  
  if(!ignoreData.some(d => d?.blocker === player.name && d?.blockedUser === targetPlayer.name)) {
    ignoreData.push({
      blocker: player.name,
      blockedUser: targetPlayer.name
    })
    soundReply(player, config.Player_Is_Ignored, "note.pling")
  } else {
    ignoreData = ignoreData.filter(d => d.blocker !== player.name && d.blockedUser !== targetPlayer.name)
    soundReply(player, config.Player_Is_Already_Ignored, "note.bassattack")
  }
  db.store("tpaIgnoreRequest", ignoreData)
  
  return {
    status: 0
  }
})
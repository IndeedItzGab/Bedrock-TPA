import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/DatabaseHandler.js"
const chatPrefix = config.prefix

const commandInformation = {
  name: "tpauto",
  description: "Auto accepts /tpa requests from other people",
  aliases: [],
  usage:[]
}

let cooldowns = []
registerCommand(commandInformation, (origin, targetPlayer) => {
  
  const player = origin.sourceEntity
  if(player.getGameMode() === "Spectator") return player.sendMessage(`${chatPrefix} ${config.Different_Gamemode}`)

  // Cooldown
  const cooldown = cooldowns.find(d => d.name === player.name)
  if(cooldown?.tick >= system.currentTick) {
    player.sendMessage(`${chatPrefix} ${config.Cooldown_Message.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`)
    return;
  } else {
    cooldowns = cooldowns.filter(d => d.name !== player.name)
    cooldowns.push({
      name: player.name,
      tick: system.currentTick + config.tpa_cooldown*20
    })
  }

  const isAuto = player.hasTag("tpaAuto")
  
  // Main Function
  system.run(() => {
    !isAuto ? player.addTag("tpaAuto") : player.removeTag("tpaAuto")
  })
  
  let message = !isAuto ? config.Enabled_TpAuto : config.Disabled_TpAuto
  player.sendMessage(`${chatPrefix} ${message}`)


  return {
    status: 0
  }
})
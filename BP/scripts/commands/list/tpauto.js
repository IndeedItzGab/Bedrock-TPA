import {
  world,
  system
} from "@minecraft/server";
import { registerCommand }  from "../commandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/database.js"
const chatPrefix = config.prefix

const commandInformation = {
  name: "tpauto",
  description: "Auto accepts /tpa requests from other people",
  aliases: [],
  usage:[]
}

registerCommand(commandInformation, (origin, targetPlayer) => {
  
  const player = origin.sourceEntity
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
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
  name: "back",
  description: "Teleports you or a player to its last positiion.",
  aliases: [],
  usage:[
    {
      name: "player",
      type: "String",
      optional: true
    }
  ]
}

let cooldowns = new Map()
registerCommand(commandInformation, (origin, targetPlayerName) => {
  
  let player = origin.sourceEntity
  let backData = db.fetch("backData", true)
  if(player.getGameMode() === "Spectator") return player.sendMessage(`${chatPrefix} ${config.Different_Gamemode}`)

  // Cooldown
  const cooldown = cooldowns.get(player.id)
  if(cooldown?.tick >= system.currentTick) {
    soundReply(player, `${config.Cooldown_Message.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
    return;
  } else {
    cooldowns.set(player.id, {tick: system.currentTick + config.commands.cooldown*20})
  }
  
  if(targetPlayerName) {
    // Administrative Function
    if(player.playerPermissionLevel < 2) return player.sendMessage(`${chatPrefix} ${config.No_Permission_Message}`)
    const targetPlayer = world.getPlayers().find(p => p.name === targetPlayerName)
    const toggleData = db.fetch("toggleData", true)

    if(!targetPlayer) return soundReply(player, config.Player_Is_Null, "note.bassattack")
    if(toggleData.some(d => d.name === targetPlayerName)) return soundReply(player, config.TpaToggled_Player_Message, "note.bassattack")
    if(!backData.some(d => d.name === targetPlayerName)) return soundReply(player, config.Player_Doesnt_Have_Back_Point, "note.bassattack")
    
    let playerBackData = backData.find( d => d.name === targetPlayer.name)
    const dimension = world.getDimension(playerBackData.dimension)
    
    system.run(() => targetPlayer.tryTeleport(playerBackData.location, {dimension}))
    
    backData = backData.filter(d => d.name !== targetPlayer.name)
    backData.push({
      name: targetPlayer.name,
      location: targetPlayer.location,
      dimension: targetPlayer.dimension.id
    })
    
    soundReply(targetPlayer, config.Teleported_Message, "mob.endermen.portal")
    player.sendMessage(`${chatPrefix} ${config.Teleported_Message}`)
  } else {
    // Non-Administrative Function
    if(!backData.some(d => d.name === player.name)) return soundReply(player, config.Player_Doesnt_Have_Back_Point_1, "note.bassattack")
    let playerBackData = backData.find( d => d.name === player.name)
    if(player.hasTag("bedrocktpa:hurted")) return soundReply(player, config.Damaged_Cancel_Message, "note.bassattack")
    system.run(() => player.addTag(`bedrocktpa:isTp`))
    

    system.runTimeout(() => {
      if(!player.hasTag("bedrocktpa:isTp")) return
      const dimension = world.getDimension(playerBackData.dimension)
      player.tryTeleport(playerBackData.location, {dimension})
      soundReply(player, config.Teleported_Message, "mob.endermen.portal")
      backData = backData.filter(d => d.name !== player.name)
      backData.push({
        name: player.name,
        location: player.location,
        dimension: player.dimension.id
      })
      system.run(() => player.removeTag("bedrocktpa:isTp"))
    }, config.delay_teleportation*20)
    soundReply(player, config.Teleport_Message.replace("%time%", config.delay_teleportation), "note.pling")
  }
  db.store("backData", backData)
  return {
    status: 0
  }
})
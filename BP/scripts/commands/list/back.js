import {  world,  system } from "@minecraft/server";
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
  
  if(targetPlayerName) {
    // Administrative Function
    if(player.playerPermissionLevel < 2)
      return soundReply(player, config.No_Permission_Message, "note.bassattack")
    
    const targetPlayer = world.getPlayers().find(p => p.name === targetPlayerName)
    if(!targetPlayer)
      return soundReply(player, config.Player_Is_Null, "note.bassattack");
    if(targetPlayer.getDynamicProperty("teleportationDisable"))
      return soundReply(player, config.TpaToggled_Player_Message, "note.bassattack");
    if(!targetPlayer.getDynamicProperty("backLocation"))
      return soundReply(player, config.Player_Doesnt_Have_Back_Point, "note.bassattack");

    const backLocation = JSON.parse(targetPlayer.getDynamicProperty("backLocation") || "{}")
    const dimension = world.getDimension(backLocation.dimension)
    
    system.run(() => targetPlayer.tryTeleport(backLocation.location, {dimension}))
  
    targetPlayer.setDynamicProperty("backLocation", {location: targetPlayer.location, dimension: targetPlayer.dimension.id})
    soundReply(targetPlayer, config.Teleported_Message, "mob.endermen.portal")
    player.sendMessage(`${chatPrefix} ${config.Teleported_Message}`)
  } else {
    // Non-Administrative Function
    const backLocation = JSON.parse(player.getDynamicProperty("backLocation") || "{}")
    if(!backLocation)
      return soundReply(player, config.Player_Doesnt_Have_Back_Point_1, "note.bassattack");
    if(player.getDynamicProperty("hurted") >= Date.now())
      return soundReply(player, config.Damaged_Cancel_Message, "note.bassattack");
    
    player.setDynamicProperty("teleporting", true)
    soundReply(player, config.Teleport_Message.replace("%time%", config.delay_teleportation), "note.pling")
    system.runTimeout(() => {
      if(player.getDynamicProperty("teleporting")) {
        const dimension = world.getDimension(backLocation.dimension)
        player.tryTeleport(backLocation.location, {dimension})
        player.setDynamicProperty("backLocation", JSON.stringify({
          location: player.location,
          dimension: player.dimension.id
        }))
        player.setDynamicProperty("teleporting", false)
        soundReply(player, config.Teleported_Message, "mob.endermen.portal")
      }
    }, config.delay_teleportation*20)
  }
})
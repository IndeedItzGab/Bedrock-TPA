import { world, system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import { config } from "../../config.js"
import * as db from "../../utilities/DatabaseHandler.js"
import { soundReply } from "../../utilities/SoundReply.js";
const chatPrefix = config.prefix

const commandInformation = {
  name: "tpa",
  description: "Sends a teleportation request.",
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
    return soundReply(player, config.Different_Gamemode, "note.bassattack")

  // Cooldown
  const cooldown = cooldowns.get(player.id)
  if(cooldown?.tick >= system.currentTick) {
    soundReply(player, `${config.Cooldown_Message.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
    return;
  } else {
    cooldowns.set(player.id, {tick: system.currentTick + config.commands.cooldown*20})
  }
  
  // Main Function
  const targetPlayer = world.getPlayers().find(p => p.name === target)
  if(!targetPlayer)
    return soundReply(player, config.Player_Is_Null, "note.bassattack");
  if(player.name === targetPlayer.name)
    return soundReply(player, config.Player_Is_Player, "note.bassattack");
  if(targetPlayer.getDynamicProperty("teleportationDisable"))
    return soundReply(player, config.TpaToggled_Player_Message, "note.bassattack");
  if(JSON.parse(targetPlayer.getDynamicProperty("ignorePlayers") || "[]").some(d => d === player.name))
    return soundReply(player, config.Player_Has_Ignored_You, "note.bassattack");

  let teleportData = db.fetch("teleportRequest", true)

  //if(targetPlayer.dimension.id !== player.dimension.id)
  // return player.sendMessage(`${chatPrefix} ${config.Player_Not_Same_World}`)
  if(teleportData.some(d => d.requester === player.name && d.type === "tpa"))
    return soundReply(player, config.Already_A_TP_Request, "note.bassattack");
  if(player.getDynamicProperty("hurted") >= Date.now())
    return soundReply(player, config.Damaged_Cancel_Message, "note.bassattack");

  // if TargetPlayer have TPA auto accept enabled
  if(targetPlayer.getDynamicProperty("autoAccept")) {
    soundReply(player, config.Teleport_Message_TPAUTO.replace("%time%", config.delay_teleportation), "note.pling")
    player.setDynamicProperty("teleporting", true);
    system.runTimeout(() => {
      if(player.getDynamicProperty("teleporting")) {
        player.setDynamicProperty("backLocation", JSON.stringify({
          location: player.location,
          dimension: player.dimension.id
        }))

        player.tryTeleport(targetPlayer.location, targetPlayer.dimension)
        soundReply(player, config.Teleported_Message, "mob.endermen.portal");
        soundReply(targetPlayer, config.Teleported_Message_TpAuto.replace("%player%", player.name), "mob.endermen.portal");
        player.setDynamicProperty("teleporting", false);
      }
    }, config.delay_teleportation*20)
    return;
  } else {
    system.run(() => {
      targetPlayer.sendMessage(`${chatPrefix} ${config.Sent_Request_On_You.replace("%player%", player.name)}`)
      targetPlayer.sendMessage(`${chatPrefix} ${config.Accept_Message}`)
      targetPlayer.sendMessage(`${chatPrefix} ${config.Deny_Message}`)
      targetPlayer.playSound("note.banjo")
      player.sendMessage(`${chatPrefix} ${config.Sending_Teleport_Request.replace("%player%", targetPlayer.name)}`)
    })
  }
  
  teleportData.push({
    requester: player.name,
    receiver: targetPlayer.name,
    type: "tpa"
  })
  
  db.store("teleportRequest", teleportData)

  // Timeout
  system.runTimeout(() => {
    teleportData = db.fetch("teleportRequest", true)
    if(!teleportData.find(d => d.receiver === targetPlayer.name && d.requester === player.name)) return;
    teleportData = teleportData.filter(d => !(d.receiver === targetPlayer.name && d.requester === player.name))
    soundReply(player, config.Timed_Out_Message, "note.bassattack")
    db.store("teleportRequest", teleportData)
  }, config.keep_alive*20)
})
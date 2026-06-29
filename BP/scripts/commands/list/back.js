import { world,  system } from "@minecraft/server";
import { registerCommand }  from "../CommandRegistry.js"
import config from "../../config.js"
import Database from "../../utilities/DatabaseHandler.js"
import messages from "../../messages.js";

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

if(config.overridePackSetting ? config.back.enable : world.getPackSettings()["bedrocktpa:enableBackCommand"]) {
  const cooldowns = new Map()
  registerCommand(commandInformation, (origin, targetPlayerName) => {
    
    let player = origin.sourceEntity
    if(player.getGameMode() === "Spectator" && (config.overridePackSetting ? !config.allowSpectator : !world.getPackSettings()["bedrocktpa:allowSpectator"]))
      return player.sendSound(messages.spectatorMode, "note.bassattack");

    // Cooldown
    const cooldown = cooldowns.get(player.id)
    if(cooldown?.tick >= system.currentTick) {
      player.sendSound(`${messages.commandCooldown.replace("%time%", (cooldown.tick - system.currentTick) / 20)}`, "note.bassattack")
      return;
    } else {
      cooldowns.set(player.id, {tick: system.currentTick + (config.overridePackSetting ? config.commands.cooldown : world.getPackSettings()["bedrocktpa:commandsCooldown"])*20})
    }
    
    if(targetPlayerName) {
      // Administrative Function
      if(player.playerPermissionLevel < 2)
        return player.sendSound(messages.noPermission, "note.bassattack")
      
      const targetPlayer = world.getPlayers().find(p => p.name === targetPlayerName)
      if(!targetPlayer)
        return player.sendSound(messages.playerIsOffline, "note.bassattack");
      if(targetPlayer.getDynamicProperty("teleportationDisable"))
        return player.sendSound(messages.tpa.disabled, "note.bassattack");
      if(!targetPlayer.getDynamicProperty("backLocation"))
        return player.sendSound(messages.back.operator.none, "note.bassattack");

      const backLocation = JSON.parse(targetPlayer.getDynamicProperty("backLocation") || "{}")
      const dimension = world.getDimension(backLocation.dimension)
      
      system.run(() => targetPlayer.tryTeleport(backLocation.location, {dimension}))
    
      targetPlayer.setDynamicProperty("backLocation", {location: targetPlayer.location, dimension: targetPlayer.dimension.id})
      targetPlayer?.sendSound(messages.teleportedSuccess, "mob.endermen.portal")
      player.sendSound(messages.teleportedSuccess)
    } else {
      // Non-Administrative Function
      const backLocation = JSON.parse(player.getDynamicProperty("backLocation") || "{}")
      if(!backLocation)
        return player.sendSound(messages.back.none, "note.bassattack");
      if(player.getDynamicProperty("hurted") >= Date.now())
        return player.sendSound(messages.events.combat.message, "note.bassattack");
      
      player.setDynamicProperty("teleporting", true)
      player.sendSound(messages.tpa.start.replace("%time%", (config.overridePackSetting ? config.teleportationDelay : world.getPackSettings()["bedrocktpa:teleportationDelay"])), "note.pling")
      system.runTimeout(() => {
        if(player.getDynamicProperty("teleporting")) {
          const dimension = world.getDimension(backLocation.dimension)
          player.tryTeleport(backLocation.location, {dimension})
          if(config.overridePackSetting ? config.back.saveTeleportation : world.getPackSettings()["bedrocktpa:saveTeleportation"]) {
            player.setDynamicProperty("backLocation", JSON.stringify({
              location: player.location,
              dimension: player.dimension.id
            }))
          }
          player.setDynamicProperty("invincibility", Date.now() + (5*1000))
          player.setDynamicProperty("teleporting", false)
          player.sendSound(messages.teleportedSuccess, "mob.endermen.portal")
        }
      }, (config.overridePackSetting ? config.teleportationDelay : world.getPackSettings()["bedrocktpa:teleportationDelay"])*20)
    }
  })
}

import { Player, system, world, CustomCommandStatus } from "@minecraft/server"
import config from "../../../config"
import messages from "../../../messages";

 /**
 * Send a message with a specified sound
 * 
 * @param {string} message The message to send.
 * @param {string} [sound] Optional sound identifier to play
 * @return {boolean} true if the it sent successfully, false otherwise
 */

Player.prototype.sendSound = function (message = "", sound = undefined) {
  if(message === null) return true;

  const prefix = !(config.overridePackSetting ? messages.prefix : world.getPackSettings()["bedrocktpa:mesagePrefix"])
    ? ""
    : `${messages.prefix} `
  try {
    if(sound && (config.overridePackSetting ? config.soundEffects : world.getPackSettings()["bedrocktpa:soundEffects"])) {
      system.run(() => {
        this?.playSound(sound)
      })
    }
    this?.sendMessage(`${prefix}${message}`)
    return true
  } catch (err) {
    console.error(err)
    return false;
  }
}
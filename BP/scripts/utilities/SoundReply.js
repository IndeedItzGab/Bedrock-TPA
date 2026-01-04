import { system } from "@minecraft/server"
import { config } from "../config.js"

const chatPrefix = config.prefix
export function soundReply(player, string, sound) {
  system.run(() => {
    player.sendMessage(`${config.prefix} ${string}`)
    player.playSound(sound)
  })
}
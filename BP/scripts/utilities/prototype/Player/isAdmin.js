import { Player } from "@minecraft/server"

Player.prototype.isAdmin = function () {
  return this.getTags().some(tag => tag.toLowerCase() === "admin")
};
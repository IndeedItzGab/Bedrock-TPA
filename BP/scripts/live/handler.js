import { system } from "@minecraft/server"
import "./list/combatChecker.js"

system.runInterval(() => {
  combatChecker()
}, 1*1000)
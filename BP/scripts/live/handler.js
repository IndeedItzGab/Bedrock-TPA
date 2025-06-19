import { system } from "@minecraft/server"
import "./list/combatChecker.js"
import "./list/moveDetector.js"

system.runInterval(() => {
  combatChecker()
  moveDetector()
}, 1*1000)
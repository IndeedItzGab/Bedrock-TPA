import { system } from "@minecraft/server"
import * as PlayerMovedValidation from "./list/PlayerMovedValidation.js"

system.runInterval(() => {
  PlayerMovedValidation.process();
}, 1*20)
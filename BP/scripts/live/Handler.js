import { system, world } from "@minecraft/server"
import config from "../config.js";
import * as PlayerMovedValidation from "./list/PlayerMovedValidation.js"

if(config.overridePackSetting ? config.detectMovement : world.getPackSettings()["bedrocktpa:detectMovement"]) {
  system.runInterval(() => {
    PlayerMovedValidation.process();
  }, 1*20)
}


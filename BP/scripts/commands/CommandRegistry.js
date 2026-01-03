import {
  system
} from "@minecraft/server";
import { config } from "../config.js"

let commands = []
export function registerCommand(comInfo, callback) {
    // Parameters Handler
    let optionalParameters = [], mandatoryParameters = []
    comInfo?.usage.forEach(parameter => {
      if(parameter.optional) {
        optionalParameters.push({
          name: parameter.name,
          type: parameter.type
        })
      } else {
        mandatoryParameters.push({
          name: parameter.name,
          type: parameter.type
        })
      }
    })
  
    // Aliases Handler
    comInfo?.aliases?.forEach(alias => {
      commands.push({
        commandInformation: {
          name: `${config.commands.namespace}:${alias}`,
          description: comInfo?.description,
          permissionLevel: comInfo?.permissionLevel || 0,
          cheatsRequired: false,
          optionalParameters: optionalParameters,
          mandatoryParameters: mandatoryParameters
        },
        callback: callback
      })
    })
    
    // Main Command Handler
    commands.push({
      commandInformation: {
        name: `${config.commands.namespace}:${comInfo?.name}`,
        description: comInfo?.description,
        permissionLevel: comInfo?.permissionLevel || 0,
        cheatsRequired: false,
        optionalParameters: optionalParameters,
        mandatoryParameters: mandatoryParameters
      },
      callback: callback
    })
}



system.beforeEvents.startup.subscribe((init) => {
  for(const command of commands) {
    init.customCommandRegistry.registerCommand(command.commandInformation, command.callback)
  }
})



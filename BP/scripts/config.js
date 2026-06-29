
// ! NOTE: Some of the configuration are not yet implemented. They are either commented or has a "NOT IMPLEMENTED" beside them.
// ! NOTE: Changing these configurations may requrie you to reload the script with /reload or much better is restarting the server.

export default {
  // ! NOTE: If you are going to configure the pack through this file, then you must set overridePackSetting to "true".
  // ! Otherwise, the script will ignore these changes you made from this file.
  // ! On the other hand, if you were going to configure this pack through "Pack Setting" or the gear icon you see in-game right-bottom of the pack. Then, you must set overridePackSetting to false to apply changes from that setting.
  overridePackSetting: false,

  commands: {
    namespace: "bt",
    cooldown: 10 // Command cooldown
  },

  randomTeleportationRadius: 4000, // The radius of the random teleportation about how far the player will go.
  teleportationDelay: 5, // Teleportation delay before proceeding on teleporting.
  teleportationTimeout: 60, // The teleprotation timeout of each requests.
  allowSpectator: false, // Allow spectators to use commands from this addon.
  invincibility: true, // Protect the player from getting any damaged after teleporting
  interdimensionalTravel: true, // Used to allow players to teleport to a player from another dimension.
  soundEffects: true, // Used to apply sound effects for each events in the addon.
  disabledWorlds: [""], // NOT IMPLEMENTED
  detectMovement: true, // Used to cancel teleportation process if the player is moving.
  detectCombat: true, // Used to cancel teleportation process if the player was in combat within 15 seconds.
  back: { // Back features: This feature allow players to save their recent location after death or teleportation
    enable: true, // Enable the "/back" command
    saveDeath: true, // Save the death location to with "/back" command
    saveTeleportation: true // Save the previous location after using rtpa, tpa, or tpahere.
  }
}

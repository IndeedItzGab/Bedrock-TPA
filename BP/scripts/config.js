export const config = {
  commands: {
    namespace: "bt",
    cooldown: 10 // All commands cooldown
  },
  
  
// !!!!!!!!!!!!!!!!
// This options will support all plugins that use teleport stuff
// If you want the plugin to log the previus teleport locations for the /back command from other plugins _> set this to true
enable_teleport_logging: false, // Not Implemented
// !!!!!!!!!!!!!!!!

// If you set it to true, you will disable the prefix
// Make sure to restart the server in order to apply it
disable_prefix: false, // Not Implemented
prefix: "§c[§6BedrockTPA§c]§r",

// Messages:
// Death_Message: "§6To teleport to your death location use §c/back",

// TO DISABLE A MESSAGE _ SET IT TO _ NONE
// EXAMPLE:
// Console_Isnt_Player: "none"
//Console_Isnt_Player: "§6Console can't use §cBedrockTpa§6!",
//Disabled_World_Message: "§6You can't use §cBedrockTpa §6in this World!",
Teleport_Message: "§6You will be teleported in §c%time% §6seconds!",
Teleport_Message_TPAUTO: "§6You will be teleported in §c%time% §6seconds! Don't move!",
Teleport_Message_Back_To_Player: "§6You §caccepted §6the teleport request!",
Player_Is_Null: "§6The player is not §conline§6!",
Player_Doesnt_Have_Back_Point: "§6The player doesn't have any back locations!",
Player_Doesnt_Have_Back_Point_1: "§6You don't have any back locations!",
Cooldown_Message: "§6You can't use that command for %time% seconds yet!",
Death_Message: "§6To teleport to your death location use §c/back",
Teleport_Message_Back_To_Sender_TPHEREALL: "§6Sending a teleport here request to §ceveryone§6!",
No_Permission_Message: "§6You don't have permission for this command!",
TpaToggle_Deactivated_Player_2: "§c%player% §6disabled the teleportation to you!",
TpaToggle_Activated_Player_2: "§c%player% §6enabled the teleportation to you!",
TpaToggle_Deactivated_Player: "§6You §cdisabled§6 the teleportation for §c%player%§6.",
TpaToggle_Activated_Player: "§6You §cenabled§6 the teleportation for §c%player%§6.",
TpaToggle_Deactivated: "§6You §cdisabled§6 the teleportation to you.",
TpaToggle_Activated: "§6You §cenabled§6 the teleportation to you.",
TpaToggled_Player_Message: "§6The player has §cdisabled §6the teleportation to him!",
Player_Is_Player: "§6You can't teleport to §cyourself§6!",
Player_Is_Player_tpignore: "§6You can't ignore §cyourself§6!",
Player_Is_Ignored: "§6The player has been §cignored§6!",
Player_Is_Already_Ignored: "§6The player was §cunblocked§6! If you want to block him, use the command again!",
Already_A_TP_Request: "§6You already have §csent §6a teleport request! If you want to cancel it §c/tpcancel player ",
Tpa_Usage_Message: "§6Please use: §c/tpa (player)",
TpaIgnore_Usage_Message: "§6Please use: §c/tpaignore (player)",
Timed_Out_Message: "§6Your §cteleport request§6 has timed out!",
Sending_Teleport_Request: "§6Sending a teleport request to §c%player%§6. If you want to cancel it §c/tpcancel player ",
Accept_Message: "§6To accept the teleport request, type §c/tpaccept",
Deny_Message: "§6To deny the teleport request, type §c/tpdeny",
Sent_Request_On_You: "§c%player% §6has sent you a teleport request!",
Timed_Out_Here_Message: "§6Your teleport here request has §ctimed out!",
Sending_Teleport_Here_Request: "§6Sending a teleport here request to §c%player%§6. If you want to cancel it §c/tpcancel player",
Sent_Here_Request_On_You: "§c%player% §6has sent you a teleport here request!",
Already_A_TPHere_Request: "§6You already have §csent §6a teleport here request! If you want to cancel it §c/tpcancel player",
Tpa_Here_Usage_Message: "§6Please use: §c/tpahere (player)",
No_Teleport_Requests: "§6You don't have any teleport requests!",
Invalid_Player: "§6It seems the player who was teleporting to you has left the server!",
Teleport_Message_Back_To_Sender: "§c%player% §6has accepted your teleportation request.",
Teleported_Message: "§6Teleported!",
// for Teleported_Message_TpAuto  %player% placeholder for player name
Teleported_Message_TpAuto: "§c%player% §6has teleported to you! You have the /tpauto features turned on!",
Move_Cancel_Message: "§6You have moved and the teleport request has been removed!",
Rejected_Sender: "§6The player has rejected your §crequest§6!",
Rejected_Message: "§6You have rejected the §crequest§6!",
Player_Is_In_Disabled_World: "§6The player you wanted to teleport to is in §cdisabled world§6!",
Tpcancel_Usage_Message: "§6Please use: §c/tpcancel (player)",
Error_Cancelling_Request: "§6You can't cancel your own §crequest!",
Request_Cancelled: "§6You successfully cancelled the §cteleportation request§6!",
Death_Message_Coords: "§6Your death location is: §c%coords%§6!",
Time_Left: "§6You have §c%seconds% §6seconds to accept or deny the request",
Damaged_Cancel_Message: "§6You were damaged and the teleport request has been removed!",
Different_Gamemode: "§6You can't use any teleportation commands, because you are in §cSPECTATOR §6mode!",
//World_Doesnt_Exists_Or_Unloaded: "§6The world you're trying to teleport to is either unloaded or doesn't exist!",
Enabled_TpAuto: "§6From now on you will §cautomatically accept §6all /tpa requests!",
Disabled_TpAuto: "§6From now on you §cwon't automatically accept §6all /tpa requests!",
Player_Has_Ignored_You: "§6The player has §cignored §6your teleportation requests!",
//Player_Not_Same_World: "§6The player you have been trying to §cteleport §6is not in the same §cworld§6!",


// If you want to disable simpletpa for some worlds, then you can add them by adding _ 'NameOfTheWorld'
//Disabled Worlds:
// disabled_worlds: [ 'disabledworld' ], // CHOICES: overworld, nether, end --- NOTIMLPEMENTED

// If you set anything to true, you will disable it.
// B A C K    S E T T I N G S

// If you want to disable the back command, then set this to true
// disable_back_command: false,

// If you want to disable the death coords message, then set this to true
// disable_coords_message: false,

// If you want to disable saving the death location, then set this to true
// disable_back_on_death: false,

// If you want to disable saving the TP Locations such as TPA, TPAHERE, then set this to true
// disable_back_on_tp: false,

//Booleans
//  If you want to disable checking for gamemode if equals to spectator, then set this to true
// disable_gamemode_check: false, // Not Implemented
//  If you want to disable saving the accept or deny buttons, then set this to true
// disable_accept_deny_buttons: false, //Not Implemented
//  If you want to disable saving the particles, then set this to true
// disable_particles: false, // Not Implemented
//  If you want to disable saving the move system, then set this to true
// disable_move_system: false, // Not Implemented
// If you want to disable sounds from the plugin, then set this to true
// disable_sound: false, // Not Implemented

// If you want to disable interdimensional travel(only allowed to use the plugin in the same world with other player), then set this to true
// disable_interdimensional_travel: false, // Not Implemeted
// If you want to disable the invincibility after teleporting, then set this to true
// disable_invincibility: false, // Not Implemented
// If you want to disable logging /back locations from quitting the server, then set this to true
// disable_back_on_quit: false, // Not Implemented

// Everything works with SECONDS
//This will keep the teleport request alive for X seconds
keep_alive: 60,
//This will delay the teleportation for X seconds
delay_back_command: 5,
delay_teleportation: 5,
}
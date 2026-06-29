

export default {
  // HOW TO DISABLE A MESSAGE
  // Set a certain message of your choice to 'null' without quotes.
  // Example:
  //   prefix: null  <-- This will disable the message
  //   noPermission: null <-- Another example that will disable the messages

  prefix: "§c[§6BedrockTPA§c]§r",
  invalidUsage: "§6Invalid Usage: %usage%", // NOT YET IMPLEMENTED
  mustBePlayer: "§6Console can't use §cBedrockTpa§6!", // NOT IMPLEMENTED,
  noPermission: "§6You don't have permission for this command!",
  commandCooldown: "§6You can't use that command for %time% seconds yet!",
  playerIsOffline: "§6The player is not §conline§6!",
  noSelf: "§6You can't teleport to §cyourself§6!",
  teleportedSuccess: "§6Teleported!",
  spectatorMode: "§6You can't use any teleportation commands, because you are in §cSPECTATOR §6mode!",
  tpa: {
    auto: "§6You will be teleported in §c%time% §6seconds! Don't move!",
    timeout: "§6Your §cteleport request§6 has timed out!",
    interdimensional: "§6The player you have been trying to §cteleport §6is not in the same §cworld§6!",
    ignored: "§6The player has §cignored §6your teleportation requests!",
    disableDimension: "§6The player you wanted to teleport to is in §cdisabled world§6!", // NOT IMPLEMENTED
    request: "§6Sending a teleport request to §c%player%§6. If you want to cancel it §c/tpcancel player ",
    disabled: "§6The player has §cdisabled §6the teleportation to him!",
    start: "§6You will be teleported in §c%time% §6seconds!",
    already: "§6You already have §csent §6a teleport request! If you want to cancel it §c/tpcancel player",
    target: {
      timeLeft: "§6You have §c%seconds% §6seconds to accept or deny the request", // NOT IMPLEMENTD
      auto: "§c%player% §6has teleported to you! You have the /tpauto features turned on!",
      message: "§c%player% §6has sent you a teleport request!",
      accept: "§6To accept the teleport request, type §c/tpaccept",
      deny: "§6To deny the teleport request, type §c/tpdeny"
    }
  },
  tpahere: {
    timeout: "§6Your teleport here request has §ctimed out!",
    all: "§6Sending a teleport here request to §ceveryone§6!",
    request: "§6Sending a teleport here request to §c%player%§6. If you want to cancel it §c/tpcancel player",
    already: "§6You already have §csent §6a teleport here request! If you want to cancel it §c/tpcancel player",
    target: {
      message: "§c%player% §6has sent you a teleport here request!"
    }
  },
  rtpa: {
    start: "§6You will be teleported to a random location in §c%time% §6seconds!",
  },
  back: {
    none: "§6You don't have any back locations!",
    operator: {
      none: "§6The player doesn't have any back locations!"
    }
  },
  tpatoggle: {
    deactivated: "§6You §cdisabled§6 the teleportation to you.",
    activated: "§6You §cenabled§6 the teleportation to you.",
    operator: {
      targetDeactivated: "§c%player% §6disabled the teleportation to you!",
      targetActivated: "§c%player% §6enabled the teleportation to you!",
      deactivated: "§6You §cdisabled§6 the teleportation for §c%player%§6.",
      activated: "§6You §cenabled§6 the teleportation for §c%player%§6."
    }
  },
  tpaignore: {
    success: "§6The player has been §cignored§6!",
    already: "§6The player was §cunblocked§6! If you want to block him, use the command again!",
    noSelf: "§6You can't ignore §cyourself§6!",
  },
  tpaccept: {
    message: "§6You §caccepted §6the teleport request!",
    targetLeft: "§6It seems the player who was teleporting to you has left the server!", // NOT IMPLEMENTED
    none: "§6You don't have any teleport requests!",
    target: {
      accepted: "§c%player% §6has accepted your teleportation request."
    }
  },
  tpdeny: {
    message: "§6You have rejected the §crequest§6!",
    target: {
      rejected: "§6The player has rejected your §crequest§6!"
    }
  },
  tpcancel: {
    noSelf: "§6You can't cancel your own §crequest!",
    message: "§6You successfully cancelled the §cteleportation request§6!"
  },
  tpauto: {
    enabled: "§6From now on you will §cautomatically accept §6all /tpa requests!",
    disabled: "§6From now on you §cwon't automatically accept §6all /tpa requests!"
  },

  events: {
    moved: {
      message: "§6You have moved and the teleport request has been removed!"
    },
    death: {
      message: "§6To teleport to your death location use §c/back",
      coords: "§6Your death location is: §c%coords%§6!" // NOT IMPLEMENTED
    },
    combat: {
      message: "§6You were in combat and the teleport request has been removed!",
    }
  },

  usage: {
    tpa: "§c/tpa (player)",
    tpahere: "§c/tpahere (player)",
    tpaignore: "§c/tpaignore (player)",
    tpcancel: "§c/tpcancel (player)"
  }
}
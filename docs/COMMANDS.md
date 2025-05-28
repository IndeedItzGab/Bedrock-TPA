# Available Commands
Default commands namespace: `bt`

## Non-Operator Commands 
These commands are meant to be use by anyone with or without the permission level of a operator.
|NAME         |PARAMETERS          |DESCRIPTION                                                              |
|-------------|--------------------|-------------------------------------------------------------------------|
|tpa          |\<player\>          |Sends a teleportation request.                                           |
|tpahere      |\<player\>          |Sends a teleportation request to teleport the player to you.             |
|tpaccept     |                    |Accepts the request.                                                     |
|tpdeny       |                    |Denies the teleportation request.                                        |
|tpauto       |                    |Auto accepts /tpa requests from other people                             |
|tpcancel     |\<player\>          |Cancels a teleportation request to a specific player.                    |
|back         |                    |Teleports you to your last location.                                     |
|tpaignore    |\<player\>          |Ignores a player from teleport requests.                                 |
|tpatoggle    |                    |Disables/Enables the teleportation to you.                               |

## Operator Commands 
These commands are meant to be use by operators and cannot be accessible by non-operators.
NAME          |PARAMETERS          |DESCRIPTION                                                              |
|-------------|--------------------|-------------------------------------------------------------------------|
|tpatoggle    |\<player\>          |Disables/Enables the teleportation to a specific player.                 |
|back         |\<player\>          |Returns a player to its last position.                                   |
|tpahereall   |                    |Sends a teleportation request to teleport everyone to you.               |

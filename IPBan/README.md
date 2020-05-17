# What is this?
This is the IP Banning script. It essentially works by creating a constant log of players IPs as well as controls
the command for banning players.

# Requirements
This script relies on another, simpler, script. permissionHandler.js. Its used for making sure only someone
has operator perms. It also relies on an index

# Usage
In order to use this script, you must be an op and be on the server. Due to limitations, I can't read console
so you have to be in game.

For IP banning, the player you are banning DOES NOT need to be online. Banning will work whether or not said
person is online.

# Downsides
One downside to this script is that it is not possible to ban new IPs the user joins on after they are on
the blacklist. They won't be able to get on as they are still server banned but if they make a new account
they will be able to join again.

# Known bugs
None! Go ahead and send me a message if you find one!
    Social medias:
        Twitter: @SacriPudding
        Discord: @SacriPudding#1281
        Telegram: @SacriPudding
        Reddit: u/evan13lee
        GitHub: Take a guess
# Plans
    VPN detection VIA GeoIP
    
    Console based command. (Need to find some way to talk to console. Currently in development.)
    
    Losing the need for `index.js` opting for a drag-and-drop system.
# Credits
A lot of this came from my friend Luke. This was my first "real" plugin and also one of my first JS scripts
in general. Follow him over at https://twitter.com/ConsoleLogLuke. He is into mostly iPhone jailbreaking.

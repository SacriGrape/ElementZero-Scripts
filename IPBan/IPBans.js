// Exports this function so its accessible in index.js. If you want to use this standalone (I don't advise it.)
// Import here instead.
export function runScriptIpBans(system, onPlayerJoined, onChat, sendBroadcast, executeCommand,getPlayerByNAME, runScriptPermissionHandler, addByNAME, addByXUID, open, getOfflinePlayerByNAME) {
    //Sets the command used for banning. You only need to change it here for the command to change.
    // Note: Using A slash does not work
    const banCommands = '.banip';
    //Creates a link to the IPList database file.
        //by default you should have a blank table named "blacklistip" with a column called IP
        //You should also have a blank table named "iplist" with 3 colums
            //columns in this order:
            //1.) xuid
            //2.) IP
            //3.) gamertag
            //note: case sensitive.
    const database = open('IPLists.db');
    //Triggers upon a player joining
    onPlayerJoined(player => {
        //This flag is used latter down the line for making sure something doesn't trigger under a certain condition.
        let flag = false;
        //This Variable is used for preparing the blacklist database. This will get all the banned IPs
        const bannedIps = database.prepare('SELECT * FROM ipblacklist;');
        //for every column in the banned IP table. Triggers once.
        bannedIps.forEach(columns => {
            //Checks to see if the joining players IP can be found in the list. If so, they should be banned.
            if (columns.includes(player.address.split('|')[0])) {
                //Adds the player who joined to the blacklist
                addByXUID(player.xuid, 'You are joining from a banned IP. If you believe this to be a mistake, contact the admins.', 'Automated Message');
                //for some dumb stupid dumb reason, banning someone doesn't kick them so you need to do it yourself.
                executeCommand(`force-kick ${player.name}`);
            }
        });
        //sets the ip variable for easy use.
        const ip = player.address.split('|')[0]
        //sets the xuid variable for easy use
        const xuid = player.xuid;
        //sets the ipListXuid SQL command. This will result in the xuid of the player who joined. Kind of pointless tbh
        const ipListXuid = database.prepare(`SELECT xuid FROM iplist WHERE xuid = '${xuid}';`);
        //sets the ipListXuid SQL command. This will result in the ip list of the player who joined. Far more important
        const ipListIp = database.prepare(`SELECT IP FROM iplist WHERE xuid = '${xuid}';`);
        //Triggers the ipListXuid thing. This part is not that redundant as it prevents checking people who were not
        //on the list though this could be shortened to 1 line if I cared enough.
        ipListXuid.forEach(_ => {
            //sets that flag to true. This will mean the code at the bottom is skipped.
            flag = true;
            //This is the actual one that gets us the IP list.
            ipListIp.forEach(columnsI => {
                //This will return if the players IP is not new.
                if (columnsI.includes(ip)) return;
                //This records all of the players IPs in an array.
                const ipArray = columnsI.split(', ');
                //This adds the new IP to the array
                ipArray.push(ip);
                //this joins that array back into a string
                const newList = ipArray.join(', ');
                //this causes the new string to be pushed to the database.
                database.exec(`UPDATE iplist SET IP = '${newList}' WHERE xuid = '${xuid}';`);
                //Just to be safe and check for GT changes, this updates the "gamertag" column in the iplist table.
                //Prevents the .banip command from breaking
                database.exec(`UPDATE iplist SET gamertag = '${player.name}' WHERE xuid = '${xuid}';`);
            });
        });
        //This is checking if the flag that had been set before is true or false
        //if true, it will stop the event.
        //if false, it will run the command that creates a new row.
        //It does this so that a new row is only created when the person is actually joining the server for the first time.
        if (flag) return;
        //the part that does the adding of the row
        database.exec(`INSERT INTO iplist VALUES ('${xuid}', '${ip}', '${player.name}');`);
    });
    //Triggers when any chat message is sent
    onChat(chatObj => {
        //sets the message sent into a variable for easy reading
        const message = chatObj.content;
        //Splits the variable by spaces and tests for length. If its less then 2 spaces its not correct syntax and
        //the event ends. Could add a message that tells you the mistake but not going to just yet.
        if (message.split(' ').length < 2) return;
        //splits the message by spaces and tells you what the first part of the message was. In this example we
        //are testing for ".banip"
        const whatCommand = message.split(' ')[0];
        //this is the message converted to an array. Used for getting the last section of the array.
        //Helps in cases of a space in their name.
        const split = message.split(' ')
        //Removes the .banip from the start of the array. This will leave you with just the gamertag
        split.shift();
        //stores that gamertag.
        const gamertag = split.join(' ');
        //tests to make sure the starts of the message is in-fact the ban command. Could be optimised to
        //happen earlier but not that big of a deal just yet.
        if (whatCommand.includes(banCommands)) {
            // prepares the database for getting a list of all the gamertags that have joined the server
            const gtCheck = database.prepare('SELECT gamertag FROM iplist');
            //For every gamertag it finds it will run this area of code
            gtCheck.forEach( column => {
                //Checks to see if the gamertag we have is not the one we check in the database.
                if (!column.includes(gamertag)) {
                    //if its not the one we have, say that its Incorrect data.
                    sendBroadcast('system','Incorrect data.');
                    //Exit out of this forEach instance and go onto the next
                    return;
                }
                //Gets us the player object. We use Offline here so we don't have to have the person online to ban.
                const player = getOfflinePlayerByNAME(gamertag);
                //Gets us the permission of the player running the command. This is the part that relies on the
                //outside script
                //NOTE: If you have a default permission that is not inside of the permissions.json file this
                //will fail even if you are technically an OP.
                const permission = runScriptPermissionHandler(player.xuid, executeCommand);
                //Checks to see if the permission is not operator. This is the part that denies non ops
                //access to the command
                if (!permission.includes('operator')) {
                    //Sends a message to chat telling asking the player if they have permission to use it.
                    sendBroadcast('system','Are you sure you have permission to use that?');
                    //Exit out of this instance of the forEach.
                    return;
                }
                //Gets the player's IP list out of the database. This lets us ban all IPs the player has joined on as
                //opposed to just the last or the current.
                const playerIpGet= database.prepare(`SELECT IP FROM iplist WHERE xuid = '${player.xuid}'`);
                //Runs a for each on the IP string. Runs once.
                playerIpGet.forEach ( column => {
                    //Defines the playerIps array
                    const playerIps = column.split('. ');
                    //for each IP the player had it adds it to the blacklist database.
                    //Due to this plugin banning new accounts that join on old banned IPs, this will
                    //help people from joining on different accounts by adding them individually.
                    playerIps.forEach( ip => {
                        //The part that adds the current IP.
                        database.exec(`INSERT INTO ipblacklist values('${ip}');`);
                    });
                });
                //bans the player based on their name. This is to make the command easier to use.
                addByNAME(player.name, 'You have been banned', chatObj.sender);
                //Kicks the player as the dumb stupid dumb ban function doesn't.
                executeCommand(`force-kick ${gamertag}`);
            });
        }
    });
}

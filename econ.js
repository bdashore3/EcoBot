const Discord = require('discord.js');
const ids = require('./JSON/id.json');
const auth = require('./JSON/auth.json');
const balance = require(`./helpers/balance.js`)
const fs = require('fs')
const jsonPath = "./JSON/";

const selfID = ids.self;
const quantumID = ids.quantum;
const briID = ids.bri;
const retracksID = ids.retracks;
const bebeID = ids.bebe;
const prefix = '^';
const client = new Discord.Client();
const alphaNum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function isAdmin(userID) {
	return (isDev(userID));
}

function isDev(userID) {
	return (userID == quantumID || userID == briID);
}

client.on('message', async message => {

	// Don't respond to messages authored by the bot itself
	if (message.author.id == selfID)
		return;

	// On-demand restriction for accidental issues
	// May be used as spam-protection
	if (!isAdmin(message.author.id) && isBreak) {
		return;
	}

	// Bots aren't allowed to execute commands (by default)
	// Only admins should be able to modify bot allowance
	if (message.author.bot && !settings.get("iba"))
		return;

    /*
	 * 1) Strip the ^ prefix from the message
	 * 2) Clean extra whitespaces
	 * 3) Break words at whitespaces
	 * 4) Take the first word
	 * 5) Convert to lowercase and assign as command
	 */
	words = message.content
			.substr(1, message.content.length)
			.replace(/\s+/g, " ")
			.split(' ');
    
    command = words[0].toLowerCase();

    switch (command) {
        case "addmoney":
            if (isAdmin(message.author.id)) {
                var bal_to_add = words[1]
                balance.add(message.author.id, bal_to_add)
                message.reply(` added ` + bal_to_add + ` to the account`)
            }
            else {
                message.channel.send(`Sorry, only bot admins can do this`)
			}
		
		case "showbal":
			balanceList = JSON.parse(fs.readFileSync(jsonPath + 'balance.json')); 
				message.reply(`you have ` + balanceList.balance + `.`)
		
			
    }
});

client.login(auth.token);
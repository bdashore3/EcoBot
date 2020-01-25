const Discord = require('discord.js');
const ids = require('./JSON/id.json');
const auth = require('./JSON/auth.json');
const balance = require('./helpers/balance.js');
const jobs = require('./helpers/jobs.js');
const fs = require('fs')
const jsonPath = "./JSON/";

const selfID = ids.self;
const quantumID = ids.quantum;
const briID = ids.bri;
const prefix = '^';
const client = new Discord.Client();
const alphaNum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var isBreak = false;
var production = true;

const currency = "RegalCoins";

/* 
 * Add your ID in the return statement using an OR operator
 * e.g: return(isDev(userID) || userID == *your ID variable in id.json*)
 */
function isAdmin(userID) {
	return (isDev(userID));
}

// Do NOT edit this.
function isDev(userID) {
	return (userID == quantumID || userID == briID);
}

/* 
 * Backup all JSON files if they exist.
 * If they do not, create a JSON directory and copy all files from the samples directory to there
 */
client.once('ready', () => {
	balance.backup();
	balance.updateAccountList();
	console.log('Logged in and ready to work!')
});

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

	// Only respond to the prefix with something after the message
	if (!message.content.startsWith(prefix) && message.content.length > 1) {
		return;
	}

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

		/*
		 * Directly adds money to the user's account
		 * For bot admins only
		 * Meant for debugging purposes ONLY!
		 * Don't be a scumbag and give yourself infinite money.
		 */
		case "addmoney":
			if (production) { 
				message.channel.send("This is a production build! You can't use this command!")
				break;
			}
			if (!isAdmin(message.author.id)) { 
				message.channel.send(`Sorry, only bot admins can do this`)
				break;
			}
			var addBalance = Number(words[1])
			balance.updateMoney(message, addBalance)
			message.channel.send(` added ` + addBalance + " " + currency + ` to the account`)
			break;
		
		/*
		 * Shows the user's balance
		 * Check balance.js for more information about the internals.
		 */
		case "showbal": 
		case "bal": 
			if (balance.getCurBalance(message) === undefined) { break; }
			message.reply(`you have ` + balance.getCurBalance(message) + " " + currency + `.`);
			break;

		/*
		 * Gives the user a daily sum of money
		 * Check balance.js for more information about the internals.
		 */
		case "daily":
			balance.dailyTimeCheck(message, currency)
			if (typeof out === 'undefined') { break; }
			message.reply(out);
			break;
		
		/*
		 * Removes money from the user's account
		 * For bot admins only
		 * Meant for debugging purposes only!
		 * Why would you remove money from your own account?
		 */
		case "delete":
			if (production) { 
				message.channel.send("This is a production build! You can't use this command!")
				break;
			}
			if (!isAdmin(message.author.id)) { 
				message.channel.send(`Sorry, only bot admins can do this`)
				break;
			}
			var amount = Number(words[1])
			balance.rmMoney(message, amount)
			message.reply (` removed ` + amount + " " + currency + ` from your account`)
			break;

		/*
		 * Allows the user to make a new account
		 * User has to make a new account before doing anything else
		 * Check balance.js for more information about the internals.
		 */
		case "newaccount":
			balance.newAccount(message);
			break;
		
		case "forcebackup":
			balance.backup();
			message.channel.send(`All accounts are backed up!`)
			break;

		/*
		case "seteducation":
			if (!isAdmin(message.author.id)) { 
				message.channel.send(`Sorry, only bot admins can do this`)
				break;
			}
			jobs.setEducation(words[1], words[2], words[3]);
			message.channel.send(`Education list written and fetched!`)
			break;

		case "init":
			if (!isAdmin(message.author.id)) { 
				message.channel.send(`Sorry, only bot admins can do this`)
				break;
			}
			jobs.init("jobs");
			break;
		*/
	}	
});

client.login(auth.token);

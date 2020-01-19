const Discord = require('discord.js');
const ids = require('./JSON/id.json');
const auth = require('./JSON/auth.json');
const balance = require(`./helpers/balance.js`)
const fs = require('fs')
const jsonPath = "./JSON/";

const selfID = ids.self;
const quantumID = ids.quantum;
const briID = ids.bri;
const prefix = '^';
const client = new Discord.Client();
const alphaNum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var isBreak = false;

const currency = "RegalCoins";

function isAdmin(userID) {
	return (isDev(userID));
}

function isDev(userID) {
	return (userID == quantumID || userID == briID);
}

/* 
 * Backup all JSON files if they exist.
 * If they do not, create a JSON directory and copy all files from the samples directory to there
 */
client.once('ready', () => {
	balance.backupAll();
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
			if (!isAdmin(message.author.id)) { 
				message.channel.send(`Sorry, only bot admins can do this`)
				break;
			}
			var addBalance = Number(words[1])
			balance.updateMoney(message, addBalance)
			message.channel.send(` added ` + addBalance + " " + currency + ` to the account`)
			break;
		
		case "showbal": 
		case "bal": 
			if (balance.getCurBalance(message) === undefined) { break; }
			message.reply(`you have ` + balance.getCurBalance(message) + " " + currency + `.`);
			break;
		
		case "daily":
			balance.dailyTimeCheck(message, currency)
			message.reply(out);
			break;
		
		case "delete":
			if (!isAdmin(message.author.id)) { 
				message.channel.send(`Sorry, only bot admins can do this`)
				break;
			}
			var amount = Number(words[1])
			balance.rmMoney(message, amount)
			message.reply (` removed ` + amount + currency + " " + ` from your account`)
			break;

		case "newaccount":
			balance.newAccount(message);
			break;
	}
});

client.login(auth.token);
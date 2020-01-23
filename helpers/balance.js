/* This file is responsible for all handling of money
 *
 * NOTE: Only admins should use CRUD options
 * 
 */

const fs = require('fs');

const jsonPath = "./JSON/";
const backupPath = "./backups/"
const now = new Date();

//Object for storing account data
var accounts = {};

/* 
 * Simple function for writing so that I don't have to keep entering the same command
 */
function write() {
	fs.writeFileSync(jsonPath + 'accounts.json', JSON.stringify(accounts, null, 4));
	return "Balance successfully written";
}

module.exports = {
	/*
	 * Backup all JSON files
 	 * Run every time the bot is started
	 * If there are no JSON files, the bot will throw an error!
	 */
	backup: function() {
		this.updateAccountList();
		if (!fs.existsSync(backupPath)) {
			fs.mkdirSync(backupPath);
		}
		fs.copyFileSync(jsonPath + 'accounts.json', backupPath + 'accounts.json.bk')
		console.log('Backed up Accounts!');
	},

	/*
	 * Update the entire account list from balance.json
	 * Updated on bot init, every ensureUser call, and every backup call
	 */
	updateAccountList: function() {
		accounts = JSON.parse(fs.readFileSync(jsonPath + 'accounts.json'));
		return accounts
	},

	/*
	 * Make sure the user is in the balance.json file
	 * If not, ask the user to create a new account
	 * and return a boolean of false.
	 * 
	 * This function also updates the account list
	 * since it is used in almost every other CRUD
	 * function.
	 */
	ensureUser: function (message) {
		this.updateAccountList()
		if (!accounts[message.author.id]) {
			message.reply("Please create a new account by typing `^newaccount`");
			return false;
		}
		return true;
	},

	// Function for getting an individual's balance (^bal command).
	getCurBalance: function (message) {
		if (!this.ensureUser(message)) { return; }
		this.updateAccountList()
		return accounts[message.author.id].balance;
	},

	// Updates the user's balance. Must be used if you don't want the JSON to be overwriten.
	updateMoney: function(message, amount) {
		if (!this.ensureUser(message)) { return; }
		newBalance = Number(this.getCurBalance(message)) + amount
		accounts[message.author.id].balance = newBalance
		write();
		return "Successfully updated balance";
	},

	// Removes money from user's account. Only admins can use this command.
	rmMoney: function(message, amount) {
		if (!this.ensureUser(message)) { return; }
		newBalance = Number(this.getCurBalance(message)) - amount
		accounts[message.author.id].balance = newBalance
		write();
		return "Successfully updated balance";
	},

	/*
	 * Function Flow:
	 * Make sure the user is in balance.json
	 * Get the current time (JS returns a ms number from Jan 1st 1970)
	 * Grab the user's daily time from dailyTime.json
	 * Find the difference between the user's daily time and twenty four hours from then
	 * If the current time - the user's daily time >= the twenty four hour time difference, give 100 currency
	 * Otherwise, tell the user that it hasn't been twenty four hours since the last daily collection and give nothing.
	 */
	dailyTimeCheck: function(message, currency) {
		if (this.ensureUser(message) == false) { 
			return; 
		}
		curTime = now.getTime();
		curDailyTime = Number(accounts[message.author.id].dailyTime);;
		twentyFourTime = 86400000; //24 hours in milliseconds
		
		if ((curTime - curDailyTime) < twentyFourTime) {
			out = "It hasn't been twenty four hours! Come back another time."
		}
		if ((curTime - curDailyTime) >= twentyFourTime) {
			this.updateMoney(message, 100);
			accounts[message.author.id].dailyTime = curTime;
			write();
			out = "Here's your daily amount of 100" + " " + currency + "!"
		}
		return out;
	},

	/* 
	 * Create a new account:
	 * Bot sends a message
	 * Add a reaction to the sent message
	 * Wait for user to react
	 * If user who asked for the new acct reacts
	 *  -> Needs a copy of userID from that message
	 *  -> Run this ID through the reaction filter
	 *
	 * Create a new account with 1000 of said currency and initalizes the first daily time.
	 * The user will not be able to collect a daily bonus until 24 hours from
	 * account creation.
	 */
	newAccount: function(message) {
		this.updateAccountList();
		if (accounts[message.author.id]) {
			message.channel.send("You already have an account.");			
			return;
		}

		userID = message.author.id
		const time = 60000; //amount of time to collect for in milliseconds

		message.channel.send("React to the checkmark below to create a new account.")
		.then(async function (message) {
			 await message.react('✅')
			 const filter = (reaction, user) => {
				return ['✅'].includes(reaction.emoji.name) && user.id === userID;
			 };

			 const collector = message.createReactionCollector(filter, { time: time });

			 collector.on('collect', (reaction, reactionCollector) => {
				dailyTime = now.getTime();
				accounts[userID] = {
					balance: 1000,
					dailyTime: dailyTime
				}
				write();
				message.channel.send("<@" + userID + ">, your new account has been created")
			 });
		});
	}
}
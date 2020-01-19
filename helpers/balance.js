/* This file is responsible for all handling of money
 *
 * NOTE: Only admins should use CRUD options
 * 
 */

const fs = require('fs');

const jsonPath = "./JSON/";
const now = new Date();

var people = {};

var times = {};

/*
 * Custom stringify function made by tanish2k09 to handle arrays
 * Takes values stored in the objects "People" and "Times"
 * and converts them to a string for the json file.
 */
function stringify_balance() {
	out = "{\n\t\"people\" : [";
	isInit = true;
	for (name in people) {
		if (!isInit)
			out += ",";

		out += "\n\t\t{\n\t\t\t\"name\" : \"" + name + "\",";
		out += "\n\t\t\t\"balance\" : \"" + people[name] + "\"\n\t\t}"
		isInit = false;
	}
	out += "\n\t]\n}";
	return out;
}

function stringify_time() {
	out = "{\n\t\"times\" : [";
	isInit = true;
	for (name in times) {
		if (!isInit)
			out += ",";

		out += "\n\t\t{\n\t\t\t\"name\" : \"" + name + "\",";
		out += "\n\t\t\t\"dailyTime\" : \"" + times[name] + "\"\n\t\t}"
		isInit = false;
	}
	out += "\n\t]\n}";
	return out;
}

/* 
 * Function for adding money and time.
 * DO NOT USE balance.addMoney
 * This will overwrite the json files and remove all accounts
 * Please use the update money function to add any more money
 * or bot admins can use the addmoney command.
 */
function addMoneyInternal(userID, newbalance) {
	people[userID] = newbalance;
	backup();
	fs.writeFileSync(jsonPath + 'balance.json', stringify_balance());
	return "Balance successfully written";
}

function addTimeInternal(userID, dailyTime) {
	times[userID] = dailyTime;
	backup();
	fs.writeFileSync(jsonPath + 'dailyTime.json', stringify_time());
	return "Daily Time Written";
}

/*
 * Backup all JSON files
 * Run every time the bot is started
 * If there are no JSON files, the bot will throw an error!
 */

function backup() {
	fs.copyFileSync(jsonPath + 'balance.json', jsonPath + 'balance.json.bk', (err) => {
		if (err) throw err;
		console.log('Backed up Balances!');
	});
	fs.copyFileSync(jsonPath + 'dailyTime.json', jsonPath + 'dailyTime.json.bk', (err) => {
		if (err) throw err;
		console.log('Backed up Daily Times!');
	});
}

module.exports = {
	// Calls backup. See comments at the backup function for more info.
	backupAll: function() {
		backup();
	},

	/*
	 * Update the entire balance list from balance.json
	 * Another function is used to read someone's balance
	 * Same rules apply for daily times.
	 */
	updateBalList: function() {
		balanceList = JSON.parse(fs.readFileSync(jsonPath + 'balance.json'));
		for (var i = 0; i < balanceList.people.length; ++i) {
			curBalance = balanceList.people[i];
			people[curBalance.name] = curBalance.balance;
		}
	},

	updateTimeList: function() {
		dailyTimeList = JSON.parse(fs.readFileSync(jsonPath + 'dailyTime.json'));
		for (var i = 0; i < dailyTimeList.times.length; ++i) {
			curDailyTime = dailyTimeList.times[i];
			times[curDailyTime.name] = curDailyTime.dailyTime;
		}
	},

	/*
	 * Make sure the user is in the balance.json file
	 * If not, ask the user to create a new account
	 * and return a boolean of false.
	 */
	ensureUser: function (message) {
		this.updateBalList()
		if (!people[message.author.id]) {
			message.reply("Please create a new account by typing `^newaccount`");
			return false;
		}
		return true;
	},

	// Function for getting an individual's balance and time.
	getCurBalance: function (message) {
		if (!this.ensureUser(message)) { return; }
		return people[message.author.id];
	},

	getCurDailyTime: function (message) {
		if (!this.ensureUser(message)) { return; }
		return times[message.author.id];
	},

	// Export for addMoneyInternal. Look at addMoneyInternal's comments for more info.
	addMoney: function(userID, newbalance) {
		addMoneyInternal(userID, newbalance);
	},

	// Export for addTimeInternal. Look at addMoneyInternal's comments for more info.
	addTime: function(userID, dailyTime) {
		addTimeInternal(userID, dailyTime);
	},

	// Updates the user's balance. Must be used if you don't want the JSON to be overwriten.
	updateMoney: function(message, amount) {
		if (!this.ensureUser(message)) { return; }
		userID = message.author.id;
		newbalance = Number(this.getCurBalance(message)) + amount
		this.addMoney(userID, newbalance);
		return "Successfully updated balance";
	},

	// Removes money from your account. Only admins can use this command.
	rmMoney: function(message, amount) {
		newbalance = Number(this.getCurBalance(message)) - amount
		this.addMoney(message.author.id, newbalance)
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
		if (!this.ensureUser(message)) { return; }
		this.updateTimeList();
		curTime = now.getTime();
		curDailyTime = Number(this.getCurDailyTime(message));
		twentyFourTimeDiff = (curDailyTime + 86400000) - curDailyTime;
		
		if (!((curTime - curDailyTime) >= twentyFourTimeDiff)) {
			out = "It hasn't been twenty four hours! Come back another time."
		}
		if ((curTime - curDailyTime) >= twentyFourTimeDiff) {
			this.updateMoney(message, 100);
			this.addTime(message.author.id, curTime);
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
		if (people[message.author.id]) {
			message.channel.send("You already have an account.");			
			return;
		}

		userID = message.author.id;
		const time = 60000; //amount of time to collect for in milliseconds

		message.channel.send("React to the checkmark below to create a new account.")
		.then(async function (message) {
			 await message.react('✅')
			 const filter = (reaction, user) => {
				return ['✅'].includes(reaction.emoji.name) && user.id === userID;
			 };

			 const collector = message.createReactionCollector(filter, { time: time });

			 collector.on('collect', (reaction, reactionCollector) => {
				addMoneyInternal(userID, 1000)
				dailyTime = now.getTime();
				addTimeInternal(userID, dailyTime)
				message.reply("your new account has been created")
			 });
		});
	}
}
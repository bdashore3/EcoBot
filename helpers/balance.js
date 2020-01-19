/* This file is responsible for CRUD with storing user balances
 *
 *
 * NOTE: Only admins should use CRUD options
 *
 */

const fs = require('fs');

const jsonPath = "./JSON/";
const now = new Date();

var people = {};

var times = {};

const currency = "RegalCoins";

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
	backupAll: function() {
		backup();
	},

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

	ensureUser: function (message) {
		this.updateBalList()
		if (!people[message.author.id]) {
			message.reply("Please create a new account by typing `^newaccount`");
			return false;
		}
		return true;
	},

	getCurBalance: function (message) {
		if (!this.ensureUser(message)) { return; }
		return people[message.author.id];
	},

	getCurDailyTime: function (message) {
		if (!this.ensureUser(message)) { return; }
		return times[message.author.id];
	},

	addMoney: function(userID, newbalance) {
		addMoneyInternal(userID, newbalance);
	},

	addTime: function(userID, dailyTime) {
		addTimeInternal(userID, dailyTime);
	},

	updateMoney: function(message, amount) {
		if (!this.ensureUser(message)) { return; }
		userID = message.author.id;
		newbalance = Number(this.getCurBalance(message)) + amount
		this.addMoney(userID, newbalance);
		return "Successfully updated balance";
	},

	rmMoney: function(message, amount) {
		newbalance = Number(this.getCurBalance(message)) - amount
		this.addMoney(message.author.id, newbalance)
		return "Successfully updated balance";
	},

	dailyTimeCheck: function(message) {
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

	/* Function flow:
	 * Send a message
	 * Add a reaction to it
	 * Wait for user reactions
	 * If user who asked for the new acct reacts
	 *  -> Needs a copy of userID from that message
	 *  -> Run this ID through the filter
	 *
	 * Create a new account with 1000 (currency)
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
			 });
		});
	}
}
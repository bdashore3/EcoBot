/* This file is responsible for CRUD with storing user balances
 *
 *
 * NOTE: Only admins should use CRUD options
 *
 */

const fs = require('fs');

const jsonPath = "./JSON/";

var people = {};

function stringify() {
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

function add_in(userID, newbalance) {
	people[userID] = newbalance;
	fs.writeFileSync(jsonPath + 'balance.json', stringify());
	return "Balance successfully written";
}

module.exports = {
	updateBalList: function() {
		balanceList = JSON.parse(fs.readFileSync(jsonPath + 'balance.json'));
		for (var i = 0; i < balanceList.people.length; ++i) {
			curBalance = balanceList.people[i];
			people[curBalance.name] = curBalance.balance;
		}
	},

	ensureUser: function (message) {
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

	add: function(userID, newbalance) {
		add_in(userID, newbalance);
	},

	updateMoney: function(message, amount) {
		this.updateBalList()
		if (!this.ensureUser(message)) { return; }
		userID = message.author.id;
		newbalance = Number(this.getCurBalance(message)) + amount
		this.add(userID, newbalance);
		return "Successfully updated balance";
	},

	rmMoney: function(message, amount) {
		this.updateBalList()
		userID = message.author.id;
		newbalance = Number(this.getCurBalance(message)) - amount
		this.add(userID, newbalance)
		return "Successfully updated balance";
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
		this.updateBalList()
		if (this.ensureUser(message)) {
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
				add_in(userID, 1000)
			 });
		});
	}
}
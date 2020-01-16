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

module.exports = {
    updateBalList: function() {
        balanceList = JSON.parse(fs.readFileSync(jsonPath + 'balance.json'));
		for (var i = 0; i < balanceList.people.length; ++i) {
			curBalance = balanceList.people[i];
            people[curBalance.name] = curBalance.balance;
        }
    },
    
    getCurBalance: function (userID) {
        sortedList = [];

        for (name in people) {
            sortedList[sortedList.length] = name;
        }

        sortedList.sort();

        userIndex = sortedList.indexOf(userID);
        username = sortedList[userIndex];

        out = people[sortedList[userIndex]];
        return out;
    
    },

    add: function(userID, newbalance) {
        
        people[userID] = newbalance;
        fs.writeFileSync(jsonPath + 'balance.json', stringify());
        return "Balance successfully written";
    },

    updateMoney: function(userID, amount) {
        this.getCurBalance(userID)
        newbalance = Number(out) + amount
        this.add(userID, newbalance)
        return "Successfully updated balance";
    },

    rmMoney: function(userID, amount) {
        this.getCurBalance(userID)
        newbalance = Number(out) - amount
        this.add(userID, newbalance)
        return "Successfully updated balance";
    }
}
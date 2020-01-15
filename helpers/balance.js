/* This file is responsible for CRUD with storing user balances
 *
 *
 * NOTE: Only admins should use CRUD options
 *
 */

 const fs = require('fs');

 const jsonPath = "./JSON/";

module.exports = {
    add: function(username, newbalance) {
        let profile = {
            name: username,
            balance: newbalance
        }
        let data = JSON.stringify(profile, null, 2)
        fs.writeFileSync(jsonPath + 'balance.json', data);
        return "Balance successfully written";
    }


}
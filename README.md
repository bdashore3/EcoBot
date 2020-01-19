# EcoBot
This is an opensource Discord economy bot. However, this saves you many headaches because it does not use quick-db or any databases at all! This bot stores all persistent data in **json** files, so you don't have to worry about knowing **sql**!

## Preperation
Follow [this tutorial](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to set up a discord bot user.

## Features (Nothing special yet since this is a prototype)

 - Ability to gain a daily bonus
 - Add money (Bot admins)
 - Remove money (Bot admins)
 - Create a new account within the bank

## Installation
Package hooks are not included within this repository, so all you need is discord-js and fs from npm.

Copy the json files from the **samples** directory and add them into a new folder called **JSON**. Once that's done, edit the *auth.json* and *id.json* files as stated in the comments.

Once you're done, run:
> node econ.js

## Running in a server
The included systemd service is REQUIRED to run this bot in a server. Running in interactive mode is not advised. Copy the ecobot.service file into /etc/systemd/system/ecobot.service. Then, run these commands
> sudo systemctl enable ecobot.service
> sudo systemctl start ecobot.service

## Initialize the bot

One person has to run this command on firstrun:
> ^newaccount

This command allows the json file to be initialized to prevent errors. An init command will be present in the next release

# Developers and permissions
Currently, this bot is for personal used and **CANNOT** be used without permission from the developers.

Creator: Brian Dashore
Developers: Brian Dashore and Tanish Manku
Developer Discord Names: kingbri#1588, quantumcry#4820

Join the main server here: [https://discord.gg/pswt7by](https://discord.gg/pswt7by)
#!/usr/bin/env node
'use strict';

/* jshint node: true */
const chalk = require('chalk');
const error = chalk.bold.red;
const success = chalk.bold.green;
const clear = require('clear');
const figlet = require('figlet');
const columnify = require('columnify');
const vorpal = require('vorpal')();
const logSymbols = require('log-symbols');

const channels = require('./lib/channels');
const channelData = require('./lib/channelData');

clear();
console.log(chalk.yellow(figlet.textSync('YTRP', {horizontalLayout: 'default'})));
console.log(chalk.yellow('\nWelcome to YouTubeRedditPoster! Enter a command.\n'));

vorpal
    .command('add <channelid>', 'Adds a channel to monitor.')
    .action(function (args, callback) {
        channelData.getChannelName(args.channelid)
            .then(channels.addChannel)
            .then((res) => {
                console.log(logSymbols.success, success(res));
            })
            .catch((err) => {
                console.log(`${logSymbols.error} ${error(err)}`);
            });

        callback();
    });

vorpal
    .command('remove <channelid>', 'Removes a channel from the database')
    .action(function (args, callback) {
        let addIndicator = startWaitingIndicator();

        channels.remove(args.channelid).then((res) => {
            stopWaitingIndicator(addIndicator);

            console.log(`${logSymbols.success} Removed channel: ${args.channelid}`);
        })
        .catch((e) => {
            stopWaitingIndicator(addIndicator);

            console.log(error(`${logSymbols.error} Channel not found: ${args.channelid}`));
        });


        callback();
    });

vorpal
    .command('list', 'Lists all channels in the database.')
    .action(function (args, callback) {
        channels.list();
        callback();
    });

vorpal
    .command('start', 'Starts the bot')
    .action(function (args, callback) {
        channels.startBot();
        callback();
    });

vorpal
    .command('stop', 'Stops the bot')
    .action(function (args, callback) {
        channels.stopBot();
        callback();
    });

vorpal
    .command('clear', 'Clears the screen')
    .action(function (args, callback) {
        clear();
        callback();
    });


vorpal
    .delimiter('YTRP:')
    .show();
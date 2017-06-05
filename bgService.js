#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const error = chalk.bold.red;
const success = chalk.bold.green;
const info = chalk.bold.blue;
const logSymbols = require('log-symbols');
const _ = require('lodash');
const sleep = require('thread-sleep');
const RateLimiter = require('limiter').RateLimiter;
const limiter = new RateLimiter(10, 'second');

const config = require('./config');
const channels = require('./lib/channels');
const channelData = require('./lib/channelData');

let start = () => {
    /*
     Fetch all channels, grab the latest videos, and submit if needed.
     */
    channels.fetchChannels().then((storedChannels) => {
        _.forEach(storedChannels, (channel) => {
            limiter.removeTokens(1, (errd, remainingRequests) => {
                if(errd || remainingRequests === 0) {
                    sleep(1000);
                } else {
                    console.log(info("Fetching " + channel.name));
                    fetch(channel.id)
                    .then(channelData.submitToReddit)
                    .then((videos) => {
                        channels.insertNewVideos(videos, channel.id)
                    })
                    .catch((err) => {
                        console.error(err);
                    });
                }
            });
        });
    });
};

function fetch(id) {
    return Promise.all([channelData.grabAllFromYouTube(id), channels.getAllStoredVideos(id)]).then((values) => {
        return _.differenceBy(values[0], values[1], 'id');
    })
}

console.log(success(logSymbols.success , 'Background Service is running.'));
start();
setInterval(start, config.bgInterval);
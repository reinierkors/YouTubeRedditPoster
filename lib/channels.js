const moment = require('moment');
const spawn = require('child_process').spawn;
const chalk = require('chalk');
const info = chalk.bold.blue;
const errors = chalk.bold.red;
const success = chalk.bold.green;
const vorpal = require('vorpal')();
const logSymbols = require('log-symbols');
const Datastore = require('nedb');
const _ = require('lodash');

const config = require('../config');
const channelData = require('./channelData');

let db = new Datastore({ filename: config.databaseFile, autoload: true });
let child;

db.ensureIndex({ fieldName: 'id', unique: true });

let fetchChannels = () => {
    return new Promise((resolve, reject) => {
        db.find({}, function (err, data) {
            if (err) reject(err);
            resolve(data)
        });
    });
};

let getAllStoredVideos = (channel) => {
    return new Promise((resolve, reject) => {
        db.find({id: channel}, function (err, data) {
            if (err) reject(err);

            resolve(data[0].videos);
        });
    });
};

let addChannel = (channel) => {
    return new Promise((resolve, reject) => {
        channelData.grabAllFromYouTube(channel.id).then((videos) => {
            let channelObj = {
                id: channel.id,
                name: channel.name,
                "register_date": moment().unix(),
                "videos": videos,
            };

            db.insert(channelObj, function (err) {
                if (err) reject("Channel ID already exists.");

                resolve(success("Succesfully added channel: " + channel.name));
            });
        }).catch((e) => {
            console.log(e);
        });
    });
};

let list = () => {
    fetchChannels().then((channels) => {
        console.log('Listing all channels:');
        console.log('----');
        _.forEach(channels, (channel) => console.log(`${success(channel.name)} - ${channel.id} - ${channel.videos.length} videos`));
        console.log('----');
        console.log(`Total: ${channels.length} channels.`);
    });
};

let startBot = () => {
    child = spawn('node', ['bgService'], {stdio: "inherit"});
};

let stopBot = () => {
    console.log('Stopping the Background Service..');
    child.kill('SIGINT');
};

let remove = (id) => {
    return new Promise((resolve, reject) => {
        db.remove({ id: id }, {}, function (err, numRemoved) {
            if (err || numRemoved === 0) reject(false);

            resolve(true);
        });
    });
};

let insertNewVideos = (videos, channel) => {
    return new Promise((resolve, reject) => {
        _.forEach(videos, (video) => {
            db.update({id: channel}, {$push: {videos: video}}, {});
        }).then(resolve());
    });
};

module.exports = {
    addChannel,
    list,
    startBot,
    stopBot,
    remove,
    fetchChannels,
    getAllStoredVideos,
    insertNewVideos
};
const axios = require('axios');
const chalk = require('chalk');
const error = chalk.bold.red;
const success = chalk.bold.green;
const snoowrap = require('snoowrap')
const moment = require('moment');
const _ = require('lodash');

const config = require('../config');
const r = new snoowrap({
    userAgent: config.reddit.userAgent,
    clientId: config.reddit.clientId,
    clientSecret: config.reddit.clientSecret,
    username: config.reddit.username,
    password: config.reddit.password
});

let getChannelName = (id) => {
    return new Promise((resolve, reject) => {
        if (id.search(/^[a-zA-Z0-9-_]+$/) === -1 || id.length !== 24) {
            reject(error('Invalid channel ID, must be 24 characters long.'));
        }

        axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
                key: config.youtubeApiKey,
                part: 'snippet',
                id: id
            }
        }).then((response) => {
            if (response.data.pageInfo.totalResults === 0) {
                throw new Error("No YouTube Channel found for: " + id);
            }

            resolve({
                name: response.data.items[0].snippet.title,
                id: id
            });
        }).catch((e) => {
            if (e.code === 'ENOTFOUND') {
                reject("Unable to connect to the YouTube API");
            } else {
                reject(e.message);
            }
        });
    });
};

let getVideos = (id, token = null) => {
    return new Promise((resolve, reject) => {
        axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: config.youtubeApiKey,
                part: 'snippet',
                channelId: id,
                maxResults: 50,
                publishedAfter: moment().subtract(30, 'days').toISOString(),
                order: 'date',
                safeSearch: 'none',
                type: 'video',
                pageToken: token
            }
        }).then((response) => {
            // if (response.data.pageInfo.totalResults === 0) {
            //     reject(error("No videos found for ID: " + id + ". This channel could be removed."));
            // }

            resolve(response.data);
        }).catch((e) => {
            if (e.code === 'ENOTFOUND') {
                reject("Unable to connect to the YouTube API");
            } else {
                reject(error(e.message));
            }
        });
    });
};

let grabAllFromYouTube = (id, token = null, all = []) => {
    return new Promise((resolve) => {
        getVideos(id, token).then((res) => {
            if (!_.isEmpty(res.items)) {
                _.forEach(res.items, (video) => {
                    all.push({
                        id: video.id.videoId,
                        title: video.snippet.title
                    });
                });
            }

            if (res.nextPageToken) {
                resolve(grabAllFromYouTube(id, res.nextPageToken, all));
            } else {
                resolve(all);
            }
        }).catch((e) => {
            console.log(error(e));
        });
    });
};

let submitToReddit = (newVideos) => {
    return new Promise((resolve) => {
        _.forEach(newVideos, (video) => {
            _.forEach(config.reddit.subreddits, (subreddit) => {
                console.log(success(`Submitting ${video.title} to ${subreddit}`));
                r.getSubreddit(subreddit).submitLink({
                    title: video.title,
                    url: `https://www.youtube.com/watch?v=${video.id}`
                });
            });
        }).then(resolve(newVideos));
    });
};


module.exports = {
    getChannelName,
    getVideos,
    grabAllFromYouTube,
    submitToReddit
};
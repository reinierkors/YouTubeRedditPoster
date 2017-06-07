# YouTube Reddit Poster
A YouTube Bot which automatically submits new YouTube videos to Reddit as they appear.

## Install
1. Clone the project: `git clone https://github.com/reinierkors/YouTubeRedditPoster.git`
2. Install all dependencies: `npm install`
3. Rename `config-default.json` to `config.json` and fill out all fields.
4. To start, run `node app` 

## Background process
You can manually run `node bgService.js` to  fetch new videos in the background.

## Config
- `youtubeApiKey` - Your YouTube V3 Data Api Key
- `databaseFile` - Path to database file, default: db
- `reddit`
    - `subreddits` - A list of all subreddits it should post to
    - `userAgent` - User agent
    - `clientId` - Reddit API Client ID
    - `clientSecret` - Reddit API Client Secret
    - `username` - Reddit username
    - `password` - Reddit password
    
## Bug reporting guidelines
If you report a bug, thank you! This project is in it's early stages, so no guidelines yet.

## License 

See [License](LICENSE)
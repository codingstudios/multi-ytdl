# multi-ytdl
A multi thread node.js support for YouTube playlist audio downloads

## About
This is a YouTube playlist audio (mp3) downloader that runs [ytdl-core](https://github.com/fent/node-ytdl-core) on multiple threads for extra performance and download speed. This is an improved version of our existing project [ytdl/playlist-download.js](https://github.com/codingstudios/ytdl/). 

- Every feature from [CodingStudios/ytdl](https://github.com/codingstudios/ytdl/)
- Performant
- Pick up where you left off (continue to download without starting from the beginning)
- Bulk download tracks from public YouTube playlist 
- Easy to setup
- Supports Google Drive Uploads

## Setup
1. Install ffmpeg
2. Install the dependencies: `npm install`
3. Configure the [config.json](./src/config.json) file
4. Run the downloader: `npm start`

> If you use Google Drive, you'll need to obtain your `CLIENT_ID` & `CLIENT_SECRET` from [console.developers.google.com](https://console.developers.google.com) then goto [developers.google.com/oauthplayground](https://developers.google.com/oauthplayground) to authorize the **Drive API v3** and obtain your `REFRESH_TOKEN`.



## Credit
This project is available as open source under the terms of the [MIT License](/LICENSE)

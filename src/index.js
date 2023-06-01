const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, DIRECTORY, PLAYLIST, thread_count } = require('./config.json');

const chalk = require("chalk");
const { Worker } = require("worker_threads");
const search = require("youtube-sr").default;
const fs = require("fs");
const collection = new Set();
const { google } = require("googleapis");
const path = require("path");
const downloaded = [];
const videos = [];

start();

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
});

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});


const timeStart = performance.now();

const getTime = (d) => {
  d = new Date(1000 * Math.round(d / 1000));
  function pad(i) {
    return ("0" + i).slice(-2);
  }
  return (
    d.getUTCHours() +
    ":" +
    pad(d.getUTCMinutes()) +
    ":" +
    pad(d.getUTCSeconds())
  );
};

async function upload() {
for (i in dir) {
        await uploadFile(`./${DIRECTORY}/${dir[i]}`, `${dir[i].slice(0, -4)}.mp3`);
}
}

async function start() {
  console.log(
    chalk`{bgBlue ${chalk.bold("  Multi Thread YouTube Playlist Downloader  ")}}\n   {yellow by Chee Yong Lee} {grey (https://github.com/CodingStudios/multi-ytdl)}`
  );
  console.log(chalk`{bgCyan JOB STARTED} {yellow with ${thread_count} threads} {green [tracks are saved to ${chalk.bold(DIRECTORY)}]}`);
  try {
    const dir = fs.readdirSync(`./${DIRECTORY}`).filter((file) => file.endsWith(".mp3"));
    for (i in dir) {
      collection.add(dir[i].slice(0, -4));
    }
    const data = await search
      .getPlaylist(PLAYLIST)
      .then((playlist) => playlist.fetch());
    if (!Array.isArray(data?.videos)) throw new Error("No videos found");
    const jobs = [];
    for (let i in data.videos) {
      if (
        !collection.has(
          data.videos[i]?.title.split("/").join(" ").split(".").join(" ")
        )
      ) {
        videos.push(data.videos[i]);
      }
    }
    if(videos.length == 0) return console.log(chalk`{bgGreen ${chalk.bold("  All tracks are downloaded  ")}}`);
    for (let i = 0; i < videos.length; i += videos.length / thread_count) {
      jobs.push(videos.slice(i, i + videos.length / thread_count));
    }
    async function createWorker(i) {
      return new Promise(function (resolve, reject) {
        const worker = new Worker("./runner.js", {
          workerData: { thread_count: i, jobs, DIRECTORY },
        });
        worker.on("message", (data) => {
          if (data.status == "done") {
            downloaded.push(data.name);
            collection.add(data.filename);
            console.log(
              chalk.bold.bgGreen(" Done "),
              chalk`{yellow (${downloaded.length}/${collection.size}/${
                videos.length
              })} {green ${data.name}} {dim [${getTime(
                performance.now() - timeStart
              )}]}`
            );
          }
          if (data.status == "error")
            console.log(
              chalk`{bgRed ${chalk.bold(" Error ")}} {yellow (${
                collection.size
              }/${videos.length})} {red ${data.name}} {bold ${data.message}}`
            );
          if (data == "end") {
            worker.terminate();
            resolve(data);
          }
        });
        worker.on("error", (msg) => {
          reject(`An error ocurred: ${msg}`);
        });
      });
    }

    const workerPromises = [];
    for (let i = 0; i < thread_count; i++) {
      workerPromises.push(createWorker(i));
    }

    await Promise.all(workerPromises);

    console.log(
      chalk`{bgGreen - ${chalk.bold("Done")} -} {yellow in ${getTime(
        performance.now() - timeStart
      )}}  {bgGreen Downloaded} {bgBlue ${chalk.bold(
        downloaded.length
      )}/${chalk.bold(videos.length)}}`
    );
  } catch (error) {
    console.log(error);
  }
}

async function uploadFile(filePath, name) {
    try {
      const response = await drive.files.create({
        requestBody: {
          name: `${name}`,
        },
        media: {
          body: fs.createReadStream(`${path.join(__dirname, filePath)}`),
        },
      });
  
      return response.data;
    } catch (error) {
      console.log(error.message);
    }
}

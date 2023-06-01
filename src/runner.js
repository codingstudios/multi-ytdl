const ffmpeg = require("fluent-ffmpeg");
const ytdl = require("ytdl-core");
const fs = require("fs");
const { workerData, parentPort } = require("worker_threads");

const getAudio = (video) =>
  new Promise((resolve, reject) => {
    var stream = ytdl(video?.url, { filter: "audioonly" });
    var file = fs.createWriteStream(
      `./${workerData?.DIRECTORY}/${video?.title
        .split("/")
        .join(" ")
        .split(".")
        .join(" ")}.mp3`
    );
    ffmpeg(stream)
      .format("mp3")
      .save(file)
      .on("end", () => {
        resolve({
          status: "done",
          name: video?.title,
          filename: video?.title.split("/").join(" ").split(".").join(" "),
        });
      });
  });

(async () => {
  const job = workerData.jobs[workerData.thread_count];
  for (let video of job) {
    try {
      parentPort.postMessage(
        await getAudio({
          ...video,
          url: "https://www.youtube.com/watch?v=" + video?.id,
        })
      );
    } catch (e) {
      parentPort.postMessage({
        status: "error",
        name: video?.title,
        message: e.message,
      });
    }
  }

  parentPort.postMessage("end");
})();

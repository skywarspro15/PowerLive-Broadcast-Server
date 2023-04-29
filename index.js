const runCommand = require("./runCommand.js");
const fileUpload = require("express-fileupload");
const config = require("./config.js").config;
const express = require("express");
const cors = require("cors");
const tmp = require('tmp');
const fs = require("fs");
const app = express();

let sequence = { "sequence": [] };
let stream_status = "Not started"; 

if (!fs.existsSync("sequence.json")) {
  console.log("[INFO] Creating sequence file...");
  fs.writeFileSync("sequence.json", JSON.stringify(sequence, null, 2));
} else {
  sequence = JSON.parse(fs.readFileSync("sequence.json"));
}


app.use(fileUpload());
app.use(cors());

app.post("/startStream", (req, res) => {
  if (req.query.password != config.password) {
    return res.status(401).send("[ERR] Unauthorized");
  }
  stream_status = "Starting..."; 
  const concatList = sequence["sequence"].map(clip => `file '${__dirname + "/videos/" + clip}'`).join('\n');
  const tmpFile = 'concat-list.txt';
  fs.writeFileSync(tmpFile, concatList);

  runCommand('ffmpeg', `-f concat -safe 0 -i ${tmpFile} -c copy stream.mp4`, (data) => console.log(data), () => {
    fs.unlinkSync(tmpFile);
    console.log("[INFO] Started stream");
    res.send("[INFO] Started stream");
    stream_status = "Started";
    runCommand(
      'ffmpeg',
      '-re -i stream.mp4 -c copy -f flv rtmp://a.rtmp.youtube.com/live2/' + config.stream_key,
      (data) => { console.log(data) },
      () => {
        console.log("[INFO] Stream ended");
        fs.unlinkSync("stream.mp4")
      }
    );
  });

});

app.get("/ping", (req, res) => {
  res.send("Pong!");
});

app.get("/authenticate", (req, res) => {
  if (req.query.password == config.password) {
    res.send("[INFO] Authorized");
  } else {
    return res.status(401).send("[ERR] Unauthorized");
  }
})

app.delete("/sequence", (req, res) => {
  if (req.query.password != config.password) {
    return res.status(401).send("[ERR] Unauthorized");
  }
  sequence["sequence"] = []; 
  fs.writeFileSync("sequence.json", JSON.stringify(sequence, null, 2));
  res.send("[INFO] Deleted sequence"); 
}); 

app.get("/sequence", (req, res) => {
  if (req.query.password != config.password) {
    return res.status(401).send("[ERR] Unauthorized");
  }
  let seqStr = "";
  sequence["sequence"].forEach((clip, index) => {
    seqStr = seqStr + index + "|" + clip + "\n";
  });
  res.send(seqStr);
});

app.post("/sequence", (req, res) => {
  if (req.query.password != config.password) {
    return res.status(401).send("[ERR] Unauthorized");
  }
  let rawSeq = String(req.query.s).split("||");
  sequence["sequence"] = [];
  rawSeq.forEach((clip, index) => {
    sequence["sequence"].push(clip);
    fs.writeFileSync("sequence.json", JSON.stringify(sequence, null, 2));
  });
  res.send("[INFO] Sequence updated");
});


app.post("/uploadVideo", (req, res) => {
  let curVideo;
  let vidPath;

  if (req.query.password != config.password) {
    return res.status(401).send("[ERR] Unauthorized");
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("[ERR] No videos to upload");
  }

  curVideo = req.files.video;
  vidPath = __dirname + '/videos/' + curVideo.name;

  if (!fs.existsSync(vidPath)) {
    curVideo.mv(vidPath, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.send("[INFO] Video uploaded");
    });
  } else {
    res.send("[INFO] Video already uploaded");
  }

});

app.listen(8080, () => {
  console.log("[INFO] PowerLive Server now running on port 8080");
});



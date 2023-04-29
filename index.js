const runCommand = require("./runCommand.js");
const fileUpload = require("express-fileupload");
const config = require("./config.js").config;
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();

app.use(fileUpload());
app.use(cors());

app.get("/sequence", (req, res) => {

});

app.post("/sequence", (req, res) => {

});


app.post("/uploadVideo", (req, res) => {
  let curVideo;
  let vidPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("[ERR] No videos to upload");
  }

  curVideo = req.files.video;
  vidPath = __dirname + '/videos/' + curVideo.name;

  curVideo.mv(vidPath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send("[INFO] Video uploaded");
  });

});

app.listen(8080, () => {
  console.log("[INFO] PowerLive Server now running on port 8080");
});



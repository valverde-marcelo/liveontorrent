// HTML Elements

var record = document.querySelector('#recordbutton');
var stop = document.querySelector('#stopbutton');
var videoElement = document.querySelector("video");
var audioSelect = document.querySelector("select#audioSource");
var videoSelect = document.querySelector("select#videoSource");

var form = document.getElementById("form");
var selectCategory = document.getElementById("category");
var xtagged = document.getElementById("x-tagged");
var author = document.getElementById("author");
var title = document.getElementById("title");
var keywords = document.getElementById("keywords");
var description = document.getElementById("description");

var div_speed_upload = document.getElementById('speed_upload');
var div_total_uploaded = document.getElementById('total_uploaded');
var div_viewers = document.getElementById('viewers');

//Client Torrent
var announce = ["udp://tracker.leechers-paradise.org:6969",
  "udp://tracker.coppersurfer.tk:6969",
  "udp://tracker.opentrackr.org:1337",
  "udp://explodie.org:6969",
  "udp://tracker.empire-js.us:1337",
  "wss://tracker.openwebtorrent.com"];

var opts;
var json_form;

//chunk order
var sequence = 1;
var n = 1;
var filename = "";
var is_stream = false;
var is_stopped = true;
var token  = uuid();

//globals
var mainStream;
var main;
var timeout;
var hash;
var total_uploaded = 0;
var viewers = [];

/**
 * 
 * ON LOAD EVENT LISTENERS
 * 
 */
window.addEventListener("load", function (event) {

  try {

    //getDevices
    getDevices().then(gotDevices);
    //getCategories
    getCategories();

  } catch (error) {
    window.location = ERROR_PAGE;
  }

});

/**
 * ON CLICK EVENTS
 */

record.onclick = () => {

  if (!is_stream) {

    if (validate()) {
      blockForm(true);
      //console.log("formulario validado");
      client = new WebTorrent();
      createStream(json_form);
    } else {
      //console.log("formulario não validado");
    }

  } else {
    pauseStream();
  }
};


stop.onclick = () => {
  stopStream();
}

async function stopStream() {

  logger(`[SEEDER]: stream stopping...`, "goldenrod");

  is_stopped = true;
  record.disabled = true;
  stop.disabled = true;
  stop.style.cursor = "wait";

  //clear video element stream
  videoElement.srcObject = null;

  clearInterval(main);
  clearTimeout(timeout);

  //wait last send
  await sleep(SLICE);

  sendMagnet({
    "action": "insert",
    "token": token,
    "hash": "EOF",
    "name": "EOF",
    "sequence": sequence
  });

  updateStream({
    "action": "update",
    "token": token,
    "finished": 1
  });

  //reset default
  reset();

  blockForm(false);

  logger(`[SEEDER]: stream stopped`, "goldenrod");

  //wait last send
  //await sleep(4*SLICE);

  //client.destroy();

  //delete client;
  //logger(`[SEEDER]: client destroyed`, "goldenrod");
}

xtagged.onclick = () => {
  if (!is_stopped) {
    updateStream({
      "action": "xtag",
      "token": token,
      "xtagged": xtagged.checked
    });
  }
}

function reset() {
  sequence = 1;
  n = 1;
  filename = "";
  is_stream = false;
  mainStream = null;
  main = null;
  timeout = null;
  hash = null;
  token = uuid();
  record.innerText = "START";
  record.disabled = false;
  stop.style.cursor = "default";
  blockForm(false);

  total_uploaded = 0;
  viewers = [];

  div_speed_upload.innerText = "";
  div_total_uploaded.innerText = "";
}

/**
 * 
 * STREAM FUNCTIONS
 * 
 */
function pauseStream() {

  clearInterval(main);
  clearTimeout(timeout);

  is_stream = false;

  record.innerText = "CONTINUE";

  logger(`[SEEDER]: stream paused`, "goldenrod");
}

function startStream() {

  const audioSource = audioSelect.value;
  const videoSource = videoSelect.value;

  let audio = false;

  if(audioSource != "false"){
    audio = { deviceId: audioSource ? { exact: audioSource } : undefined }
  }

  const constraints = {
    audio: audio,
    video: { deviceId: videoSource ? { exact: videoSource } : undefined }
  };

  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
}

function gotStream(stream) {
  logger(`[SEEDER]: start stream token ${token}`, "goldenrod");

  videoElement.srcObject = stream;

  mainStream = stream;

  // generate a new file every SLICE
  logger(`[SEEDER]: start record`, "goldenrod");
  main = setInterval(record_and_send, SLICE);

  record.innerText = "PAUSE";
  is_stream = true;
  is_stopped = false;
}

function handleError(error) {
  logger(error, "red");
}

function record_and_send() {

  sequence = n;

  filename = "chunk" + ("00000" + sequence).slice(-5) + EXTENSION;

  logger(`[SEEDER]: prepare to seed - ${filename}`, "goldenrod");

  let options = { mimeType: mime };
  let recorder = new MediaRecorder(mainStream, options);

  let chunks = [];

  recorder.ondataavailable = e => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  }

  recorder.onstop = e => {
    let blob = new Blob(chunks, { type: mime });
    logger(`[${filename}]: created with ${prettyBytes(blob.size)}`, "green");
    opts = { name: filename, announce: announce };
    client.seed(blob, opts, onseed);
    n = n + 1;
  }

  //setTimeout(() => recorder.stop(), SLICE); // we'll have a 5s media file

  timeout = setTimeout(function () {
    if (recorder.state != "inactive") {
      recorder.stop();
    }
  }, SLICE);

  recorder.start();

  //update thumbnail
  let thumbnail = screenshot();

  updateStream({
    "action": "thumbnail",
    "token": token,
    "thumbnail": thumbnail
  });

  //clear old torrents
  clearTorrents(MAX_SEEDS);

  let total_viewers = Object.keys(viewers).length;

  logger(`[SEEDER]: active seeds - ${client.torrents.length}`, "goldenrod");
  logger(`[SEEDER]: uploaded seeds - ${prettyBytes(total_uploaded)}`, "goldenrod");
  logger(`[SEEDER]: max viewers - ${total_viewers}`, "goldenrod");

  //update broadcast status

  div_speed_upload.innerText = prettyBytes(client.uploadSpeed) + "/s";
  div_total_uploaded.innerText = prettyBytes(total_uploaded);
  div_viewers.innerText = total_viewers;
}

/**
 * 
 * MEDIA DEVICE FUNCTIONS
 * 
 */

function getDevices() {
  return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
  window.deviceInfos = deviceInfos;
  for (const deviceInfo of deviceInfos) {
    const option = document.createElement("option");
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === "audioinput") {
      option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
      audioSelect.appendChild(option);
    } else if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    }
  }
}

function screenshot() {

  let canvas = document.createElement("canvas");

  let image = "";

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  canvas.getContext("2d").drawImage(videoElement, 0, 0);
  // Other browsers will fall back to image/png

  image = canvas.toDataURL("image/webp");

  delete canvas;

  return image;
}

/**
 * 
 * WEBTORRENT FUNCTIONS
 * 
 */

function onseed(torrent) {
  logger(`[${filename}]: seeding with hash ${torrent.infoHash}`, "green");
  sendMagnet({
    "action": "insert",
    "token": token,
    "hash": torrent.infoHash,
    "name": filename,
    "sequence": sequence
  });

  updateStream({
    "action": "update",
    "token": token,
    "viewers": Object.keys(viewers).length
  });

  torrent.on('upload', function (bytes) {
    total_uploaded += bytes;
  });

  torrent.on('wire', function (wire, addr) {
    viewers[wire.peerId] = null;
  });

}

/**
 * 
 * XHR FUNCTIONS
 * 
 */
function sendMagnet(data) {
  var xml = new XMLHttpRequest();
  var url = XHR_MAGNET;
  xml.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var response = JSON.parse(this.responseText);
      if (response) {
        logger(`[${data.name}]: added to manifest`, "green");
      } else {
        logger("Error database", "red");
      }
    }
  };

  xml.open("POST", url, false);
  xml.setRequestHeader("Content-Type", HEADER_JSON);
  xml.send(JSON.stringify(data));
}

function getCategories() {
  let xml = new XMLHttpRequest();
  let url = XHR_CATEGORIES;
  xml.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let data = JSON.parse(this.responseText);
      for (let i in data) {
        let category = data[i];
        let option = document.createElement("option");
        option.value = category.id;
        option.text = category.description;
        selectCategory.appendChild(option);
      }
    }
  };

  xml.open("POST", url, false);
  xml.setRequestHeader("Content-Type", HEADER_JSON);
  xml.send();
}

function createStream(data) {
  let xml = new XMLHttpRequest();
  let url = XHR_STREAM;
  xml.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var response = JSON.parse(this.responseText);
      if (response) {
        /**
         * START STREAM AFTER RECORD IN DATABASE
         */
        startStream();
      } else {
        logger("Error database", "red");
      }
    }
  };

  xml.open("POST", url, false);
  xml.setRequestHeader("Content-Type", HEADER_JSON);
  xml.send(JSON.stringify(data));
}

function updateStream(data) {
  let xml = new XMLHttpRequest();
  let url = XHR_STREAM;
  xml.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var response = JSON.parse(this.responseText);
      if (response) {
        logger(`[SEEDER]: update ${data.action}`, "blue");
      } else {
        logger("Stream not found/Error database", "red");
      }
    }
  };

  xml.open("POST", url, false);
  xml.setRequestHeader("Content-Type", HEADER_JSON);
  xml.send(JSON.stringify(data));
}


/**
 * 
 * FORM VALIDATE
 * 
 */

function validate() {
  if (selectCategory.value === "" || Number(selectCategory.value) > 18 || Number(selectCategory.value) < 1) {
    return false;
  }
  if (title.value.length < 10 || title.value.length > 255) {
    return false;
  }
  /*
  if (keywords.value.length < 10 || keywords.value.length > 255) {
    return false;
  }
  if (description.value.length < 10 || description.value.length > 4000) {
    return false;
  }
  */
  if (token.length < 10) {
    return false;
  }

  json_form = {
    "action": "insert",
    "token": token,
    "category": Number(selectCategory.value),
    "author": author.value,
    "title": title.value,
    "keywords": keywords.value,
    "description": description.value,
    "xtagged": xtagged.checked,
    "finished": 0
  };

  return true;
}

function blockForm(disabled) {
  category.disabled = disabled;
  author.disabled = disabled;
  title.disabled = disabled;
  keywords.disabled = disabled;
  description.disabled = disabled;
  stop.disabled = !disabled;//inverse logic
}
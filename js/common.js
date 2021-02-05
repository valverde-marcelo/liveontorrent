//COMMON CONFIG
const SLICE = 5000;
const mime = 'video/webm;codecs=vp9,opus'; //same as client
const EXTENSION = ".mp4";
const MAX_SEEDS = 11;
const MAX_PEERS = 11;
const ERROR_PAGE = "error.html";

//COMMON MESSAGES
const WEBRTC_OK = "WEBRTC support OK";
const WEBRTC_FAIL = "WEBRTC support FAIL";
const CLIENT_OK = "WebTorrent CLIENT OK";
const CLIENT_FAIL = "WebTorrent CLIENT FAIL";
const MEDIA_DEVICES_OK = "MEDIA DEVICES support OK";
const MEDIA_DEVICES_FAIL = "MEDIA DEVICES support FAIL";
const STOP_STREAMS = "[GLOBAL] stopping active streams";

//URLs
const URL_WHATSAPP = "https://api.whatsapp.com/send?&text=";
const URL_CLIENT_BASE = "https://www.weboscoder.com/liveontorrent/peer.php?";

//XHR ENDPOINTS
const XHR_MAGNET = "./server/xhr/magnet.php";
const XHR_CATEGORIES = "./server/xhr/categories.php";
const XHR_STREAM = "./server/xhr/stream.php";

const HEADER_JSON = "application/json;charset=UTF-8";

//COMMON HTML ELEMENTS
var share = document.getElementById("sharebutton");

//GLOBAL VARS
var client;


//CHECK WEBRCTC SUPPORT
if (WebTorrent.WEBRTC_SUPPORT) {
    client = new WebTorrent();
    logger(WEBRTC_OK, "goldenrod");
} else {
    logger(WEBRTC_FAIL, "red");
    window.location = ERROR_PAGE;
}

//CHECK WEBTORRENT CLIENT
if (client && client.nodeId) {
    logger(CLIENT_OK, "goldenrod");
} else {
    logger(CLIENT_FAIL, "red");
    window.location = ERROR_PAGE;
}

//CHECK NAVIGATOR USER MEDIA
if (navigator.mediaDevices.getUserMedia) {
    logger(MEDIA_DEVICES_OK, "goldenrod");
} else {
    logger(MEDIA_DEVICES_FAIL, "red");
    window.location = ERROR_PAGE;
}

//STOP ACTIVE STREAMS
if (window.stream) {
    logger(STOP_STREAMS, "goldenrod");
    window.stream.getTracks().forEach(track => {
        track.stop();
    });
}


/**
 * COMMON FUNCTIONS
 */

share.onclick = () => {
    let url = `${URL_CLIENT_BASE}${token}`
    console.log(url);
    shareLink(url);
}

function shareLink(url){
    let url_encoded = encodeURI(url);
    window.open(`${URL_WHATSAPP}${url_encoded}`, "_blank");
}

function clearTorrents(max) {
    if (client.torrents.length > max) {
        //remove first
        let torrentId = client.torrents[0].infoHash;
        client.remove(torrentId);
    }
}

function logger(msg, color) {
    console.log("%c" + msg, "color:" + color + ";");
}

function uuid() {
    let segments = 4;
    let len = 4;
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ';
    let pieces = [];
    for (let n = 0; n < segments; n++) {
        let piece = "";
        for (let i = 0; i < len; i++) {
            let rnum = Math.floor(Math.random() * chars.length);
            piece += chars.substring(rnum, rnum + 1);
        }
        pieces.push(piece);
    }

    return pieces.join("-");
}

async function sleep(time) {
    await wait(time);
}

function wait(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

function prettyBytes(num) {
    var exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    if (neg) num = -num
    if (num < 1) return (neg ? '-' : '') + num + ' B'
    exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
    num = Number((num / Math.pow(1000, exponent)).toFixed(2))
    unit = units[exponent]
    return (neg ? '-' : '') + num + ' ' + unit
}

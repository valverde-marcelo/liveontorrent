// HTML Elements
var div_name = document.getElementById('name');
var div_speed = document.getElementById('speed');
var div_downloaded = document.getElementById('downloaded');

var div_progress = document.getElementById('progress');
var div_speed_download = document.getElementById('speed_download');
var div_speed_upload = document.getElementById('speed_upload');
var div_total_downloaded = document.getElementById('total_downloaded');
var div_total_uploaded = document.getElementById('total_uploaded');
var div_peers = document.getElementById('peers');
var div_total_peers = document.getElementById('total_peers');

var stop = document.querySelector('#stopbutton');
var video = document.querySelector("video");
var over = document.getElementById("over");
var ended = document.getElementById("ended");

var pieces = document.querySelector(".pieces");

var category = document.getElementById("category");
var xtagged = document.getElementById("x-tagged");
var author = document.getElementById("author");
var title = document.getElementById("title");
var keywords = document.getElementById("keywords");
var description = document.getElementById("description");

const FINISHED = Number(document.getElementById("finished").innerText);

const ANNOUNCE_STRING = "&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=wss%3A%2F%2Ftracker.openwebtorrent.com";
const MEDIA_SOURCE_STATE = "[PEER] MEDIA SOURCE ready state: ";
const MEDIA_SOURCE_MIME_FAIL = "[PEER] MEDIA SOURCE mime type not supported";

//GET TOKEN
var token = window.location.search.substring(1);

console.log(token);

//array buffer
var AB = [];
var lastSequence = 0;
var total_downloaded = 0;
var total_uploaded = 0;

var loader, mediaSource, sourceBuffer;

if (FINISHED == 1) {
    over.classList.toggle("hidden");
    ended.classList.toggle("hidden");
}

over.onclick = () => {
    over.classList.toggle("hidden");
    video.classList.toggle("hidden");
    init();
};

video.onended = () => {
    ended.classList.toggle("hidden");
    video.classList.toggle("hidden");
};

var init = () => {
    if (FINISHED != 1) {
        loader = setInterval(getManifest, SLICE / 2);
        mediaSource = new MediaSource();
        video.src = URL.createObjectURL(mediaSource);
        mediaSource.addEventListener("sourceopen", sourceOpen);
    } else {
        logger(`Transmissão finalizada pelo servidor`, "red");
        //TODO: remover elemento video e substituir por mensagem de transmissao encerrada
        //video.parentNode.removeChild(video);
    }
}


function sourceOpen() {

    if (MediaSource.isTypeSupported(mime)) {
        console.warn(mime + " supported");
        sourceBuffer = mediaSource.addSourceBuffer(mime);
        sourceBuffer.mode = 'sequence';

        logger(`${MEDIA_SOURCE_STATE} ${this.readyState}`, "goldenrod");

    } else {
        logger(MEDIA_SOURCE_MIME_FAIL, "red");
    }

}

var buffer = false;
var bufferlen = 0;
var playlimit = 5;

function startBuffer(sequence) {

    buffer = true;

    if(eof) {
        stopLoaderManifest();
        return;
    }

    //playVideo();

    if (mediaSource.readyState == "open" && !sourceBuffer.updating) {

        logger("START BUFFER", "green");

        sourceBuffer.appendBuffer(AB[sequence]);
        bufferlen ++;

        updateHTMLpiece(sequence, 'blue');

        //playVideo();

        loadBuffer(sequence + 1);

        delete AB[sequence];

    } else {
        //retry
        setTimeout(startBuffer, SLICE / 2, sequence);
    }

}

function stopLoaderManifest() {
    logger("Interrompendo carregador de manifesto", "red");
    clearInterval(loader);
    clearTimeout(retry_busy);
    clearTimeout(retry_not_found);
    return;
}

var discards = 0;
var max_discards = 10;

var retry = 0;
var max_retry = 4;

var retry_busy;
var retry_not_found;

function loadBuffer(sequence) {

    if(bufferlen > playlimit) {
        playVideo();
    }

    if(discards > max_discards){
        retry = 0;
        discards = 0;
        loadBuffer(head);
    }

    if (mediaSource.readyState == "open") {

        if(eof) {
            logger("Fechando Stream", "red");
            mediaSource.endOfStream();
            stopLoaderManifest();
            return;
        }

        if (AB[sequence] && AB[sequence]!="EOF") {

            if (!sourceBuffer.updating) {
                logger(`CHUNK ADICIONADO AO BUFFER! N: ${sequence}`, "green");
                sourceBuffer.appendBuffer(AB[sequence]);
                bufferlen ++;
                //playVideo();
                delete AB[sequence];
                updateHTMLpiece(sequence, 'blue');
                retry = 0;
                loadBuffer(sequence + 1);
            } else {
                //retry
                logger(`SOURCE BUFFER OCUPADO - N:  ${sequence}`, "red");
                retry_busy = setTimeout(loadBuffer, SLICE / 4, sequence);

            }
        } else {
            if (retry < max_retry) {
                retry++;
                //retry
                logger(`CHUNK NAO ENCONTRATO - RETRY: ${retry}`, "red");
                retry_not_found = setTimeout(loadBuffer, SLICE / 2, sequence);
            } else {
                logger(`CHUNK NAO ENCONTRATO - DESCARTAR! PROXIMO: ${sequence + 1}`, "red");
                discards ++;
                retry = 0;
                loadBuffer(sequence + 1);
            }

        }

    }
}

//TODO: implementar ordenamento
/*
function loadBuffer(sequence, eof) {
    //console.log("chamou loadBuffer: " + sequence);

    //TODO: corrigir problema do buffer ocupado
    //Uncaught DOMException: Failed to execute 'appendBuffer' on 'SourceBuffer': This SourceBuffer is still processing an 'appendBuffer' or 'remove' operation.
    //if ( !sourceBuffer.updating ) 

    //se for o ultimo, apenas fechar o buffer.
    //Não interromper. Tocar até terminar.
    if (eof && mediaSource.readyState == "open") {
        logger("Fechando Stream", "red");
        mediaSource.endOfStream();
        logger("Interrompendo carregador de manifesto", "red");
        clearInterval(loader);
        return;
    }

    if (sequence > lastSequence && mediaSource.readyState == "open") {
        logger(`Adicionando ao buffer - Sequence: ${sequence}`, "goldenrod");
        
        if(!sourceBuffer.updating) {
            sourceBuffer.appendBuffer(AB[sequence]);

            logger(`Limpando da memória - Sequence: ${sequence}`, "goldenrod");
            delete AB[sequence];
    
            logger(`Tamanho memória: ${AB.length}`, "goldenrod");
    
            lastSequece = sequence;
        } else {
            logger('Buffer busy, retry after n seconds....', "red");
            //wait and retry
            let retry = setTimeout(loadBuffer, SLICE/2, AB[sequence], false);
        }
        
    }

    //precisa de interação na tela para dar PLAY()
    if (mediaSource.readyState == "open" && video.paused) {
        try {
            video.play();
        } catch (error) {
            logger(error, "red");
        }   
    }
}
*/

function playVideo() {
    video.play();
    /*
    if (mediaSource.readyState == "open" && video.paused) {
        try {
            video.play();
        } catch (error) {
            logger(error, "red");
        }
    }
    */
}

/**
 * 
 * XHR FUNCTIONS
 * 
 */

function getManifest() {
    logger(`Get MANIFEST from server`, "goldenrod");
    var json = { "action": "get", "token": token };
    var xml = new XMLHttpRequest();
    var url = XHR_MAGNET;
    xml.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
            if (response) {
                /**
                 * START DONWLOAD TORRENTS
                 */
                downloadTorrent(response);
            } else {
                logger("Error database", "red");
            }
        }
    };

    xml.open("POST", url, false);
    xml.setRequestHeader("Content-Type", HEADER_JSON);
    xml.send(JSON.stringify(json));
}

var eof = false;
var head;

function downloadTorrent(manifest) {

    head = manifest[0].sequence;
    
    for (let k in manifest) {

        let chunk = manifest[k];

        //console.log(chunk.sequence);

        createHTMLpiece(chunk.sequence);

        if (chunk.hash == "EOF") {
            logger("Recebido sinal de fim da transmissão", "red");
            //sinalizar fim da transmissão para o buffer
            //loadBuffer(0, true);

            eof = true;

            AB[chunk.sequence] = "EOF";
            
            return;
        }

        //logger("transmitindo", "green");

        //verifica se o chunk já foi adicionado
        if (!client.get(chunk.hash)) {

            let magnetURI = `magnet:?xt=urn:btih:${chunk.hash}${ANNOUNCE_STRING}`;

            //createHTMLpiece(chunk.sequence);

            //adiciona ao cliente para download
            //Note: downloading a torrent automatically seeds it,
            //allowing the user to also serve the file to other peers
            client.add(magnetURI, function (torrent) {

                div_name.innerText = torrent.name;

                torrent.on('download', function (bytes) {
                    div_speed.innerText = prettyBytes(torrent.downloadSpeed);
                    div_downloaded.innerText = prettyBytes(torrent.downloaded);
                    div_progress.innerText = Math.round(torrent.progress * 100 * 100) / 100 + "%";
                    div_peers.innerText = torrent.numPeers;
                    updateHTMLpiece(chunk.sequence, 'yellow');
                });

                torrent.on('upload', function (bytes) {
                    total_uploaded += bytes;
                });

                torrent.on('done', function () {
                    total_downloaded += torrent.downloaded;
                    updateHTMLpiece(chunk.sequence, 'green');
                });

                let file = torrent.files[0];

                file.getBuffer(function (err, buff) {
                    if (err) throw err;

                    //adiciona o buffer no array indexado pelo sequence
                    AB[chunk.sequence] = buff;

                    //envia fragmento para reprodução no buffer
                    //loadBuffer(chunk.sequence, false);

                    if (!buffer) {
                        startBuffer(chunk.sequence);
                    }

                    /*
                    // video duration Infinity!!

                    let pvideo = document.createElement('video');
                    pvideo.preload = 'metadata';
                    pvideo.onloadedmetadata = function () {
                        console.log("carregou metadados")
                        console.log(pvideo.duration);
                    }
                    pvideo.src = window.URL.createObjectURL(new Blob([buff], {type: mime}))
                    */
                })

            })

        } else {
            //logger(`Skip torrent: ${chunk.hash}`, "red");
        }

        //update information status
        div_speed_download.innerText = prettyBytes(client.downloadSpeed) + "/s";
        div_speed_upload.innerText = prettyBytes(client.uploadSpeed) + "/s";
        div_total_downloaded.innerText = prettyBytes(total_downloaded);
        div_total_uploaded.innerText = prettyBytes(total_uploaded);
    }


    logger(`Active torrents: ${client.torrents.length}`, "goldenrod");

    //clear old torrents
    clearTorrents(MAX_PEERS);

    let total_peers = 0;
    client.torrents.forEach(tor => {
        total_peers += tor.numPeers;
    });

    div_total_peers.innerText = total_peers;
}

stop.onclick = () => {
    console.log("download stopped");
    clearInterval(loader);
    if (mediaSource.readyState == "open") {
        mediaSource.endOfStream();
        console.log(mediaSource.readyState);
    }
    video.pause();
}

function createHTMLpiece(id) {
    let elementId = "piece_" + id;
    let oldElementId = "piece_" + (id - 40);
    
    if(!document.getElementById(elementId)){
        let piece = document.createElement("piece");
        piece.id = elementId;
        piece.className = "red";
        pieces.appendChild(piece);
    }

    let oldElement = document.getElementById(oldElementId);

    if(oldElement){
        oldElement.parentNode.removeChild(oldElement);
    }

    
}

function updateHTMLpiece(id, color) {
    let elementId = "piece_" + id;
    let piece = document.getElementById(elementId);
    piece.className = color;
}
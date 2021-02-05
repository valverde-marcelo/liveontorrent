<?php
try {

    require_once("./server/admin.php");
    
    $token = $_SERVER[QUERY_STRING];

    if (strlen($token) != 19) {
        throw new Exception("Error Processing Request", 1);
    }

    require_once("./server/db/Stream.php");

    $stream = new Stream();

    $result = $stream->get($token);

    $category = $result['category'];
    $description = $result['description'];
    $keywords = $result['keywords'];
    $author = $result['author'];
    $title = $result['title'];

    $timestamp = $result['timestamp'];

    $date = new DateTime();
    $date->setTimestamp($timestamp);
    
    $start = $date->format('Y-m-d H:i:s');

    $xtagged = ($result['xtagged'] == 1)? 'checked': '';
    
    $finished = $result['finished'];

} catch (Exception $e) {
    //TODO: redirect
    return;
}
?>

<!DOCTYPE html>
<html>

<head>
    <title>Live on Torrent - live streams on webtorrents</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="./css/reset.css">
    <link rel="stylesheet" href="./css/styles.css">
</head>

<body>
    <header class="nowrap">
        <div class="item">
            <a href="."><span class="logo"><img src="images/reddot.png" width="15px;" height="15px" />Live On
                    Torrent</span></a>
        </div>
        <div class="item flex-end">
            <div>
                <a href="./seeder.html">
                    <div id="btn-seeder">START TRANSMISSION NOW!</div>
                </a>
            </div>
        </div>
    </header>
    <main>

        <div class="wrapper flex-start">
            <div class="item">
                <section class="broadcast-container">

                    <div id="over" class="over"></div>
                    <div id="ended" class="ended hidden"></div>

                    <video class="video hidden" id="video" playsinline>
                    </video>
                    <div class="broadcast-line-title line-bottom">
                        <div><b>@<?=$author?></b></div>
                        <div> <?=$start?></div>
                    </div>
                    <div class="broadcast-line-title line-bottom">
                        <div><?=$title?></div>
                        <div>
                            <button id="stopbutton">STOP</button>
                            <button id="sharebutton">SHARE</button>
                        </div>

                    </div>
                    <div class="broadcast-line-about">
                        <div>Category: <?=$category?></div>
                        <div>
                            <label class="switch">
                                <input id="x-tagged" type="checkbox" <?=$xtagged?>>
                                <span class="slider round"></span>
                            </label>
                            <label for="x-tagged">X-Tagged Content</label>
                        </div>
                    </div>
                    <div class="broadcast-line-description">
                        <div><?=$description?></div>
                    </div>
                    <div class="broadcast-line-keywords">
                        <div><?=$keywords?></div>
                    </div>
                </section>

            </div>
            <div class="item">
                <section class="right">
                    <div class="donate-button">
                        <form action="https://www.paypal.com/donate" method="post" target="_top">
                            <input type="hidden" name="hosted_button_id" value="9EPBH8XH5CL9S" />
                            <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"
                                border="0" name="submit" title="PayPal - The safer, easier way to pay online!"
                                alt="Donate with PayPal button" />
                        </form>
                    </div>
                    <div class="donate-qrcode">
                        <img alt="QR Code" class="qrcode" src="images/qrcode.png" />
                    </div>
                    <section class="broadcast-description">
                        <div class="hidden" id="finished"><?=$finished?></div>
                        <div>--- Piece status ---</div>
                        <div>Name: <span id="name"></span></div>
                        <div>Progress: <span id="progress"></span></div>
                        <div>Downloaded: <span id="downloaded"></span></div>
                        <div>Speed: <span id="speed"></span></div>
                        <div>Peers: <span id="peers"></span></div>

                        <br />
                        <div>--- General status ---</div>
                        <div>Total Peers: <span id="total_peers"></span></div>
                        <div>DL: <span id="speed_download"></span></div>
                        <div>UL: <span id="speed_upload"></span></div>
                        <div>Total DL: <span id="total_downloaded"></span></div>
                        <div>Total UL: <span id="total_uploaded"></span></div>


                    </section>

                    <section class="pieces">


                    </section>
                </section>

            </div>
        </div>
    </main>
    <footer>
        <div class="item">
            <a href="about.html#donations"><span>Donations</span></a>
        </div>
        <div class="item">
            <a href="about.html#about"><span>About</span></a>
        </div>
        <div class="item">
            <a href="about.html#requisites"><span>Requisites</span></a>
        </div>
        <div class="item">
            <a href="about.html#contact"><span>Constact Us</span></a>
        </div>
        <div class="item">
            <br />
            <span>Copyright © 2020 all rights reserved</span>
        </div>
    </footer>
    <script src="js/webtorrent.min.js"></script>
    <script src="js/common.js"></script>
    <script src="js/peer.js"></script>
    <script>
    </script>
</body>

</html>
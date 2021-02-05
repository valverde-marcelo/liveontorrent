<?php
try {
    require_once("../db/Stream.php");

    $input = json_decode(file_get_contents("php://input"), true);

    /*
    //TODO: validate inputs

    $input['action'] = text
    $input['token'] = text
    $input['category'] = numeric
    $input['author'] = text
    $input['title'] = text
    $input['keywords'] = text
    $input['description'] = text
    $input['x-tagged'] = empty OR 1

    */

    $input['author'] = trim($input['author']);
    $input['title'] = trim($input['title']);
    $input['keywords'] = trim($input['keywords']);
    $input['description'] = trim($input['description']);

    if(strlen($input['token']) != 19) {
        echo "false";
        return;
    }

    if($input['finished']==1){
        $input['finished'] = 1;
    } else {
        $input['finished'] = 0;
    }

    if($input['xtagged']==1){
        $input['xtagged'] = 1;
    } else {
        $input['xtagged'] = 0;
    }

    if($input['author'] == "") {
        $input['author'] = "anonymous";
    }

    if($input['viewers'] != "") {
        $input['viewers'] = intval(trim($input['viewers']));
    } else {
        $input['viewers'] = 0;
    }

    $action = $input['action'];

    $stream = new Stream();

    switch ($action) {
        case 'insert':
            if($stream->insert($input)){
                echo "true";
            } else {
                echo "false";
            }
            break;
        
        case 'xtag':
            if($stream->updateXtag($input) > 0){
                echo "true";
            } else {
                echo "false";
            }
            break;

        case 'update':
            if($stream->update($input) > 0){
                echo "true";
            } else {
                echo "false";
            }
            break;
      
        case 'thumbnail':
            if($stream->updateThumbnail($input) > 0){
                echo "true";
            } else {
                echo "false";
            }
            break;
    }


    return;

} catch (Exception $e) {
    echo "false";
    return;
}



?>
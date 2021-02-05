<?php

try {

    require_once("../db/Magnet.php");

    $input = json_decode(file_get_contents("php://input"), true);

    /*
    //TODO: validate inputs

    $input['token'] = text
    $input['hash'] = text
    $input['name'] = text
    $input['sequence'] = numeric
    */

    $action = $input['action'];

    $magnet = new Magnet();

    if($action === "insert") {

        if($magnet->insert($input)){
            echo "true";
        } else {
            echo "false";
        }

        return;

    } else if ($action === "get") {

        $response = $magnet->getLastByTokenJSON($input['token'], 11);
        
        if(is_string($response)){
            print_r($response);
        } else {
            echo "false";
        }
        
        return;
    }

} catch (Exception $e) {
    echo "false";
    return;
}


?>
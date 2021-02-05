<?php

try {

    require_once("../api/Component.php");

    $input = json_decode(file_get_contents("php://input"), true);

    /*
    //TODO: validate inputs
    $input['category'] = numeric
    */

    if(!is_numeric($input['category'])){
        echo "false";
        return;
    }

    $component = new Component();
    $response = $component->getCatalog($input['category']);

    print_r($response);

    return;

} catch (Exception $e) {
    echo "false";
    return;
}

?>
<?php

require_once("../api/Component.php");

$input = json_decode(file_get_contents("php://input"), true);


$component = new Component();
$response = $component->getCategories();

print_r($response);

?>
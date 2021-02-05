<?php

require_once(__DIR__."/db/Admin.php");

$admin = new Admin();

$admin->updateFinished();

$admin->clearMagnets();

?>
<?php

$method = $_SERVER['REQUEST_METHOD'];

$output = array();

$output['service'] = $_ENV['serviceName'];
$output['version'] = $_ENV['versionNum'];

switch ($method) {
    case 'GET':
        echo json_encode($output);
        break;
}


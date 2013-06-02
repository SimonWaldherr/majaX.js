<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
header('X-Powered-By:0xBADCAB1E');

if(isset($_GET['rd'])) {
  if(is_numeric($_GET['rd'])) {
    $rd = ($_GET['rd']+1);
    if($rd < 5) {
      header("Location: http://cdn.simon.waldherr.eu/projects/majaX/content/server.php?rd=".$rd);
    } else {
      header("Location: http://cdn.simon.waldherr.eu/projects/majaX/content/server.php");
    }
  } else {
    header("Location: http://cdn.simon.waldherr.eu/projects/majaX/content/server.php?rd=1");
  }
  die();
}

$return['get'] = $_GET;
$return['post'] = $_POST;
$return['env']['REQUEST_METHOD'] = $_ENV["REQUEST_METHOD"];
$return['env']['SERVER_PROTOCOL'] = $_ENV["SERVER_PROTOCOL"];
$return['env']['GATEWAY_INTERFACE'] = $_ENV["GATEWAY_INTERFACE"];
$return['env']['REMOTE_ADDR'] = $_ENV["REMOTE_ADDR"];
$return['env']['HTTP_ACCEPT_ENCODING'] = $_ENV["HTTP_ACCEPT_ENCODING"];
$return['env']['HTTP_ACCEPT_LANGUAGE'] = $_ENV["HTTP_ACCEPT_LANGUAGE"];
$return['env']['HTTP_USER_AGENT'] = $_ENV["HTTP_USER_AGENT"];
$return['env']['REDIRECT_STATUS'] = $_ENV["REDIRECT_STATUS"];

header('Content-type: application/json');
echo json_encode($return);

?>
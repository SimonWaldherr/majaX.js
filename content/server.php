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

if(isset($_GET['hc'])) {
  if ($_GET['hc'] == '204') {
    header('HTTP/1.1 204 No Content');
  } elseif($_GET['hc'] == '301') {
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: http://cdn.simon.waldherr.eu/projects/majaX/content/server.php');
  } elseif($_GET['hc'] == '401') {
    header('WWW-Authenticate: Basic realm="The Realm"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'If cancel is pressed this text shows';
    die();
  } elseif($_GET['hc'] == '403') {
    header('HTTP/1.0 403 Forbidden');
    die();
  } elseif($_GET['hc'] == '404') {
    header("HTTP/1.0 404 Not Found");
  } elseif($_GET['hc'] == '502') {
    header('HTTP/1.1 502 Bad Gateway');
  } elseif($_GET['hc'] == '503') {
    header('HTTP/1.1 503 Service Temporarily Unavailable');
    header('Retry-After: 60');
  }
  
  if($_GET['hc'] != '200') {
    ignore_user_abort(true);
    set_time_limit(0);
    header("Connection: close");
    header("Content-Length: 0");
    echo str_repeat("\r\n", 10);
    flush();
    die();
  }
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

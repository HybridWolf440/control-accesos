<?php
function json_response($data, $status=200){
  http_response_code($status);
  echo json_encode($data);
  exit;
}

function require_json(){
  $input = file_get_contents('php://input');
  $data = json_decode($input, true);
  if (!is_array($data)) { json_response(['ok'=>false,'error'=>'Invalid JSON body'], 400); }
  return $data;
}

function ok($data=[]){ json_response(['ok'=>true,'data'=>$data]); }
function fail($msg, $code=400){ json_response(['ok'=>false,'error'=>$msg], $code); }

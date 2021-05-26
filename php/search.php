<?php
$config = parse_ini_file("config.ini", false);

ini_set('display_errors', 1);
$dbs='mysql:'.'host='.$config['DB_HOST'].';'.'dbname='.$config['DB_NAME'].';charset=utf8';
$dbh=new PDO($dbs, $config['DB_USER'], $config['DB_PASSWORD']);
$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$word=$_POST['word'];
$writers=$_POST['writers'];
if (is_null($word)){
    $word='%'.$word.'%';
    $sql="SELECT * FROM tanka WHERE tanka LIKE :word";    
} else {
    $sql="SELECT * FROM tanka";
}
$stmt=$dbh->prepare($sql);
$dbh=null;
//実行
if (is_null($word)){
    $stmt->bindParam(':word', $word, PDO::PARAM_STR);
}
$stmt->execute();
$all = $stmt->fetchAll();

$tankaList = array();
foreach ($all as $value) {
    $tankaList[] = array(
        'author' => $value['author'],
        'work' => $value['work'],
        'first_sentence' => $value['first_sentence'],
        'second_sentence' => $value['second_sentence'],
        'third_sentence' => $value['third_sentence'],
        'forth_sentence' => $value['forth_sentence'],
        'fifth_sentence' => $value['fifth_sentence'],
        'img' => $value['img'],
        'writers' => $writers,
    );
}

// // Content-TypeをJSONに指定する
header('Content-Type: application/json');
echo json_encode($tankaList);
?>
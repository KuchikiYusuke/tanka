<?php
$config = parse_ini_file("config.ini", false);

ini_set('display_errors', 1);
$dbs='mysql:'.'host='.$config['DB_HOST'].';'.'dbname='.$config['DB_NAME'].';charset=utf8';
$dbh=new PDO($dbs, $config['DB_USER'], $config['DB_PASSWORD']);
$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$word=$_POST['word'];
$writer=$_POST['writer'];

// 全取得
if ($word=="" && $writer==""){
    $sql="SELECT * FROM tanka";
    $stmt=$dbh->prepare($sql);
} 
// 単語指定
elseif ($writer=="") {
    $word='%'.$word.'%';
    $sql="SELECT * FROM tanka WHERE tanka LIKE ?";    
    $stmt=$dbh->prepare($sql);
    $stmt->bindValue(1, $word, PDO::PARAM_STR);
} 
// 歌い手指定
elseif ($word=="") {
    $sql="SELECT * FROM tanka WHERE author = ?";    
    $stmt=$dbh->prepare($sql);
    $stmt->bindValue(1, $writer, PDO::PARAM_STR);
}
// 単語指定かつ歌い手指定
else {
    $word='%'.$word.'%';
    $sql="SELECT * FROM tanka WHERE tanka LIKE ? AND author = ?";    
    $stmt=$dbh->prepare($sql);
    $stmt->bindValue(1, $word, PDO::PARAM_STR);
    $stmt->bindValue(2, $writer, PDO::PARAM_STR);
}
$dbh=null;
//実行
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
        // 'writers' => $writers,
    );
}

// // Content-TypeをJSONに指定する
header('Content-Type: application/json');
echo json_encode($tankaList);
?>
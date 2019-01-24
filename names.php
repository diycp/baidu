<?php

$newFiles = array();
$errors = array();

function readDirs($path) {
    global $newFiles, $errors;
    $dir_handle = openDir($path);
    $currDir = realpath($path) . DIRECTORY_SEPARATOR;
    while (false !== $file = readDir($dir_handle)) {
        if ($file == '.' || $file == '..') continue;
        //输出该文件
        if (is_dir($path . '/' . $file)) {
            readDirs($path . '/' . $file);
        } else {
            $currFile = $currDir . $file;
            $pathInfo = pathinfo($currFile);
            $ext = strtolower(trim($pathInfo['extension']));
            if (in_array($ext, array('wxml', 'wxss'))) {
                $newExt = '';
                switch ($ext) {
                    case 'wxml':
                        $newExt = 'swan';
                        break;
                    case 'wxss':
                        $newExt = 'css';
                        break;
                }
                $newFile = $currDir . trim($pathInfo['filename']) . '.' . $newExt;
                if (!rename($currFile, $newFile)) {
                    $errors[] = array(
                        'old' => $currFile,
                        'new' => $newFile,
                    );
                } else {
                    $newFiles[] = $newFile;
                }
            }

            //echo $currFile, PHP_EOL;
        }
    }
    closeDir($dir_handle);
}

readDirs(__DIR__);
print_r($newFiles);
echo PHP_EOL . 'errors' . PHP_EOL;
print_r($errors);
echo PHP_EOL . 'counts' . PHP_EOL;
echo 'newFile count:' . count($newFiles) . PHP_EOL;
echo 'error count:' . count($errors) . PHP_EOL;

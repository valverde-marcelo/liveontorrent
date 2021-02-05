<?php

require_once(__DIR__."/../db/Stream.php");
require_once(__DIR__."/../db/Category.php");

class Component {

    private $stream;

    private $category;

    public function __construct(){
        
    }

    public function getCatalog($category){

        $this->stream = new Stream();

        $data = $this->stream->getLastByCategory($category,50);
        
        $json = json_encode($data, JSON_FORCE_OBJECT);

        return $json;
    }

    public function getCategories(){

        $this->category = new Category();
        
        $data = $this->category->getAll();
        
        $json = json_encode($data, JSON_FORCE_OBJECT);

        return $json;
    }

    

    function __destruct() {
        //$this->db->close();
    } 
}

?>
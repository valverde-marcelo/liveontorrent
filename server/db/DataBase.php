<?php

class DataBase {

    protected $db;

    private $db_file = __DIR__."/magnet.db3";

    public function __construct(){
        $this->db = new SQLite3($this->db_file);
    }

    function __destruct() {
        $this->db->close();
    }
}

?>
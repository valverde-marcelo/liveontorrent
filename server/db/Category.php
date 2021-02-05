<?php

require_once(__DIR__."/DataBase.php");

class Category extends DataBase{

    private $table = "categories";

    public function getAll(){
        
        $results = $this->db->query("SELECT * FROM {$this->table} ORDER BY description ASC");

        //Create array to keep all results
        $data= array();

        // Fetch Associated Array (1 for SQLITE3_ASSOC)
        while ($res= $results->fetchArray(1))
        {
            //insert row into array
            array_push($data, $res);
        }

        return $data;
    }
}

?>
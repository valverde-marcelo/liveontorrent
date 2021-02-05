<?php

require_once(__DIR__."/DataBase.php");

class Magnet extends DataBase{

    private $table = "magnets";

    //TODO: validar entradas
    public function insert($args){
        
        $date = new DateTime();
        
        $token = $args['token'];
        $hash = $args['hash'];
        $name = $args['name'];
        $sequence = $args['sequence'];
        $timestamp = $date->getTimestamp();
    
        $sql = "INSERT INTO {$this->table} (token, hash, name, sequence, timestamp) 
                VALUES ('{$token}', '{$hash}', '{$name}', {$sequence}, {$timestamp})";

        return $this->db->exec($sql);
    }

    public function getLastByToken($token, $n){
        
        $sql = "SELECT hash, sequence FROM {$this->table}
                WHERE token = '{$token}'
                ORDER BY timestamp DESC
                LIMIT {$n}";
        
        $results = $this->db->query($sql);
        
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

    public function getLastByTokenJSON($token, $n){
        
        $data = $this->getLastByToken($token, $n);
        
        $data = array_reverse($data);

        $json = json_encode($data, JSON_FORCE_OBJECT);

        return $json;
    }
}

?>
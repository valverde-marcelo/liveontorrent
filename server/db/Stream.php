<?php

require_once(__DIR__."/DataBase.php");

class Stream extends DataBase{

    private $table = "streams";

    public function insert($args){
        
        $date = new DateTime();
        
        $token = $args['token'];
        $id_category = $args['category'];
        $description = $args['description'];
        $keywords = $args['keywords'];
        $xtagged = $args['xtagged'];
        $author = $args['author'];
        $title = $args['title'];
        $timestamp = $date->getTimestamp();
    
        $sql = "INSERT INTO {$this->table} (token, id_category, description, keywords, xtagged, author, timestamp, lastupdate, title) 
                VALUES ('{$token}', {$id_category}, '{$description}', '{$keywords}', {$xtagged}, '{$author}', {$timestamp}, {$timestamp}, '{$title}')";
      
      
        return $this->db->exec($sql);

    }

    public function update($args){
        
        $date = new DateTime();

        $token = $args['token'];

        $finished = $args['finished'];

        $viewers = $args['viewers'];

        $lastupdate = $date->getTimestamp();

        $sql = "UPDATE {$this->table} SET lastupdate = {$lastupdate}, finished = {$finished}, viewers = {$viewers} WHERE token = '{$token}';";

        if($this->db->exec($sql)) {
            return $this->db->changes();
        }

        return 0;
    }

    public function updateThumbnail($args){

        $token = $args['token'];
        $thumbnail = $args['thumbnail'];

        $sql = "UPDATE {$this->table} SET thumbnail = '{$thumbnail}' WHERE token = '{$token}';";

        if($this->db->exec($sql)) {
            return $this->db->changes();
        }

        return 0;
    }

    public function updateXtag($args){
        
        $token = $args['token'];
        $xtagged = $args['xtagged'];

        $sql = "UPDATE {$this->table} SET xtagged = {$xtagged} WHERE token = '{$token}';";

        if($this->db->exec($sql)) {
            return $this->db->changes();
        }

        return 0;
    }

    public function getAll(){
        
        $results = $this->db->query("SELECT *
                                    FROM {$this->table}
                                    ORDER BY timestamp DESC");

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

    public function getLastByCategory($category, $n){
        
        $where = "";

        if($category != 0) {
            $where = "WHERE id_category = {$category}";
        }

        $sql = "SELECT * FROM {$this->table} $where ORDER BY lastupdate DESC, timestamp DESC LIMIT {$n}";

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

    public function get($token) {

       $sql = "SELECT categories.description AS category,
                        streams.description,
                        streams.keywords,
                        streams.author,
                        streams.title,
                        streams.xtagged,
                        streams.timestamp,
                        streams.finished
                FROM {$this->table}, categories 
                WHERE token = '{$token}' AND streams.id_category = categories.id";
        
        $results = $this->db->query($sql);

        //Create array to keep all results
        $data= array();

        // Fetch Associated Array (1 for SQLITE3_ASSOC)
        while ($res= $results->fetchArray(1))
        {
            //insert row into array
            array_push($data, $res);
        }

        if (is_array($data) && count($data) == 1) {
            return $data[0];
        } else {
            return false;
        }
    }

}

?>
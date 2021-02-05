<?php

require_once(__DIR__."/DataBase.php");

class Admin extends DataBase{

    //private $table = "magnets";

    public function updateFinished(){
        
        $date = new DateTime();
        $now = $date->getTimestamp();

        $minutes = 5;
        $limit = $now - ($minutes * 60);
        
        $sql = "UPDATE streams SET finished = 1 WHERE finished = 0 AND lastupdate < {$limit};";

        if($this->db->exec($sql)) {
            return $this->db->changes();
        }

        return 0;
    }

    public function clearMagnets(){

        $date = new DateTime();
        $now = $date->getTimestamp();

        $minutes = 5;
        $limit = $now - ($minutes * 60);

        $sql = "DELETE FROM magnets WHERE token in 
                        (SELECT token FROM streams WHERE finished = 1 AND lastupdate < {$limit})";

        
        if($this->db->exec($sql)) {
            return $this->db->changes();
        }

        return 0;                
    }
    

    public function clearAll(){

        $sql = "DELETE FROM streams";

        $sql2 = "DELETE FROM magnets";
 
        if($this->db->exec($sql)) {
            if($this->db->changes()>0) {
                if($this->db->exec($sql2)) {
                    return $this->db->changes();
                }
            }
        }

        return 0;                
    }
}

?>
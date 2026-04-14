const express = require('express');
const mariadb = require('mariadb');
const dotenv = require("dotenv");
const app = express();
app.use(express.json());

dotenv.config();

// Create a MariaDB connection pool
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    //port: process.env.DB_PORT, //TODO
    connectionLimit: 500 // TBC
});

/**
 * getDeck: Send an array of tuple (WordId1, WordId_2, Status) starting from the lowest score to the higher
 * a word can be present only once in the array meaning the WordId_1 and WordId_2 are unique in the returned array
 * TODO check if in case of duplicated wordId_x if we can take higher score and not always the smallest
 * TODO handle if array returned is smaller
 * @data {number} nb_words - The number of tuple to be returned.
 * @returns {object} The array of tuples
 */
//TODO
app.post('/getDeck', async (req, res) => {
    const { nb_words } = req.body;
    var ret = [];
    reqSQL = 'SELECT WordId_1, WordId_2, Status FROM Stats WHERE Status = true AND WordId_2 >= 196608 LIMIT 50 ORDER BY Score_1*0.5 + Score_2*0.3 + Score_3*0.2'; // TODO reverse mode
    reqSQL = 'SELECT WordId_1, WordId_2, Status FROM Stats WHERE Status = true AND WordId_2 >= 196608 LIMIT 50 ORDER BY Score_1'; // TODO reverse mode
    reqSQL = 'SELECT WordId_1, WordId_2, Status FROM Stats WHERE Status = true AND WordId_2 >= 196608 LIMIT 50'; // TODO reverse mode
    reqSQL = 'SELECT WordId_1, WordId_2, Status FROM Stats ORDER BY Score_1*0.5 + Score_2*0.3 + Score_3*0.2'; // TODO reverse mode
    //reqSQL = 'SELECT WordId_1, WordId_2, Status, Score_1, Score_2, Score_3 FROM Stats ORDER BY Score_1*0.5 + Score_2*0.3 + Score_3*0.2 ASC'; // TODO reverse mode

    if(!nb_words)
        return res.status(400).json({ error: "Missing nb_words" });

    let conn;
    try{
        conn = await pool.getConnection();

        const rows = await conn.query(reqSQL, [50, offset*20]); // TODO fix 20

        // MariaDB adds an extra meta row; remove if needed
        const result = rows[0] || null;

  w1ID_set = new Set();
  w2ID_set = new Set();
  for(let i=0;i<rows.length;++i){
    let w1ID = rows[i]['WordId_1'];
    let w2ID = rows[i]['WordId_2'];
    if(w1ID_set.has(w1ID))
      continue;
    if(w2ID_set.has(w2ID))
      continue;
    w1ID_set.add(w1ID);
    w2ID_set.add(w2ID);
    console.log([w1ID, w2ID, rows[i]['Status']]);
    ret.push([w1ID, w2ID, rows[i]['Status']]);
    //ret.push([w1ID, w2ID, rows[i]['Status'], rows[i]['Score_1'], rows[i]['Score_2'], rows[i]['Score_3']]);
    if(ret.length==nb_words)
      break;
  }
  res.json({ Words: ret});

    }catch(err){
        console.error("Database error:", err);
        res.status(500).json({ error: "Database query failed" });
    }finally{
        if(conn)
            conn.end();
    }
});


/**
 * words: Send an array of tuple (WordId1, WordId_2, Status)
 * @data {number} nb_words - The number of tuple to be returned.
 * @data {number} offset - The number of entry to skip is offset*nb_words.
 * @data {string} sort_on_status - filter applied on the field Status (optional)
 *      '' : all <= by default
 *      'active': only the active
 *      'inactive': only the inactive
 * @returns {object} The array of tuples
 */
app.post('/words', async (req, res) => {
    const { nb_words, sort_on_status, offset} = req.body;
    var ret = [];
    reqFilter = "";
    if(sort_on_status == "active")
        reqFilter = "AND status = 1";
    else if(sort_on_status == "inactive")
        reqFilter = "AND status = 0";

    reqSQL = 'SELECT WordId_1, WordId_2, Status, Score_1, Score_2, Score_3 FROM Stats WHERE WordId_2 >= 196608 ' + reqFilter + ' LIMIT ? OFFSET ?';

    if(!nb_words)
        return res.status(400).json({ error: "Missing nb_words" });
    if(!offset)
        return res.status(400).json({ error: "Missing offset" });

    let conn;
    try{
        conn = await pool.getConnection();

        const rows = await conn.query(reqSQL, [50, offset*20]); // TODO fix 20

        // MariaDB adds an extra meta row; remove if needed
        const result = rows[0] || null;

        for(let i=0;i<rows.length;++i){
            ret.push([rows[i]['WordId_1'], rows[i]['WordId_2'], rows[i]['Status']]); //, rows[i]['Score_1'], rows[i]['Score_2'], rows[i]['Score_3']]);
        }
        res.json({ Words: ret});

    }catch(err){
        console.error("Database error:", err);
        res.status(500).json({ error: "Database query failed" });
    }finally{
        if(conn)
            conn.end();
    }
});

// Start the server
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});

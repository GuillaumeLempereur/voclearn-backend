const express = require('express');
const cors = require('cors');
const credential = require('./credential.json');
const mysql = require('mysql2');
const mysql2 = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection(credential);

connection.connect();

/**
 * getDeck: Send an array of tuple (WordId1, WordId_2, Status) starting from the lowest score to the higher
 * a word can be present only once in the array meaning the WordId_1 and WordId_2 are unique in the returned array
 * TODO check if in case of duplicated wordId_x if we can take higher score and not always the smallest
 * TODO handle if array returned is smaller
 * @data {number} nb_words - The number of tuple to be returned.
 * @returns {object} The array of tuples
 */
app.post('/getDeck', (req, res) => {
    const { nb_words } = req.body;
    var ret = [];
    reqSQL = 'SELECT WordId_1, WordId_2, Status FROM Stats WHERE Status = true AND WordId_2 >= 196608 LIMIT 50 ORDER BY Score_1*0.5 + Score_2*0.3 + Score_3*0.2'; // TODO reverse mode
    reqSQL = 'SELECT WordId_1, WordId_2, Status FROM Stats WHERE Status = true AND WordId_2 >= 196608 LIMIT 50 ORDER BY Score_1'; // TODO reverse mode
    reqSQL = 'SELECT WordId_1, WordId_2, Status FROM Stats WHERE Status = true AND WordId_2 >= 196608 LIMIT 50'; // TODO reverse mode
    reqSQL = 'SELECT WordId_1, WordId_2, Status FROM Stats ORDER BY Score_1*0.5 + Score_2*0.3 + Score_3*0.2'; // TODO reverse mode
    //reqSQL = 'SELECT WordId_1, WordId_2, Status, Score_1, Score_2, Score_3 FROM Stats ORDER BY Score_1*0.5 + Score_2*0.3 + Score_3*0.2 ASC'; // TODO reverse mode
connection.query(reqSQL, function(err, rows, fields){
  console.log('Connection result error '+err);
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
});
});

/**
 * words: Send an array of tuple (WordId1, WordId_2, Status)
 * @data {number} nb_words - The number of tuple to be returned.
 * @data {number} offset - The number of entry to skip is offset*nb_words.
 * @data {string} sort_on_status - filter applied on the field Status
 *      '' : all
 *      'active': only the active
 *      'inactive': only the inactive
 * @returns {object} The array of tuples
 */
app.post('/words', (req, res) => {
  const { nb_words, sort_on_status, offset} = req.body;
  var ret = [];
  if(sort_on_status == "")
    reqSQL = 'SELECT WordId_1, WordId_2, Status, Score_1, Score_2, Score_3 FROM Stats WHERE WordId_2 >= 196608 LIMIT 50 OFFSET '+ offset*20;
  else if(sort_on_status == "active")
    reqSQL = "SELECT WordId_1, WordId_2, Status , Score_1, Score_2, Score_3 FROM Stats WHERE WordId_2 >= 196608 AND status = 1 LIMIT 50 OFFSET "+ offset*20;
  else if(sort_on_status == "inactive")
    reqSQL = "SELECT WordId_1, WordId_2, Status , Score_1, Score_2, Score_3 FROM Stats WHERE WordId_2 >= 196608 AND status = 0 LIMIT 50 OFFSET "+ offset*20;
  console.log(req);
  connection.query(reqSQL, function(err, rows, fields){
    console.log('Connection result error '+err);
    for(let i=0;i<rows.length;++i){
      ret.push([rows[i]['WordId_1'], rows[i]['WordId_2'], rows[i]['Status']]); //, rows[i]['Score_1'], rows[i]['Score_2'], rows[i]['Score_3']]);
    }
    res.json({ Words: ret});
  });
});

app.post('/status', (req, res) => {
  const { wStat } = req.body;
var ret = [];
connection.query('UPDATE Stats SET Status = !Status WHERE WordId_1 = ' + wStat[0] + ' AND WordId_2 = ' + wStat[1], function(err, rows, fields){
  console.log('Connection result error '+err);
  connection.query('Select Status FROM Stats WHERE WordId_1 = ' + wStat[0] + ' AND WordId_2 = ' + wStat[1], function(err, rows, fields){
  res.json((rows[0].Status == true));
  });
});
});

async function updateStat(reqSQL, wordsStats){
  const conn2 = await mysql2.createConnection({
    host: 'localhost',
    user: 'vlearn',
    password: 'mnltyu',
    database: 'VocLearn'
  })
  const scores = { TP: 1.0, TN: 0.2, FP: 0.0, FN: 0.0 };
  console.log("conn2");
  console.log(conn2);
  const statement = await conn2.prepare(reqSQL);

  try {
    const tasks = wordsStats.map((row, i) => {
      const label = row[3];
      const score = scores[label];
      if (typeof score !== "number") {
        throw new Error(`Unknown label '${label}' at index ${i}`);
      }
      const WordId_1 = row[0];
      const WordId_2 = row[1];

      return statement.execute([score, score, WordId_1, WordId_2])
        .then(() => {
          console.log(`Updated pair (${WordId_1}, ${WordId_2}) with score ${score}`);
        });
    });

    await Promise.all(tasks);
  } catch (error) {
    throw error;
  } finally {
    try {
      await statement.close();
    } catch (closeErr) {
      console.warn("Failed to close prepared statement:", closeErr?.message || closeErr);
    }
  }
}

app.post('/updateStat', (req, res) => {
    const { wordsStats, reverseMode } = req.body;
    var ret = [];

  // TODO: set halflife max
//console.log();
    let reqSQL = '';
    if(reverseMode)
        reqSQL = 'UPDATE Stats SET ScoreInv_3 = ScoreInv_2, ScoreInv_2 = ScoreInv_1, ScoreInv_1 = ?, Date = NOW(), HalfLife = CASE WHEN ? > 0 AND HalfLife < 100 THEN HalfLife+1 ELSE HalfLife END WHERE UserId = 0 AND WordId_1 = ? AND WordId_2 = ?'
    else
        reqSQL = 'UPDATE Stats SET Score_3 = Score_2, Score_2 = Score_1, Score_1 = ?, Date = NOW(), HalfLife = CASE WHEN ? > 0 AND HalfLife < 100 THEN HalfLife+1 ELSE HalfLife END WHERE UserId = 0 AND WordId_1 = ? AND WordId_2 = ?'

  res.json(updateStat(reqSQL, wordsStats));
});


app.listen(5000, () => {
  console.log('Backend running');
});
/*
connection.query('SELECT * FROM Words LIMIT 20', function(err, rows, fields){
  //response.end()
  console.log('Connection result error '+err);
  console.log('nb recs '+rows.length);
  for(let i=0;i<rows.length;++i){
    console.log(rows[i]);
    //for(field in fields)
    //  console.log(rows[i][field]);
  }
    console.log(fields);
});
*/

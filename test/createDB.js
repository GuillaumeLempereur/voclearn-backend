/*
 *  Populate the DB Voclearn from Words.json and Translations.json
 *
 * */
const express = require('express');
const cors = require('cors');
const credential = require('../credential.json');
//const mysql = require('mysql2');
const mysql2 = require('mysql2/promise');

const Words = require('./Words.json');
const Translations = require('./Translations.json');
const Stats = require('./Stats.json');

/*
const app = express();
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection(credential);
connection.connect();
*/
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
console.log("done");
});
*/

// Insert Words
(async () => {
    const conn = await mysql2.createConnection(credential);

    const rows = Words.map(word => [word[1], word[0], Math.floor(word[1]/65536), 0, ""]);

    try{
        await conn.beginTransaction();
        const sql = `
            INSERT INTO Words (Id, Word, LanguageId, Gender, Article)
            VALUES ?
            ON DUPLICATE KEY UPDATE
            Id = VALUES(Id),
            Word = VALUES(Word),
            LanguageId = VALUES(LanguageId),
            Gender = VALUES(Gender),
            Article = VALUES(Article)
            `;

        const [res] = await conn.query(sql, [rows]);
        // affectedRows counts inserted + updated*2 in some MySQL modes; rely on warnings/info if needed
        console.log('affectedRows:', res.affectedRows);

        await conn.commit();
    }catch(e){
        await conn.rollback();
        throw e;
    }finally{
        await conn.end();
    }
})();

// Insert Stats
(async () => {
    const conn = await mysql2.createConnection(credential);

    const rows = Stats;

    try{
        await conn.beginTransaction();
        const sql = `
            INSERT INTO Stats (User, WordId_1, WordId_2, Score_1, Score_2, Score_3, Score_inv_1, Score_inv_2, Score_inv_3, Date, HalfLife, Status)
            VALUES ?
            ON DUPLICATE KEY UPDATE
            User = VALUES(User),
            WordId_1 = VALUES(WordId_1),
            WordId_2 = VALUES(WordId_2),
            Score_1 = VALUES(Score_1),
            Score_2 = VALUES(Score_2),
            Score_3 = VALUES(Score_3),
            Score_inv_1 = VALUES(Score_inv_1),
            Score_inv_2 = VALUES(Score_inv_2),
            Score_inv_3 = VALUES(Score_inv_3),
            Date = VALUES(Date),
            HalfLife = VALUES(HalfLife),
            Status = VALUES(Status)
            `;

        const [res] = await conn.query(sql, [rows]);
        // affectedRows counts inserted + updated*2 in some MySQL modes; rely on warnings/info if needed
        console.log('affectedRows:', res.affectedRows);

        await conn.commit();
    }catch(e){
        await conn.rollback();
        throw e;
    }finally{
        await conn.end();
    }
})();


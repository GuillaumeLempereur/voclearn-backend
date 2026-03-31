/*
 *  Populate the DB Voclearn from Words.json and Translations.json
 *  Optionally populate Stats from Stats.json (TODO)
 *
 * */
const express = require('express');
const cors = require('cors');
const credential = require('../credential.json');
const mysql2 = require('mysql2/promise');

const Words = require('./Words.json');
const Translations = require('./Translations.json');
//const Stats = require('./Stats.json'); // TODO

// Insert Words
(async () => {
    const conn = await mysql2.createConnection(credential);

    const rows = Object.keys(Words).map(wordId => [wordId, Words[wordId][1], Words[wordId][0], Words[wordId][2], Words[wordId][3]]);

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

/* Insert Stats
 * 50 Stats are active, with the word appearing only once, so in the 50 tuple WordId_1 and WordId_2 appears only once
 * The scores and half-life are set to 0.
 * User to 0 TODO
 */

(async () => {
    const conn = await mysql2.createConnection(credential);

    let rows = [];
    let nbStatActive = 0;
    w1ID_set = new Set();
    w2ID_set = new Set();
    for(WordId_1 in Translations){
        for(WordId_2 in Translations[WordId_1]){
            if(!w1ID_set.has(WordId_1) && !w2ID_set.has(WordId_2) && nbStatActive < 50){// Both word not yet present then add if not yet 50 Stats active
                w1ID_set.add(WordId_1);
                w2ID_set.add(WordId_2);
                rows.push([0, WordId_1, WordId_2, 0, 0, 0, 0, 0, 0, Date.now(), 0, 1]);
                nbStatActive++;
            }else
                rows.push([0, WordId_1, WordId_2, 0, 0, 0, 0, 0, 0, Date.now(), 0, 0]);
        }
    }

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

/* TODO Translations
 * {"65536":{"131072":["","","","sa-ram"],"196677":["being; human; man; person;","","",""],"196684":["body; person;","","",""],"196740":["expression; image; person; reflection; role;    ","","",""],"200228":["character; figure; person; personality;","","",""],"200319":["figure; individual; person; personality;","","",""],"200747":["","","",""],"200841":["appearan    ce; person;","","",""]},"65537":{"131073":["","","","nam-ja"],"196677":["being; human; m
 *
 * WordId_1 int, WordId_2 int, LangId_1 TINYINT, LangId_2 TINYINT, Explanation_1 VARCHAR(128), Explanation_2 VARCHAR(128), Transliteration_1 VARCHAR(32), Tr    ansliteration_2 VARCHAR(32), PRIMARY KEY(WordId_1, WordId_2)
 */

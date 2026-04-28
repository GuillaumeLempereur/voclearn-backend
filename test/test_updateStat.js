// Test of the POST request updateStat
const mariadb = require('mariadb');
const dotenv = require("dotenv");

dotenv.config();
// URL of your local server
const url = "http://localhost:5000/updateStat";

// Create a MariaDB connection pool
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    //database: process.env.DB_DATABASE,
    database: "VocLearn_test",
    //port: process.env.DB_PORT, //TODO
    connectionLimit: 500 // TBC
});

// Data you want to send
const data = {
    wordsStats: [
        [ 65564, 196925, "FP" ],
        [ 65555, 197893, "FP" ],
        [ 65568, 198765, "FN" ],
        [ 65571, 201124, "TN" ],
        [ 65551, 198664, "TN" ],
        [ 65554, 196959, "TN" ],
        [ 65553, 196688, "TN" ],
        [ 65567, 200154, "TN" ],
        [ 65557, 198300, "TP" ],
        [ 65565, 197342, "TP" ],
        [ 65575, 197984, "TP" ],
        [ 65563, 197126, "TP" ]],
    reverseMode: false
};

function equal(a, b){
    return JSON.stringify(a) === JSON.stringify(b);
}

async function sendPost() {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        console.log(result);

        (async () => {
            var ret = [];

            reqSQL = 'SELECT WordId_1, WordId_2, Score_1, Score_2, Score_3 FROM Stats WHERE WordId_1 = ? AND WordId_2 = ?';

            let conn;
            try{
                conn = await pool.getConnection();

                for(let i=0;i<10;++i){
                    const rows = await conn.query(reqSQL, [wordsStats[i][0], wordsStats[i][1]]);

                    // MariaDB adds an extra meta row; remove if needed
                    const result = rows[0] || null;

                    if(len(result) == 1){
                        ret.push([rows[i]['WordId_1'], rows[i]['WordId_2'], rows[i]['Score_1'], rows[i]['Score_2'], rows[i]['Score_3']]);
                    }else
                        console.log("prob");
                    //res.json({ Words: ret});
                }
            }catch(err){
                console.error("Database error:", err);
            }finally{
                if(conn)
                    conn.end();
            }
        })();

        if(equal(expectedResult, Words))
            console.log("pass");
        else{
            console.log("fail");
            console.log("Expected:");
            console.log(expectedResult)
            console.log("Got:")
            console.log(Words)
        }

    }catch(error){
        console.error("Error during POST:", error);
    }
}

sendPost();

// post.js

// URL of your local server
const url = "http://localhost:5000/getDeck";

// Data you want to send
const data = {
    nb_words: 20
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
        const Words = result["Words"];
        /*
        for(word of Words){
            let score = word[3]*0.5 + word[4]*0.3 + word[5]*0.2
            console.log(score);
        }*/

        expectedResult = [
            [ 65564, 196925, 1 ],
            [ 65539, 201344, 0 ],
            [ 65555, 197893, 1 ],
            [ 65541, 197100, 0 ],
            [ 65547, 196630, 0 ],
            [ 65538, 201094, 0 ],
            [ 65568, 198765, 1 ],
            [ 65537, 200975, 0 ],
            [ 65543, 197272, 0 ],
            [ 65571, 201124, 1 ],
            [ 65551, 198664, 1 ],
            [ 65562, 197936, 0 ],
            [ 65554, 196959, 1 ],
            [ 65553, 196688, 1 ],
            [ 65542, 198589, 0 ],
            [ 65567, 200154, 1 ],
            [ 65548, 196745, 0 ],
            [ 65557, 198300, 1 ],
            [ 65565, 197342, 1 ],
            [ 65575, 197984, 1 ]];

        if(equal(expectedResult, Words))
            console.log("pass");
        else{
            console.log("fail");
            console.log("Expected:");
            console.log(expectedResult)
            console.log("Got:")
            console.log(Words)
        }


    } catch (error) {
        console.error("Error during POST:", error);
    }
}

sendPost();

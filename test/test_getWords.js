// post.js

// URL of your local server
const url = "http://localhost:5000/words";

// Data you want to send
const data = {
    nb_words: 20,
    sort_on_status: "",
    offset: 1
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

        expectedResult = [
            [65543, 197041, 0],
            [65543, 197272, 0],
            [65543, 201200, 1],
            [65543, 201671, 0],
            [65547, 196630, 0],
            [65547, 196798, 1],
            [65547, 199846, 1],
            [65547, 200983, 0],
            [65548, 196721, 1],
            [65548, 196745, 0],
            [65548, 196981, 0],
            [65548, 198170, 0],
            [65548, 199794, 1],
            [65548, 200002, 0],
            [65548, 200003, 1],
            [65548, 200678, 0],
            [65550, 196721, 0],
            [65550, 196981, 1],
            [65551, 197601, 0],
            [65551, 197821, 0]
        ];
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

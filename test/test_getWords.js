// post.js

// URL of your local server
const url = "http://localhost:5000/words";

// Data you want to send
const data = {
    nb_words: 50,
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
  [ 65543, 197041, 0 ], [ 65543, 197272, 0 ], [ 65543, 201200, 0 ],
  [ 65543, 201671, 0 ], [ 65547, 196630, 0 ], [ 65547, 196798, 0 ],
  [ 65547, 199846, 0 ], [ 65547, 200983, 0 ], [ 65548, 196721, 0 ],
  [ 65548, 196745, 0 ], [ 65548, 196981, 0 ], [ 65548, 198170, 0 ],
  [ 65548, 199794, 0 ], [ 65548, 200002, 0 ], [ 65548, 200003, 0 ],
  [ 65548, 200678, 0 ], [ 65550, 196721, 0 ], [ 65550, 196981, 0 ],
  [ 65551, 197601, 0 ], [ 65551, 197821, 0 ], [ 65551, 198664, 1 ],
  [ 65553, 196688, 1 ], [ 65554, 196959, 1 ], [ 65555, 196669, 1 ],
  [ 65555, 197892, 1 ], [ 65555, 197893, 1 ], [ 65555, 197894, 1 ],
  [ 65555, 200288, 1 ], [ 65555, 200289, 1 ], [ 65557, 198253, 1 ],
  [ 65557, 198300, 1 ], [ 65557, 198990, 1 ], [ 65557, 199290, 0 ],
  [ 65557, 201232, 0 ], [ 65557, 201439, 0 ], [ 65562, 196685, 0 ],
  [ 65562, 197314, 0 ], [ 65562, 197315, 0 ], [ 65562, 197936, 0 ],
  [ 65562, 199279, 0 ], [ 65563, 197126, 1 ], [ 65563, 197659, 1 ],
  [ 65563, 198725, 1 ], [ 65563, 199760, 1 ], [ 65564, 196925, 1 ],
  [ 65564, 201263, 1 ], [ 65564, 201264, 1 ], [ 65564, 201470, 1 ],
  [ 65565, 197342, 1 ], [ 65565, 200867, 1 ]
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

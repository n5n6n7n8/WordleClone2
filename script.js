import {Fiveletterwords} from "https://dl.dropbox.com/scl/fi/c4zs697uhqioskoq1lhhc/fiveletterwords.js?rlkey=l6t52fom0yqsypnyt4ok0prd8&st=lnmmei7s&dl=0";
let d = new Date();
let t = d.getTime();
let days = Math.floor(t / (3600000)) - 8; //get in hour time change from utc to pacific
days = Math.floor(days/24);//Oct 22 24: 20019 //divide for days
days -= 20089; //Represents days since Jan 1 2025. Used to distinguish time

const numberOfGuesses = 6; // The number of guesses the player gets
let rightGuessString = "DUCKS";
let additionalMessage = "Tis is a placeholder message! Lets goooo oregon ducks rahhh lets scko sko sko fight ducks fight win fight go shoud shout!!!!"; // This is for linking to articles that may relate to the answer
let additionalLink = "https://communications.uoregon.edu/uo-brand/visual-identity/fonts#text-styles"; // This is the link to the article
console.log("days = " + days);

//I tried to change the default "Private: Waddle" text header to the logo designed by the team, however the code wasn't able to fetch the header
// let mainHeader = document.getElementsByTagName('h1')[0]; 
// mainHeader.textContent = "";
// const WaddleLogoImg = document.createElement('img');
// WaddleLogoImg.src = "https://dl.dropbox.com/scl/fi/fnvbsogx6p17v4mfinhpy/TheWaddle_Logo-08.jpg?rlkey=u5a5ifhzey46v9w4e1zjxjom0&st=444i3ow6&dl=0";
// mainHeader.appendChild(WaddleLogoImg);

//Handles all spreadsheet importing words
const sheetId = "1M2FLT7xmoaDcnTI5_hrYnzw5-IXXJoE8H-MK6fDXvWA";
const sheetName = encodeURIComponent("WaddleDataSheet");
const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

fetch(sheetURL)
  .then((response) => response.text())
  .then((csvText) => handleResponse(csvText));

function handleResponse(csvText) {
  let sheetObjects = csvToObjects(csvText);
  // sheetObjects is now an Array of Objects
  console.log("Name of object: " + sheetObjects[days]); 
  rightGuessString = sheetObjects[days]["WORD"].toLowerCase();
  additionalLink = sheetObjects[days]["LINK"];
  additionalMessage = sheetObjects[days]["TITLE"];
 
}
function csvToObjects(csv) {
    const csvRows = csv.split("\n");
    const propertyNames = csvSplit(csvRows[0]);
    let objects = [];
    for (let i = 1, max = csvRows.length; i < max; i++) {
      let thisObject = {};
      let row = csvSplit(csvRows[i]);
      for (let j = 0, max = row.length; j < max; j++) {
        thisObject[propertyNames[j]] = row[j];
        // BELOW 4 LINES WILL CONVERT DATES IN THE "ENROLLED" COLUMN TO JS DATE OBJECTS
        // if (propertyNames[j] === "Enrolled") {
        //   thisObject[propertyNames[j]] = new Date(row[j]);
        // } else {
        //   thisObject[propertyNames[j]] = row[j];
        // }
      }
      objects.push(thisObject);
    }
    return objects;
  }
  
  function csvSplit(row) {
    return row.split(",").map((val) => val.substring(1, val.length - 1));
  }

//Sets up the win/lose screen
setTimeout(() => { 
    let gameoverinfo = document.getElementById("gameOverInfo");
    gameoverinfo.textContent = "Answer: " + rightGuessString.toUpperCase() + " ";
    if(additionalLink !== "" && additionalMessage !== ""){
    let addLink = document.getElementById("gameOverLink");
    addLink.textContent = additionalMessage;
    addLink.href = additionalLink} 
}, 1000); //Timeout solves bug where data in google sheets would load in before the placeholder message


let WORD_LENGTH = rightGuessString.length;
let guessesRemaining = numberOfGuesses;
let currentGuess = [];
let nextLetter = 0;

let resultsString = ""; //copy results string
let isClear = false; //is the game finished

let modal2 = document.getElementById("myModal"); //getting variables for popup window
let gameboard = document.getElementById("game-board");

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < numberOfGuesses; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"

        for (let j = 0; j < WORD_LENGTH; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}

initBoard()
document.addEventListener("keyup", (e) => {

    if (guessesRemaining === 0) {
        return
    }

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        checkGuess()
        return
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return;
    } else {
        insertLetter(pressedKey)
    }
})
function insertLetter (pressedKey) {
    if (nextLetter === WORD_LENGTH) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    let row = document.getElementsByClassName("letter-row")[numberOfGuesses - guessesRemaining]
    let box = row.children[nextLetter]
    box.textContent = pressedKey
    box.classList.add("filled-box")
    currentGuess.push(pressedKey)
    nextLetter += 1
}
function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[numberOfGuesses - guessesRemaining]
    let box = row.children[nextLetter - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    currentGuess.pop()
    nextLetter -= 1
}
function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[numberOfGuesses - guessesRemaining]
    let guessString = ''
    let rightGuess = Array.from(rightGuessString)

    for (const val of currentGuess) {
        guessString += val;
    }
    if(guessString.length === 0){
        return
    }
    else if (guessString.length !== WORD_LENGTH) {
        toastr.error("Not enough letters!")
        return
    }
    if (!Fiveletterwords.includes(guessString)) {
        toastr.error("Word not in list!")
        return
    }

    /*for (let index = 0; i < WORD_LENGTH; i++){ //VERSION 2 ITERATION W/O ENHANCED FOR
        let box = row.children[index];
        let letter = currentGuess[index];
        let delay = 200 * index;
        setTimeout(()=> {
            //check!
            if(toColor[index]===0){ //COLOR GRAY
                box.style.backgroundColor = "rgb(136, 134, 134)";
                box.style.animationName = "tileturngy";
                resultsString += "⬜";
                shadeKeyBoard(letter, "rgb(136, 134, 134)");
            }
            else if(toColor[index]===1){ //COLOR YRLLOW
                box.style.backgroundColor = "rgb(229, 237, 62)";
                box.style.animationName = "tileturnyel";
                resultsString += "🟨";
                shadeKeyBoard(letter, "rgb(229, 237, 62)");

            }
            else{
                box.style.backgroundColor = 'rgb(90, 163, 46)';
                box.style.animationName = "tileturngn";
                resultsString += "🟩";
                shadeKeyBoard(letter, 'rgb(90, 163, 46)');
            }
            

        }, delay)
    }/*
    /*row.children.forEach((element,index) => { //VERSION 1 ITERATION
        let delay = 200 * index
        setTimeout(()=> {
            //check!
            if(toColor[index]===0){ //COLOR GRAY
                element.style.backgroundColor = "rgb(136, 134, 134)";
                element.style.animationName = "tileturngy";
                resultsString += "⬜";
                shadeKeyBoard(realCur[index], "rgb(136, 134, 134)");
            }
            else if(toColor[index]===1){ //COLOR YRLLOW
                element.style.backgroundColor = "rgb(229, 237, 62)";
                element.style.animationName = "tileturnyel";
                resultsString += "🟨";
                shadeKeyBoard(realCur[index], "rgb(229, 237, 62)");

            }
            else{
                element.style.backgroundColor = 'rgb(90, 163, 46)';
                element.style.animationName = "tileturngn";
                resultsString += "🟩";
                shadeKeyBoard(realCur[index], 'rgb(90, 163, 46)');
            }
            

        }, delay)
    });
    resultsString += "\n";*/


    for (let i = 0; i < WORD_LENGTH; i++) { //ice but when I TYPE A LETTER IT TYPESE THE LETTER I PUTON THE KEYBOAARD     
        let letterColor = ''
        let box = row.children[i]
        let letter = currentGuess[i]
        let animName = "";
        
        let letterPosition = rightGuess.indexOf(currentGuess[i])
        // is letter in the correct guess
        

        if (letterPosition === -1) {
            letterColor = "rgb(136, 134, 134)";
            animName = "tileturngy";
            resultsString += "⬜";
            rightGuess[letterPosition] = "#"
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position
            if (currentGuess[i] === rightGuess[i]) {
                // shade green
                letterColor = 'rgb(90, 163, 46)';
                animName = "tileturngn";
                resultsString += "🟩"; //
                rightGuess[letterPosition] = "#"
            } else { //if the letter that appears later is in the right place, 
                let nextIndex = rightGuess.slice(i+1).indexOf(currentGuess[i]);
                if(currentGuess[nextIndex+i+1]===rightGuess[nextIndex+i+1]){
                    //shade gray, because the one later is right
                    letterColor = "rgb(136, 134, 134)";
                    animName = "tileturngy";
                    resultsString += "⬜";
                }else{
                // shade box yellow
                letterColor = "rgb(229, 237, 62)";
                animName = "tileturnyel";
                resultsString += "🟨";
                rightGuess[letterPosition] = "#"
                }

            }
        }

        let delay = 200 * i
        setTimeout(()=> {
            //shade box
            box.style.backgroundColor = letterColor;
            box.style.animationName = animName;
            shadeKeyBoard(letter, letterColor);

        }, delay)
    }
    resultsString += "\n";

    ///CHECK OTHER BACKEND
    if (guessString === rightGuessString) { //GAME END
        toastr.success("You guessed right! Game over!")
        guessesRemaining = 0
        setTimeout(()=> {modal2.style.display = "block";
            isClear = true;}, 2000);

        return;
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            toastr.error("You've run out of guesses! Game over!");
            toastr.info(`The right word was: "${rightGuessString}"`);
            setTimeout(()=> {modal2.style.display = "block";
                isClear = true;}, 2000);
            document.getElementById("gameOverMessage").innerText = "Next time!";

        }
    }
}
function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === 'rgb(90, 163, 46)') {
                return
            }

            if (oldColor === "rgb(229, 237, 62)" && color !== 'rgb(90, 163, 46)') {
                return
            }

            elem.style.backgroundColor = color
            elem.style.
            break
        }
    }
}

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target;

    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent;

    if (key === "Del") {
        key = "Backspace"
    }

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})
document.getElementById("resultsbutton").addEventListener("click", (e) => {

    navigator.clipboard.writeText("🦆Waddle Results🦆\n" + resultsString);
    toastr.success("Copied to clipboard!");
})


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target === modal2) {
        modal2.style.display = "none";
    }
}
//when the user clicks on gameboarf after game, pop up
gameboard.onmouseover = function() {
    if(isClear) {
        gameboard.style.cursor = "pointer";
    }
}
gameboard.onclick = function() {
    if(isClear) {
        modal2.style.display = "block";
    }

}
//majority of code thanks to https://www.freecodecamp.org/news/build-a-wordle-clone-in-javascript/

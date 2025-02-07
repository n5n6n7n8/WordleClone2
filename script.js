import {Fiveletterwords} from "https://dl.dropbox.com/scl/fi/c4zs697uhqioskoq1lhhc/fiveletterwords.js?rlkey=l6t52fom0yqsypnyt4ok0prd8&st=6cznj4kw&dl=0";
let d = new Date();
let t = d.getTime();
let days = Math.floor(t / (3600000)) - 8; //Get in hour time change from utc to pacific
days = Math.floor(days/24);//Divide for days
days -= 20089; //Represents days since Jan 1 2025. Used to distinguish time when getting words from Google Sheets

const numberOfGuesses = 6; // The number of guesses the player gets
let rightGuessString = "DUCKS";
let additionalMessage = "Read news and more on the Daily Emerald website!"; // This is for linking to articles that may relate to the answer
let additionalLink = "dailyemerald.com"; // This is the link to the article
let authorName = "";
let isLoading = true;

let onColorblindMode = false;

let WORD_LENGTH = rightGuessString.length;
let guessesRemaining = numberOfGuesses;
let currentGuess = [];
let nextLetter = 0;

let resultsString = ""; //copy results string
let isClear = false; //is the game finished

const checkbox = document.getElementById("colorblindButton");
let menuModal = document.getElementById("menuModal");
let openMenuButton = document.getElementById("openMenuButton");
let helpCloseButton = document.getElementById("close");

let modal2 = document.getElementById("myModal"); //getting variables for popup window
let gameboard = document.getElementById("game-board");

const grayColor = "rgb(160, 160, 160)";
const greenColor = "rgb(95, 178, 61)";
const yellowColor = "rgb(229, 237, 62)";
const orangeColor = "rgb(222, 128, 74)";
const blueColor = "rgb(150, 194, 248)";

//Imports words from google spreadsheet, containing words, dates, article links, and descriptions
const sheetId = "1M2FLT7xmoaDcnTI5_hrYnzw5-IXXJoE8H-MK6fDXvWA";
const sheetName = encodeURIComponent("WaddleDataSheet");
const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
fetch(sheetURL)
  .then((response) => response.text())
  .then((csvText) => handleResponse(csvText));

function handleResponse(csvText) {
  let sheetObjects = csvToObjects(csvText);
  // sheetObjects is now an Array of Objects
  rightGuessString = sheetObjects[days]["WORD"].toLowerCase();
  additionalMessage = sheetObjects[days]["TITLE"];
  additionalLink = sheetObjects[days]["LINK"];
  authorName = sheetObjects[days]["AUTHOR"];
  console.log("Finished loaing spreadsheets");
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
      }
      objects.push(thisObject);
    }
    return objects;
  }
  function csvSplit(row) {
    return row.split(",").map((val) => val.substring(1, val.length - 1));
  }
//Sets up the win/lose screen

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
setTimeout(() => { 
    if(isLoading){
        toastr.info("Website is loading, please wait!");
    }
}, 4000); //Timeout solves bug where data in google sheets would load in before the placeholder message
window.onload = (event) => {
    isLoading = false;
    initBoard();
    console.log("page is fully loaded");
};



function setEndGameText(){
    let gameoverinfo = document.getElementById("gameOverInfo");
    gameoverinfo.textContent = "Answer: " + rightGuessString.toUpperCase() + " ";
    let addLink = document.getElementById("gameOverLink");
    addLink.textContent = additionalMessage;
    addLink.href = additionalLink;
    if(authorName!==""){
        let authorNameTag = document.getElementById("authorInfo");
        authorNameTag.textContent = "Article by " + authorName;
    }
}


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

    for (let i = 0; i < WORD_LENGTH; i++) {
        let letterColor = ''
        let box = row.children[i]
        let letter = currentGuess[i]
        let animName = "";
        
        let letterPosition = rightGuess.indexOf(currentGuess[i])
        // is letter in the correct guess
        

        if (letterPosition === -1) {
            letterColor = grayColor;
            animName = "tileturngy";
            resultsString += "⬜";
            rightGuess[letterPosition] = "#"
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position
            if (currentGuess[i] === rightGuess[i]) {
                // shade green
                if(onColorblindMode){
                    letterColor = orangeColor;
                    animName = "tileturnor";
                }
                else{
                    letterColor = greenColor;
                    animName = "tileturngn";
                }
                resultsString += "🟩"; //
                rightGuess[letterPosition] = "#"
            } else { //if the letter that appears later is in the right place, 
                let nextIndex = rightGuess.slice(i+1).indexOf(currentGuess[i]);
                if(currentGuess[nextIndex+i+1]===rightGuess[nextIndex+i+1]){
                    //shade gray, because the one later is right
                    letterColor = grayColor;
                    animName = "tileturngy";
                    resultsString += "⬜";
                }else{
                // shade box yellow
                if(onColorblindMode){
                    letterColor = blueColor;
                    animName = "tileturnbl";
                }
                else{
                    letterColor = yellowColor;
                    animName = "tileturnyel";
                }
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

    if (guessString === rightGuessString) { //GAME END
        setEndGameText();
        resultsString += "dailyemerald.com/waddle";
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
            setEndGameText();
            resultsString += "dailyemerald.com/waddle";
            toastr.error("You've run out of guesses! Game over!");
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
            if ((oldColor === greenColor) || oldColor === orangeColor) {
                return
            }
            if ((oldColor === yellowColor && color !== greenColor) || (oldColor === blueColor && color !== orangeColor)) {
                return
            }

            elem.style.backgroundColor = color
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


checkbox.addEventListener('change', function() {
    if(!onColorblindMode){
        for (const elem of document.getElementsByClassName("letter-box")) {
            if(elem.style.backgroundColor == greenColor){
                elem.style.backgroundColor = orangeColor;
            }
            else if(elem.style.backgroundColor == yellowColor){
                elem.style.backgroundColor = blueColor;
            }
        }
        for (const elem of document.getElementsByClassName("keyboard-button")) {
            if(elem.style.backgroundColor == greenColor){
                elem.style.backgroundColor = orangeColor;
            }
            else if(elem.style.backgroundColor == yellowColor){
                elem.style.backgroundColor = blueColor;
            }
        }
        onColorblindMode = true;
    }
    else{
        for (const elem of document.getElementsByClassName("letter-box")) {
            if(elem.style.backgroundColor == orangeColor){
                elem.style.backgroundColor = greenColor;
            }
            else if(elem.style.backgroundColor == blueColor){
                elem.style.backgroundColor = yellowColor;
            }
        }
        for (const elem of document.getElementsByClassName("keyboard-button")) {
            if(elem.style.backgroundColor == orangeColor){
                elem.style.backgroundColor = greenColor;
            }
            else if(elem.style.backgroundColor == blueColor){
                elem.style.backgroundColor = yellowColor;
            }
        }
        onColorblindMode = false;
    }
});
openMenuButton.onclick = function(event){
    menuModal.style.display = "block";
}
helpCloseButton.addEventListener("click", function(){
    menuModal.style.display = "none";
    modal2.style.display = "none";
})
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target === modal2) {
        modal2.style.display = "none";
    }
    else if(event.target === menuModal){
        menuModal.style.display = "none";
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

import { WORDS } from "https://raw.githubusercontent.com/n5n6n7n8/WordleClone2/refs/heads/main/newWordList.js";
let d = new Date();
let t = d.getTime();
let days = Math.floor(t / (86400000)); //Oct 17 24: 20014
const answers = ["ducks", "quick", "flock", "class", "floor", "agate", "young", "bumpy", "sweet"];

/* IMPORTANT! These four variables determine important aspects of the game.*/
const numberOfGuesses = 6; // The number of guesses the player gets
let additionalMessage = ""; // This is for linking to articles that may relate to the answer
let additionalLink = ""; // This is the link to the article
let rightGuessString = answers[days-20012]; // The answer for today

let gameoverinfo = document.getElementById("gameOverInfo");
gameoverinfo.textContent = "Answer: " + rightGuessString.toUpperCase() + " ";
if(additionalLink !== "" && additionalMessage !== ""){
    let addLink = document.getElementById("gameOverLink");
    addLink.textContent = additionalMessage;
    addLink.href = additionalLink;
}

//wordle id number = current day - 20014

const WORD_LENGTH = rightGuessString.length;
let guessesRemaining = numberOfGuesses;
let currentGuess = [];
let nextLetter = 0;
//let rightGuessString = Fiveletterwords[Math.floor(Math.random() * Fiveletterwords.length)] //pick random word

let resultsString = ""; //copy results string
let isClear = false; //is the game finished

/*let test = document.getElementById("test");
test.innerText = ""+days;*/

let modal2 = document.getElementById("myModal"); //getting variables for popup window
let close = document.getElementsByClassName("close")[0];
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

    if (guessString.length !== WORD_LENGTH) {
        toastr.error("Not enough letters!")
        return
    }

    if (!WORDS.includes(guessString)) {
        toastr.error("Word not in list!")
        return
    }
    //do animatino
    //document.getElementsByClassName("letter-box").animation = "animatetop 2s 2s forward";

    for (let i = 0; i < WORD_LENGTH; i++) {
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
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position
            if (currentGuess[i] === rightGuess[i]) {
                // shade green
                letterColor = 'rgb(90, 163, 46)';
                animName = "tileturngn";
                resultsString += "🟩";
            } else {
                // shade box yellow
                letterColor = "rgb(229, 237, 62)";
                animName = "tileturnyel";
                resultsString += "🟨";
            }

            rightGuess[letterPosition] = "#"
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
            if (oldColor === 'green') {
                return
            }

            if (oldColor === 'yellow' && color !== 'green') {
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


close.onclick = function() {
    modal2.style.display = "none";
}
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



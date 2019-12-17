var quizzes = [
    {
        name: "Code Quiz",
        description: "Prepare to answer questions about javascript.",
        questions: [
            {
                title: "Commonly used data types DO NOT include:",
                choices: ["strings", "booleans", "alerts", "numbers"],
                answer: "alerts"
            },
            {
                title: "The condition in an if / else statement is enclosed within ____.",
                choices: ["quotes", "curly brackets", "parentheses", "square brackets"],
                answer: "parentheses"
            },
            {
                title: "Arrays in JavaScript can be used to store ____.",
                choices: ["numbers and strings", "other arrays", "booleans", "all the above"],
                answer: "all the above"
            },
            {
                title: "String values must be enclosed within ____ when being assigned variables.",
                choices: ["commas", "curly brackets", "quotes", "parentheses"],
                answer: "parentheses"
            },
            {
                title: "A very useful tool used when during development and debugging for printing content to the debugger is ____.",
                choices: ["JavaScript", "terminal/bash", "for loops", "console.log"],
                answer: "console.log"
            },

        ]
    },
    {
        name: "Math Quiz",
        description: "Prepare to answer questions about simple mathematics.",
        questions: [
            {
                title: "(11 * 10) / 5 = ",
                choices: ["22", "23", "24", "none of the above"],
                answer: "22"
            },
            {
                title: "(1 + 2 + 3) * 15 = ",
                choices: ["95", "105", "90", "85"],
                answer: "90"
            },
            {
                title: "(5 + 7) * (2 + 4 + 6) / (3 + 1) = ",
                choices: ["40", "44", "36", "42"],
                answer: "36"
            },
            {
                title: "11 * 11 * 3 = ",
                choices: ["353", "356", "363", "373"],
                answer: "363"
            },
            {
                title: "3 * 4 * 5 / 6 =",
                choices: ["12", "14", "8", "10"],
                answer: "10"
            },

        ]
    },
];


const TIME_PER_QUESTION = 15;
const WRONG_PENALTY = 10;
const TIME_SHOW_CORRECT_MS = 1500;
const MAX_SCORES = 5;

// Header Content
const headerEl = document.getElementById("header");
const spanTimeEl = document.getElementById("current-time");
const viewHighEl = document.getElementById("high-scores-link");
// Screen Divs
const screenSelectEl = document.getElementById("select-screen");
const screenStartEl = document.getElementById("start-screen");
const screenQuestionEl = document.getElementById("question-screen");
const screenResultEl = document.getElementById("result-screen");
const screenScoresEl = document.getElementById("scores-screen");
// Select Screen Content
const selectQuizListEl = document.getElementById("quiz-select-list");
const quizDescriptionEl = document.getElementById("quiz-description");
// Start Screen Content
const quizNameEl = document.getElementById("quiz-name");
const btnStartEl = document.getElementById("start");
// Question Screen Content
const questionTextEl = document.getElementById("question-text");
const responseListEl = document.getElementById("response-list");
const responseCorrectEl = document.getElementById("response-correct");
// Results Screen Content
const finalTimeEl = document.getElementById("final-time");
const inpInitialsEl = document.getElementById("initials-input");
const btnSubmitScoreEl = document.getElementById("btnSubmitScore");
// Scores Screen Content
const scoresListEl = document.getElementById("high-score-list");
const btnBackEl = document.getElementById("btnBack");
const btnClearScoresEl = document.getElementById("btnClearScores");


let timeRemaining = 0;
let tmrInterval;
let questionIndex = 0;
let highScores = JSON.parse(localStorage.getItem("high-scores")) || [];
let currentScreenEl = screenSelectEl;
let responseTimeoutId;
let questions = [];
let currentQuizName = "";


// EVENT HANDLERS

// Quiz Select
function handleQuizSelect(event) {
    if (!event.target.matches("button")) { return; }
    let quizIndex = event.target.getAttribute("data-id");
    let quiz = quizzes[quizIndex];
    questions = quiz.questions;
    currentQuizName = quiz.name;
    quizNameEl.textContent = currentQuizName;
    quizDescriptionEl.textContent = quiz.description;
    showScreen(screenStartEl);
}

// View High Scores
function handleViewHigh() {
    stopTimer();
    headerEl.setAttribute("style", "visibility: hidden;");
    refreshScoreList();
    showScreen(screenScoresEl);
}

// Start Game
function handleStartGame() {
    questionIndex = 0;
    timeRemaining = TIME_PER_QUESTION * questions.length;
    updateTimeDisplay();
    loadCurrentQuestion();
    showScreen(screenQuestionEl);
    tmrInterval = setInterval(timerEvent, 1000);
}

// Response Clicked - Handle when user selects one of the question choices
function handleResponse(event) {

    if (!event.target.matches("button")) { return; }

    let isCorrect = event.target.getAttribute("data-answer") === "true";

    if (!isCorrect) {
        timeRemaining = (timeRemaining >= WRONG_PENALTY) ? (timeRemaining - WRONG_PENALTY) : 0;
        updateTimeDisplay();
    }

    showResponse(isCorrect);

    if ((questionIndex < questions.length - 1) && (timeRemaining > 0)) {
        questionIndex++;
        loadCurrentQuestion();
    } else {
        stopTimer();
        updateTimeDisplay();
        showScreen(screenResultEl);
    }
}

// Submit High Score Click
function handleSubmitScoreClick() {
    let initials = inpInitialsEl.value.trim();
    if (initials.length < 2) {
        alert("Initials must be at least 2 characters");
        return;
    }
    addHighScore(initials, timeRemaining);
    handleViewHigh();
}

// Submit High Score Keypress (enter)
function handleSubmitScoreKeyPress(event) {
    if (event.which === 13) {
        handleSubmitScoreClick();
    }
}

// Go Back to Start
function handleBack() {
    timeRemaining = 0;
    headerEl.setAttribute("style", "visibility: visible;");
    updateTimeDisplay();
    showScreen(screenSelectEl);
}

// Clear Scores
function handleClearscores() {
    highScores = [];
    updateStorage();
    refreshScoreList();
}


// HELPER FUNCTIONS
// Update Client Storage with High Scores list
function updateStorage() {
    localStorage.setItem("high-scores", JSON.stringify(highScores));
}

// 1-sec Timer Event
function timerEvent() {
    timeRemaining--;
    updateTimeDisplay();

    if (timeRemaining < 1) {
        stopTimer();
        showScreen(screenResultEl);
    }
}

// Stop the 1-sec Timer
function stopTimer() {
    clearInterval(tmrInterval);
}

// Update the Display Time
function updateTimeDisplay() {
    spanTimeEl.textContent = timeRemaining;
    finalTimeEl.textContent = timeRemaining;
}

// Add High Score to the List
function addHighScore(initials, score) {
    highScores.push({ "quiz": currentQuizName, "initials": initials, "score": score, "id": highScores.length });
    highScores.sort(function (a, b) { return b.score - a.score; });
    updateStorage();
    refreshScoreList();
}

// Refresh the High Scores List

function refreshScoreList() {
    scoresListEl.innerHTML = ""; // Clear Out old High Scores



    let numDisplay = highScores.length < MAX_SCORES ? highScores.length : MAX_SCORES;
    for (let index = 0; index < numDisplay; index++) {
        let li = document.createElement("li");
        let classes = "score-item alert-info";
        if (highScores[index].id === highScores.length - 1) classes += " current";
        li.setAttribute("class", classes);
        li.textContent = highScores[index].initials + ": " + highScores[index].score + " (" + highScores[index].quiz + ")";
        scoresListEl.appendChild(li);
    }
}

// Load the current Question
function loadCurrentQuestion() {
    let question = questions[questionIndex];
    questionTextEl.textContent = question.title;
    buildResponseList(question);
}

// Temporarily pop-up a text showing if they got it right or wrong
function showResponse(isCorrect) {
    if (responseTimeoutId) {
        clearTimeout(responseTimeoutId);
    }
    responseCorrectEl.textContent = isCorrect ? "Correct!" : "Wrong!";
    responseCorrectEl.style.visibility = "visible";
    responseTimeoutId = setTimeout(function () {
        responseCorrectEl.style.visibility = "hidden";
    }, TIME_SHOW_CORRECT_MS);
}

// Build the Question Response List for the provided question
function buildResponseList(question) {
    responseListEl.innerHTML = "";
    for (let index = 0; index < question.choices.length; index++) {
        let btn = createResponseButton(question, index);
        responseListEl.appendChild(btn);
    }
}

// Create a single question response button
function createResponseButton(question, index) {
    let li = document.createElement("li");
    let text = question.choices[index];
    let btn = document.createElement("button");
    btn.setAttribute("class", "btn btn-primary btn-choice");
    btn.setAttribute("data-answer", (text === question.answer));
    btn.textContent = (index + 1) + ". " + text;
    li.appendChild(btn);
    return li;
}

// Build a list of available quizzes
function buildQuizList() {
    for (let index = 0; index < quizzes.length; index++) {
        let btn = createQuizButton(quizzes[index].name, index);
        selectQuizListEl.appendChild(btn);
    }

    // Trying to make a good luck pop up
    // $(function () {
    //     $("#btn-primary").click(function (event) {
    //         text("Good luck!").slideDown(2000);
    //     });
    // });
}

// Create a single quiz button
function createQuizButton(name, index) {
    let li = document.createElement("li");
    let btn = document.createElement("button");
    btn.textContent = name;
    btn.setAttribute("class", "btn btn-primary btn-choice");
    btn.setAttribute("data-id", index);
    li.appendChild(btn);
    return li;
}

// Hide the current screen and show a new one
function showScreen(el) {
    if (currentScreenEl) {
        currentScreenEl.style.display = "none"
    }
    el.style.display = "block";
    currentScreenEl = el;
}

// SETUP EVENT LISTENERS
selectQuizListEl.addEventListener("click", handleQuizSelect);
viewHighEl.addEventListener("click", handleViewHigh);
btnStartEl.addEventListener("click", handleStartGame);
responseListEl.addEventListener("click", handleResponse);
btnBackEl.addEventListener("click", handleBack);
btnClearScoresEl.addEventListener("click", handleClearscores);
btnSubmitScoreEl.addEventListener("click", handleSubmitScoreClick);
inpInitialsEl.addEventListener("keypress", handleSubmitScoreKeyPress);

// Build the Initial Quiz List
buildQuizList();
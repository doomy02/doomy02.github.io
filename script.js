// Cache DOM elements for easy access and manipulation
const homePage = document.getElementById("home-page");
const quizApp = document.getElementById("quiz-app");
const questionElement = document.getElementById("question");
const questionContainer = document.querySelector(".question-container");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const startQuizBtn = document.getElementById("start-quiz-btn");
const saveQuestionsBtn = document.getElementById("save-questions-btn");
const uploadQuestionsBtn = document.getElementById("upload-questions-btn");
const uploadQuestionsInput = document.getElementById("upload-questions-input");
const editQuestionSelect = document.createElement("select");
editQuestionSelect.id = "edit-question-select";
const backButton = document.getElementById("back-btn");
const quizManagementContainer = document.getElementById("quiz-management");
const randomizeButton = document.getElementById("randomize-btn");

// Use the existing Edit button for confirming edits
const editButton = document.getElementById("edit-btn");
const addQuestionBtn = document.getElementById("add-question-btn");

// Initialize an empty array to store questions
let questions = [];
let currentQuestionIndex = 0; // Index of the current question
let score = 0; // User's score

let isEditing = false; // Track if we are in edit mode
let editIndex = -1; // Track which question is being edited

// Cache form elements used for adding questions
const questionForm = document.getElementById("question-form");
const questionInput = document.getElementById("question-input");
const answer1Input = document.getElementById("answer1-input");
const answer2Input = document.getElementById("answer2-input");
const answer3Input = document.getElementById("answer3-input");
const answer4Input = document.getElementById("answer4-input");
const correctAnswerSelect = document.getElementById("correct-answer");

// Hide the Edit and Randomize button initially
editButton.style.display = "none";
randomizeButton.style.display = "none";

// Insert dropdown to select question to edit
const editSection = document.createElement("div");
editSection.innerHTML = `<h2>Edit Questions</h2>`;
homePage.insertBefore(editSection, questionForm);
editSection.appendChild(editQuestionSelect);

// Populate dropdown with question titles
function populateEditDropdown() {
    editQuestionSelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.text = "Select a question to edit";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    editQuestionSelect.appendChild(defaultOption);

    questions.forEach((question, index) => {
        const option = document.createElement("option");
        option.text = question.question;
        option.value = index;
        editQuestionSelect.appendChild(option);
    });
}

// Populate dropdown with question titles
function populateEditDropdown() {
    editQuestionSelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.text = "Select a question to edit";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    editQuestionSelect.appendChild(defaultOption);

    questions.forEach((question, index) => {
        const option = document.createElement("option");
        option.text = question.question;
        option.value = index;
        editQuestionSelect.appendChild(option);
    });
}

// Handle edit dropdown selection change
editQuestionSelect.addEventListener("change", () => {
    const selectedQuestionIndex = editQuestionSelect.value;
    if (selectedQuestionIndex !== "") {
        loadQuestionForEditing(selectedQuestionIndex);
    }
});

// Load selected question into the form for editing
function loadQuestionForEditing(index) {
    const currentQuestion = questions[index];
    
    // Populate the form with the current question's data for editing
    questionInput.value = currentQuestion.question;
    document.getElementById("question-image-input").value = ""; // Reset image file input

    answer1Input.value = currentQuestion.answers[0].text;
    answer2Input.value = currentQuestion.answers[1].text;
    answer3Input.value = currentQuestion.answers[2].text;
    answer4Input.value = currentQuestion.answers[3].text;

    correctAnswerSelect.value = currentQuestion.answers.findIndex(answer => answer.correct);

    isEditing = true;
    editIndex = index;

    // Show Edit button and change its text to "Confirm Edit"
    editButton.style.display = "block";
    editButton.innerText = "Confirm Edit";
}

// Helper function to convert image to Base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // reader.result contains Base64 string
        reader.onerror = reject;
        reader.readAsDataURL(file); // Convert image to Base64
    });
}

/// Modify the question form submit handler
questionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const questionText = questionInput.value;
    
    // Process question image as Base64
    let questionImageBase64 = "";
    const questionImageFile = document.getElementById("question-image-input").files[0];
    if (questionImageFile) {
        questionImageBase64 = await convertImageToBase64(questionImageFile);
    }

    const answers = await Promise.all([
        {
            text: answer1Input.value,
            image: document.getElementById("answer1-image-input").files[0] ? await convertImageToBase64(document.getElementById("answer1-image-input").files[0]) : "",
            correct: correctAnswerSelect.value == "0"
        },
        {
            text: answer2Input.value,
            image: document.getElementById("answer2-image-input").files[0] ? await convertImageToBase64(document.getElementById("answer2-image-input").files[0]) : "",
            correct: correctAnswerSelect.value == "1"
        },
        {
            text: answer3Input.value,
            image: document.getElementById("answer3-image-input").files[0] ? await convertImageToBase64(document.getElementById("answer3-image-input").files[0]) : "",
            correct: correctAnswerSelect.value == "2"
        },
        {
            text: answer4Input.value,
            image: document.getElementById("answer4-image-input").files[0] ? await convertImageToBase64(document.getElementById("answer4-image-input").files[0]) : "",
            correct: correctAnswerSelect.value == "3"
        }
    ]);

    // Add the new question (including Base64 images) to the questions array
    questions.push({ question: questionText, image: questionImageBase64, answers: answers });

    // Clear form fields
    clearFormFields();
});

// Handle Confirm Edit button click
editButton.addEventListener("click", async () => {
    if (isEditing && editIndex !== -1) {
        // Get the current question's image before potentially overwriting it
        const originalQuestionImage = questions[editIndex].image;

        // Check if a new question image is uploaded; if not, keep the existing one
        let updatedQuestionImage = originalQuestionImage;
        const newQuestionImageFile = document.getElementById("question-image-input").files[0];
        if (newQuestionImageFile) {
            updatedQuestionImage = await convertImageToBase64(newQuestionImageFile);
        }

        // Update the existing question with edited data
        questions[editIndex] = {
            question: questionInput.value,
            image: updatedQuestionImage,  // Keep original image if no new image is selected
            answers: [
                {
                    text: answer1Input.value,
                    image: document.getElementById("answer1-image-input").files[0]
                        ? await convertImageToBase64(document.getElementById("answer1-image-input").files[0])
                        : questions[editIndex].answers[0].image,  // Keep original answer image if no new image is selected
                    correct: correctAnswerSelect.value == "0"
                },
                {
                    text: answer2Input.value,
                    image: document.getElementById("answer2-image-input").files[0]
                        ? await convertImageToBase64(document.getElementById("answer2-image-input").files[0])
                        : questions[editIndex].answers[1].image,
                    correct: correctAnswerSelect.value == "1"
                },
                {
                    text: answer3Input.value,
                    image: document.getElementById("answer3-image-input").files[0]
                        ? await convertImageToBase64(document.getElementById("answer3-image-input").files[0])
                        : questions[editIndex].answers[2].image,
                    correct: correctAnswerSelect.value == "2"
                },
                {
                    text: answer4Input.value,
                    image: document.getElementById("answer4-image-input").files[0]
                        ? await convertImageToBase64(document.getElementById("answer4-image-input").files[0])
                        : questions[editIndex].answers[3].image,
                    correct: correctAnswerSelect.value == "3"
                }
            ]
        };

        // Exit edit mode and clear the form
        isEditing = false;
        editIndex = -1;

        // Hide the Edit button and reset its text
        editButton.style.display = "none";
        editButton.innerText = "Edit";

        populateEditDropdown(); // Refresh dropdown with updated questions
        clearFormFields();
        alert("Question updated successfully!");
    }
});


// Function to clear form fields after submission
function clearFormFields() {
    questionInput.value = "";
    document.getElementById("question-image-input").value = "";
    answer1Input.value = "";
    answer2Input.value = "";
    answer3Input.value = "";
    answer4Input.value = "";
    correctAnswerSelect.value = "";
}

// Function to start the quiz and hide the home page
startQuizBtn.addEventListener("click", () => {
    homePage.style.display = "none";
    quizApp.style.display = "block";
    quizManagementContainer.style.display = "none";
    score = 0; // Reset score
    currentQuestionIndex = 0; // Reset question index
    showQuestion();
});

// Function to show the current question
function showQuestion() {
    // Display the current question and its answers
    const question = questions[currentQuestionIndex];
    questionElement.textContent = question.question;
    answerButtons.innerHTML = "";

    question.answers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.textContent = answer.text;
        button.classList.add("btn");
        button.addEventListener("click", () => selectAnswer(index));
        answerButtons.appendChild(button);
    });
}

// Initialize quiz settings and display the first question
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    showQuestion();
}

// Event listener for Back to Menu button
backButton.addEventListener("click", () => {
    quizApp.style.display = "none";  // Hide the quiz section
    homePage.style.display = "block";  // Show the home page
    quizManagementContainer.style.display = "block";
});

// Modify the showQuestion function to handle Base64 images
function showQuestion() {
    resetState();

    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    
    // Set the question text
    questionContainer.innerHTML = `<h2>${questionNo}. ${currentQuestion.question}</h2>`;

    // Display Base64 question image if available
    if (currentQuestion.image) {
        const questionImageElement = document.createElement("img");
        questionImageElement.src = currentQuestion.image;
        questionImageElement.alt = "Question Image";
        questionImageElement.style.maxWidth = "200px"; // Adjust size as needed
        questionContainer.appendChild(questionImageElement);
    }

    // Create buttons for each answer option
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.classList.add("answer-container");

        // Create a span element for the answer text
        const answerText = document.createElement("span");
        answerText.innerHTML = answer.text;
        button.appendChild(answerText);

        // Add Base64 answer image if available
        if (answer.image) {
            const answerImageElement = document.createElement("img");
            answerImageElement.src = answer.image;
            answerImageElement.alt = "Answer Image";
            answerImageElement.style.maxWidth = "100px"; // Adjust size as needed
            answerImageElement.style.marginLeft = "10px"; // Add spacing between text and image
            answerImageElement.style.display = "block";
            button.appendChild(answerImageElement);
        }

        // Attach event listener for selecting answers
        button.addEventListener("click", selectAnswer);

        // Attach data if the answer is correct
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }

        answerButtons.appendChild(button);
    });
}

// Reset the state of the question and answer buttons
function resetState() {
    nextButton.style.display = "none"; // Hide the "Next" button
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild); // Clear answer buttons
    }
}

// Handle the selection of an answer
function selectAnswer(e) {
    const selectedBtn = e.target.closest("button"); // Get the clicked button
    const isCorrect = selectedBtn.dataset.correct === "true";

    // Update button styling based on correctness
    if (isCorrect) {
        selectedBtn.classList.add("correct");
        score++;
    } else {
        selectedBtn.classList.add("incorrect");
    }

    // Disable other answer buttons and highlight the correct one
    Array.from(answerButtons.children).forEach(button => {
        button.disabled = true;
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
    });

    nextButton.style.display = "block"; // Show the "Next" button
}

// Display the user's score at the end of the quiz
function showScore() {
    resetState(); // Clear the previous state (answers, buttons)
    questionContainer.innerHTML = `<h2>You scored ${score} out of ${questions.length}!</h2>`; // Show the score
    nextButton.innerHTML = "Play Again"; // Change the button text to "Play Again"
    nextButton.style.display = "block"; // Show the "Play Again" button
}

nextButton.addEventListener("click", () => {
    if (nextButton.innerHTML === "Play Again") {
        startQuiz(); // Restart the quiz when "Play Again" is clicked
    } else {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            resetState(); // Clear previous state (answers, buttons)
            showQuestion(); // Display the next question
        } else {
            showScore(); // Show final score when quiz is complete
        }
    }
});

// Handle Save Questions button click
saveQuestionsBtn.addEventListener("click", () => {
    const jsonString = JSON.stringify(questions);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions.json";
    a.click();
    URL.revokeObjectURL(url);
});

// Upload questions from a JSON file
uploadQuestionsBtn.addEventListener("click", () => {
    uploadQuestionsInput.click(); // Trigger the file input click event
    randomizeButton.style.display = "block";
});

// Upload questions from a JSON file
uploadQuestionsInput.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const json = event.target.result;
            questions = JSON.parse(json); // Parse the uploaded questions
            populateEditDropdown(); // Refresh the edit dropdown with the uploaded questions
            alert("Questions uploaded successfully!");

            // After uploading, make sure to display Base64 images properly in the quiz
            showQuestion(); 
        };
        reader.readAsText(file);
    }
});

// Fisher-Yates shuffle algorithm to randomize questions
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Randomize the questions in the question set
randomizeButton.addEventListener("click", () => {
    shuffleArray(questions); // Shuffle the questions array
    currentQuestionIndex = 0; // Reset question index
    alert("Questions have been randomized!");

    // Start quiz from the beginning with the randomized questions
    startQuiz();
});

function loadQuestionForEditing(index) {
    const currentQuestion = questions[index];

    // Populate the form with the current question's data for editing
    questionInput.value = currentQuestion.question;

    // Reset the image file input, but keep the existing image in memory
    document.getElementById("question-image-input").value = "";

    // Remove the existing question image from the form if present (during editing, don't show the image)
    const existingImageElement = document.getElementById("existing-question-image");
    if (existingImageElement) {
        existingImageElement.remove(); // Remove any previously displayed image
    }
    
    // Populate the answer fields
    answer1Input.value = currentQuestion.answers[0].text;
    answer2Input.value = currentQuestion.answers[1].text;
    answer3Input.value = currentQuestion.answers[2].text;
    answer4Input.value = currentQuestion.answers[3].text;

    correctAnswerSelect.value = currentQuestion.answers.findIndex(answer => answer.correct);

    isEditing = true;
    editIndex = index;

    // Show Edit button and change its text to "Confirm Edit"
    editButton.style.display = "block";
    editButton.innerText = "Confirm Edit";
}

// Initialize the quiz on page load
startQuiz();
import * as vscode from 'vscode';

let currentQuestionIndex = 0; // Track the current question

// Array of quiz questions
const quizQuestions = [
	{
		question: "What does 'const' do in JavaScript?",
		answers: ["Declares a constant variable", "Declares a function", "Declares an object", "None of these"],
		correctAnswer: "Declares a constant variable"
	},
	{
		question: "What is the purpose of 'let' in JavaScript?",
		answers: ["Declares a constant variable", "Declares a block-scoped variable", "Declares a global variable", "None of these"],
		correctAnswer: "Declares a block-scoped variable"
	},
	{
		question: "What does 'const' do in JavaScript?",
		answers: ["Declares a constant variable", "Declares a function", "Declares an object", "None of these"],
		correctAnswer: "Declares a constant variable"
	},
	{
		question: "What is the purpose of 'let' in JavaScript?",
		answers: ["Declares a constant variable", "Declares a block-scoped variable", "Declares a global variable", "None of these"],
		correctAnswer: "Declares a block-scoped variable"
	},
	{
		question: "What does '=== operator' do in JavaScript?",
		answers: ["Compares two values without type coercion", "Compares two values with type coercion", "Assigns a value to a variable", "None of these"],
		correctAnswer: "Compares two values without type coercion"
	},
	{
		question: "Which method adds a new element to the end of an array in JavaScript?",
		answers: ["push()", "pop()", "shift()", "None of these"],
		correctAnswer: "push()"
	},
	{
		question: "Which keyword is used to define a function in JavaScript?",
		answers: ["func", "function", "def", "None of these"],
		correctAnswer: "function"
	},
	{
		question: "Which of these is a falsy value in JavaScript?",
		answers: ["0", "1", "'false'", "'true'", "None of these"],
		correctAnswer: "0"
	},
	{
		question: "Which method can be used to parse a string into an integer?",
		answers: ["parseInt()", "toString()", "parseFloat()", "None of these"],
		correctAnswer: "parseInt()"
	},
	{
		question: "Which of the following is not a primitive data type in JavaScript?",
		answers: ["String", "Object", "Boolean", "None of these"],
		correctAnswer: "Object"
	},
	{
		question: "What is the default value of a JavaScript variable that is declared but not initialized?",
		answers: ["null", "undefined", "NaN", "None of these"],
		correctAnswer: "undefined"
	},
	{
		question: "Which method is used to remove the last element from an array in JavaScript?",
		answers: ["pop()", "shift()", "slice()", "None of these"],
		correctAnswer: "pop()"
	},
	{
		question: "What will the following code return: Boolean('0')?",
		answers: ["true", "false", "undefined", "None of these"],
		correctAnswer: "true"
	},
	{
		question: "What does the 'this' keyword refer to in JavaScript?",
		answers: ["The global object", "The function itself", "The object that owns the method", "None of these"],
		correctAnswer: "The object that owns the method"
	},
	{
		question: "What is the result of the expression '3' + 2 in JavaScript?",
		answers: ["5", "'32'", "'5'", "None of these"],
		correctAnswer: "'32'"
	},
	{
		question: "Which of the following is used to create a new object in JavaScript?",
		answers: ["{}", "[]", "new Object()", "None of these"],
		correctAnswer: "{}"
	}
];

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('quiz.startQuiz', () => {
		// Create a panel for the quiz
		const panel = vscode.window.createWebviewPanel(
			'quiz', // Identifies the type of the webview
			'JavaScript Quiz', // Title of the panel
			vscode.ViewColumn.One, // Show the panel in the first column
			{
				enableScripts: true, // Allow JS to run inside the webview
			}
		);

		// Create an HTML string for the quiz
		function getQuizHtml(questionIndex: number, message: string = '') {
			const question = quizQuestions[questionIndex];

			const answersHtml = question.answers.map((answer, index) => {
				return `<button class="answer" onclick="handleAnswer(${index})">${answer}</button>`;
			}).join('');

			return `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>JavaScript Quiz</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                        }
                        .question {
                            font-size: 20px;
                            margin-bottom: 20px;
                        }
                       .answer {
  						    display: block;
  						    background-color: #f0f0f0;
  						    padding: 10px;
  						    margin: 10px 0;
  						    border: none;
  						    cursor: pointer;
  						    width: 50%;
  						    box-sizing: border-box;
  						    transition: background-color 0.3s ease;
  						    border-radius: 8px; /* Adjust the value as needed for more or less rounding */
						}

                        .answer:hover {
                            background-color: #ddd;
                        }
                        .correct {
                            background-color: green !important;
                            color: white;
                        }
                        .incorrect {
                            background-color: red !important;
                            color: white;
                        }
                        .result-message {
                            margin-top: 20px;
                            font-size: 18px;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="question">${question.question}</div>
                    <div id="answers">
                        ${answersHtml}
                    </div>
                    <div class="result-message">${message}</div>
                    <script>
                        const vscode = acquireVsCodeApi();

                        function handleAnswer(answerIndex) {
                            const answer = document.querySelectorAll('.answer')[answerIndex].innerText;
                            const buttons = document.querySelectorAll('.answer');

                            // Disable all buttons after selection
                            buttons.forEach((button, idx) => {
                                button.disabled = true;
                            });

                            // Check if the answer is correct
                            if (answer === "${question.correctAnswer}") {
                                document.querySelectorAll('.answer')[answerIndex].classList.add("correct");
                                vscode.postMessage({ type: 'answer', correct: true });
                            } else {
                                document.querySelectorAll('.answer')[answerIndex].classList.add("incorrect");
                                vscode.postMessage({ type: 'answer', correct: false });
                            }

                            // Wait for 2 seconds before moving to the next question
                            setTimeout(() => {
                                vscode.postMessage({ type: 'nextQuestion' });
                            }, 2000); // 2 seconds delay
                        }
                    </script>
                </body>
                </html>
            `;
		}

		// Initial HTML setup (first question)
		panel.webview.html = getQuizHtml(currentQuestionIndex);

		// Listen for messages from the webview
		panel.webview.onDidReceiveMessage(
			message => {
				if (message.type === 'answer') {
					// Do nothing here because the answer logic is already handled in the webview
				}

				if (message.type === 'nextQuestion') {
					const question = quizQuestions[currentQuestionIndex];

					// Move to the next question or finish the quiz
					currentQuestionIndex++;

					// Update the WebView with feedback message
					if (currentQuestionIndex < quizQuestions.length) {
						panel.webview.html = getQuizHtml(currentQuestionIndex, "Next Question...");
					} else {
						vscode.window.showInformationMessage("Quiz Complete! 🎉");
						panel.dispose(); // Close the panel after quiz completion
					}
				}
			},
			undefined,
			context.subscriptions
		);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
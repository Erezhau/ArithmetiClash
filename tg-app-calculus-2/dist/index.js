import { updateScore } from "./site_firebase_auth.js";

const questionEl = document.getElementById('question');
const answerEl = document.getElementById('user_input');
const submitBtn = document.getElementById('answer');
const pointsEl = document.getElementById('score');
const shardsEl = document.getElementById('shards');
const pointsAnimationEl = document.getElementById('added_points');

let addPoints = 0;
let shards = 0;
let operator;
let num1;
let num2;

function generateQuestion() {
  num1 = Math.floor(Math.random() * 100) + 1;
  num2 = Math.floor(Math.random() * 100) + 1;
  operator = Math.random() > 0.5 ? '*' : '+';
  const questionText = `${num1} ${operator} ${num2}`;
  questionEl.textContent = questionText;
}

async function checkAnswer() {
  const userAnswer = parseInt(answerEl.value);
  const correctAnswer = Math.floor(eval(questionEl.textContent));
  answerEl.value = ''; // Clear the input field after submission

  if (userAnswer === correctAnswer) {
    if (operator === '*') {
      addPoints = (num1 > 10 && num2 > 10) ? 400 : 200;
    } else if (operator === '+') {
      addPoints = 100;
    }
    
    try {
      const newScore = await updateScore(addPoints);
      if (newScore !== null) {
        pointsEl.textContent = newScore;
        showPointsAnimation(addPoints);}
    } catch (error) {
      console.error("Error updating score:", error);
    }
  } else {
    shards++;
    let colorTriangle = document.getElementById(`tr${shards}`);
    colorTriangle.classList.toggle('red');
    
    if (shards === 6) {
      try {
        await updateScore(100);
        pointsEl.textContent = await getCurrentScore(); // Get updated score from Firebase
        shards = 0;
        function reset() {
          for (let i = 1; i <= 6; i++) {
            document.getElementById(`tr${i}`).classList.toggle('red');
          }
          showPointsAnimation("100");
        }
        setTimeout(reset, 100);
      } catch (error) {
        console.error("Error updating score:", error);
      }
    }
  }
  
  generateQuestion();
}

function showPointsAnimation(addPoints) {
  pointsAnimationEl.textContent = `+${addPoints}`;
  pointsAnimationEl.classList.add('show'); // Start animation
  setTimeout(() => {
    pointsAnimationEl.classList.remove('show'); // Hide animation after 1 second
  }, 1000);
}

// Add this new function to get the current score from Firebase
async function getCurrentScore() {
  try {
    const score = await getScoreFromFirestore(); // You need to implement this function in site_firebase_auth.js
    return score;
  } catch (error) {
    console.error("Error getting current score:", error);
    return 0;
  }
}

document.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    checkAnswer();
  }
});

generateQuestion();
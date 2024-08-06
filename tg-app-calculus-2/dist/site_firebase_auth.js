import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore, collection, addDoc, doc, updateDoc, getDoc, setDoc } from  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"



// Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBbIU4chmvZQUB32pSTKqzopsrVdG0xdSo",
    authDomain: "test-angular-firebase-f893d.firebaseapp.com",
    projectId: "test-angular-firebase-f893d",
    storageBucket: "test-angular-firebase-f893d.appspot.com",
    messagingSenderId: "505263045122",
    appId: "1:505263045122:web:5437b9a2e9c8ab25dac51b"
  };
 

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();


  
  // Function to handle signup
  function handleSignup() {
      const submit = document.getElementById('button_signup');
      const out = document.getElementById('out');
  
      if (submit) {
          submit.addEventListener('click', async function (event) {
              event.preventDefault();
              submit.disabled = true;
              const email = document.getElementById('email_signup').value;
              const password = document.getElementById('password_signup').value;
              
              try {
                  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                  const user = userCredential.user;
                  if (out) out.textContent = "User created. Redirecting...";
  
                  const docRef = await setDoc(doc(db, "users", user.uid), {
                      email: user.email,
                      uid: user.uid,
                      score: 0
                  });
                  console.log(user.uid);
  
                  setTimeout(() => {
                      window.location.href = "log_in.html";
                  }, 1000);
              } catch (error) {
                  if (out) out.textContent = "Error occured. Email must be in 'test@test.com' format and password 6+ characters long. Please reload and try again.";
                  console.error(error);
              } finally {
                  submit.disabled = false;
              }
          });
      }
  }
  
  // Function to handle login
  function handleLogin() {
      const loginBtn = document.getElementById('login_btn');
      const emailInput = document.getElementById('email_login');
      const passwordInput = document.getElementById('password_login');
      const outLogin = document.getElementById('out_login');
  
      if (loginBtn) {
          loginBtn.addEventListener('click', async function (event) {
              event.preventDefault();
              loginBtn.disabled = true;
  
              const email = emailInput.value;
              const password = passwordInput.value;
  
              try {
                  await signInWithEmailAndPassword(auth, email, password);
                  if (outLogin) outLogin.textContent = "Starting game...";
                  window.location.href = 'game.html';
              } catch (error) {
                  if (outLogin) outLogin.textContent = 'Error: ' + error.message;
                  console.error(error);
              } finally {
                  loginBtn.disabled = false;
              }
          });
      }
  };

      // Function to update the page title
function updatePageTitle(email) {
  const pageTitle = document.getElementById('page');
  if (pageTitle) {
      pageTitle.textContent = email ? `Hello, ${email}` : "TEST MODE";
  }
}
// Listen for authentication state changes

function handleGamePage() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      updatePageTitle(user.email);
      
    } else {
      updatePageTitle(null);
   
    }
  });
}

async function updateScoreInFirestore(userId, pointsEarned) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentScore = userSnap.data().score || 0;
      const newScore = currentScore + pointsEarned;
      await updateDoc(userRef, {
        score: newScore
      });
      console.log("Score updated successfully");
      return newScore;
    } else {
      console.error("User document not found");
      return null;
    }
  } catch (error) {
    console.error("Error updating score: ", error);
  }
}
export async function updateScore(points) {
  const user = auth.currentUser;
  if (user) {
    const newScore = await updateScoreInFirestore(user.uid, points);
    return newScore;
  }
  return null;
}

export async function getScoreFromFirestore() {
  const user = auth.currentUser;
  if (user) {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return userSnap.data().score || 0;
      } else {
        console.log("No such user!");
        return 0;
      }
    } catch (error) {
      console.error("Error getting score: ", error);
      return 0;
    }
  }
  return 0;
}

  // Run the appropriate function based on the current page
  if (document.getElementById('button_signup')) {
      handleSignup();
  } else if (document.getElementById('login_btn')) {
      handleLogin();
  } else if (document.getElementById('page')) {
    handleGamePage();
    
  };


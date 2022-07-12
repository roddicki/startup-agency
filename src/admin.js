
import {loadCheck, signUpUser, signOutUser, signInUser, getUserData, getCurrentUserEmail, createUserDoc, isUserSignedIn, getUserUid, getAllJobData, getSingleJob, getAllUserData} from './firebase-library.js';

loadCheck();

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { getFirestore, collection, onSnapshot, getDocs, addDoc, deleteDoc, doc, query, where, orderBy, getDoc, serverTimestamp, updateDoc, setDoc,  Timestamp, arrayUnion} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAq7-QGjZ8O1RVe_seOfdYjVLCjLdwrHYE",
  authDomain: "studio-freelancer-agency.firebaseapp.com",
  projectId: "studio-freelancer-agency",
  storageBucket: "studio-freelancer-agency.appspot.com",
  messagingSenderId: "487647550435",
  appId: "1:487647550435:web:474b8fb15c9412fb005ed6",
  measurementId: "G-TXX5XFWWN6"
};

// init firebase
initializeApp(firebaseConfig);

// init services
const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

let currentUserData = {};

// on login state change
onAuthStateChanged(auth, function(user) {
  if (user) {
      // User logged in already or has just logged in.
      console.log(user.uid, user.email, "logged in");
      showSignedInUser(user.email, user.uid);
      currentUserData.uid = user.uid;
      currentUserData.email = user.email;
    } else {
      // User not logged in or has just logged out.
      console.log("logged out");
      redirectSignedOutUser();
    }
})


// login
function signInAdmin(e) {
  e.preventDefault();
  const loginForm = document.querySelector('.login');
  let email = loginForm.email.value;
  let password = loginForm.password.value;
  signInWithEmailAndPassword(auth, email, password)
    .then(function(cred){
      console.log("Signed in", cred.user.uid);
      loginForm.reset();
      // go to profile page
      window.location.href = "jobboard.html";
    })
}

// show signed in user
function showSignedInUser(user, id) {
  const accountDropdown = document.querySelector('.dropdown-menu');
  // add user
  const userEmail = document.querySelector('.user-email');
  userEmail.innerHTML = user;
  // delete drop down contents
  accountDropdown.innerHTML = "";
  // create drop down contents
  let li = document.createElement('li');
  let signoutLink = document.createElement('a');
  signoutLink.className = 'dropdown-item sign-out';
  signoutLink.href = '#';
  signoutLink.innerHTML = 'Sign Out';
  li.appendChild(signoutLink);
  accountDropdown.appendChild(li);
  signoutLink.addEventListener('click', signOutUser);
}

// get profile data for signed in user
async function getCurrentUserDetails(uid) {
  const docRef = doc(db, 'users', uid);
  const singleDoc = await getDoc(docRef);
  if (singleDoc.exists()) {
    console.log("Logged in user document data:", singleDoc.data());
    currentUserData = singleDoc.data();
    currentUserData.uid = uid;
    return singleDoc.data();
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
  }
}

// redirect signed out user
function redirectSignedOutUser() {
  if (page != "login") {
    window.location.href = "index.html";
  };
  
}



//===========PAGE EVENT LISTENERS===================
const page = document.body.getAttribute('data-page');

// ALL PAGES
window.addEventListener('DOMContentLoaded', function(){
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
      logoutBtn.addEventListener('click', signOutUser);
  }
});

// LOGIN PAGE
if (page == "login") {
  console.log("login page");
  const loginForm = document.querySelector('.login');
  loginForm.addEventListener('submit', signInAdmin);
};



import {loadCheck, signUpUser, signOutUser, signInUser, getUserData, getCurrentUserEmail, createUserDoc, updateUserDoc,isUserSignedIn, getUserUid, getAllJobData, getSingleJob, getAllUserData} from './firebase-library.js';

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


// get first query string tag
function getParam() {
  const urlParams = new URLSearchParams(location.search);
  for (const [key, value] of urlParams) {
      //console.log(`${key}:${value}`);
      return value; // only works with one param at the mo
  }
}


// show list of users
function createUserList(userData) {
  console.log("create list of users");
  let userListContainer = document.querySelector(".user-list tbody");
  for (var i = 0; i < userData.length; i++) {
    //userData[i]
    let tr = document.createElement("tr");
    let name = document.createElement("td");
    name.innerHTML = userData[i].forename + " " + userData[i].surname;

    let approvedUser = "";
    if (userData[i].approved == "true") {
      approvedUser = "checked";
    }
    let idUser = "approve-"+i;
    let userApproved = document.createElement("td");
    userApproved.innerHTML = '<div class="form-check user-approved form-switch"><input id="'+idUser+'" class="form-check-input" type="checkbox" data-id="'+userData[i].id+'" '+approvedUser+'></div>';


    let userInfo = document.createElement("td");
    userInfo.className = "d-none d-md-table-cell";
    userInfo.innerHTML = '<a class="btn btn-primary" href="userinfo.html?id='+userData[i].id+'">User Information</a>';

    let approvedProfile = "";
    if (userData[i].profileApproved) {
      approvedProfile = "checked";
    } 
    let idProfile = "approve-profile-"+i;
    let profileApproved = document.createElement("td");
    profileApproved.innerHTML = '<div class="form-check profile-approved form-switch"><input class="form-check-input" type="checkbox" id="'+idProfile+'" data-id="'+userData[i].id+'" '+approvedProfile+'></div>';

    let profileLink = document.createElement("td");
    profileLink.className = "d-none d-md-table-cell";
    profileLink.innerHTML = '<a href="../profile.html?id='+userData[i].id+'" class="btn btn-primary">Profile</a>';

    tr.appendChild(name);
    tr.appendChild(userApproved);
    tr.appendChild(userInfo);
    tr.appendChild(profileApproved);
    tr.appendChild(profileLink);
    userListContainer.appendChild(tr);

    // add event listeners for the switch
    const approveSwitch = document.querySelector("#"+idUser);
    approveSwitch.addEventListener('change', function(){ 
      // update doc
      console.log(approveSwitch.dataset.id); 
      // update user doc with key val
      //updateUserDoc(approveSwitch.dataset.id, "approved", approveSwitch.checked); // problem
      updateApproval(approveSwitch.dataset.id, approveSwitch.checked);
    });
    // add event listeners for the switch
    const profileApproveSwitch = document.querySelector("#"+idProfile);
    profileApproveSwitch.addEventListener('change', function(){ 
      // update doc
      console.log(profileApproveSwitch.dataset.id); 
      // update user doc with key val
      updateUserDoc(profileApproveSwitch.dataset.id, "profileApproved", profileApproveSwitch.checked); // problem
    });
  }
}



function updateApproval(uid, val) {
  // update user doc with key val
  updateUserDoc(uid, "approved", val); // problem
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
  // submit login
  const loginForm = document.querySelector('.login');
  loginForm.addEventListener('submit', signInAdmin);
  
  // remember password if checked
  const rememberMe = document.querySelector('.form-check-input');
  const fields = document.querySelectorAll('input[type="password"]');
  for (var i = 0; i < fields.length; i++) {
    if (rememberMe.checked) {
      fields[i].autocomplete="on";
    } else {
      fields[i].autocomplete="off";
    }
  }
};

// GRADUATE / USER PAGE
if (page == "graduates") {
  console.log("graduate page");
  getAllUserData(getParam(), function(userData){
    //console.log("user data:", userData);
    createUserList(userData);
  });

};






















import header from './header.html'
import footer from './footer.html'
document.getElementById("header").innerHTML = header;
document.getElementById("footer").innerHTML = footer;


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, getDocs, addDoc, deleteDoc, doc, query, where, orderBy, getDoc, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';
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

//*****************************************
// sign up user
function signUpUser(e) {
  e.preventDefault();
  let email = signupForm.email.value;
  let password = signupForm.password.value;
  createUserWithEmailAndPassword(auth, email, password)
      .then(function(cred){
        console.log('user created:', cred.user);
        // create doc for user
        createUserDoc(cred.user.uid, email);
        signupForm.reset();
      })
      .catch(function(err) {
        console.log(err.message);
      });
}

// create doc for user
function createUserDoc(uid, userEmail) {
  console.log(uid, userEmail);
  setDoc(doc(db, "users", uid), {
    forename: signupForm.forename.value,
    surname: signupForm.surname.value,
    studentid: signupForm.studentid.value,
    course: signupForm.course.value,
    graduation: signupForm.graduation.value,
    email: userEmail,
    phone: signupForm.phone.value,
    createdAt: serverTimestamp(),
    approved: 'false'
  })
  .then(function(){
    console.log("successfully created");
    // go to add profile on completion
    window.location.href = "add-profile.html";
  });
}

// Sign-out
function signOutUser(e) {
  // Sign out of Firebase.
  e.preventDefault();
  signOut(auth)
    .then(function(){
      console.log("Signed out");
    })
}

// login
function signInUser(e) {
  e.preventDefault();
    let email = loginForm.email.value;
    let password = loginForm.password.value;
    signInWithEmailAndPassword(auth, email, password)
      .then(function(cred){
        console.log("Signed in", cred.user);
        loginForm.reset();
        // go to profile page
        
      })
}


// on login state change
onAuthStateChanged(auth, function(user) {
  if (user) {
      // User logged in already or has just logged in.
      console.log(user.uid, user.email, "logged in");
      showSignedInUser(user.email);
    } else {
      // User not logged in or has just logged out.
      console.log("logged out");
      showSignedOutUser();
    }
})

//*****************************************
// user functions
// 
// retrieve and update user data 
function getUserData(uid){
  // match a single doc in the collection
  const docRef = doc(db, 'users', uid);
  // subscribe to changes in that doc
  onSnapshot(docRef, function(doc){
    console.log(doc.data());
    // add to DOM
    let userData = "";
    for (const [key, value] of Object.entries(doc.data())) {
      userData += key+": "+value+"</br>";
    }
    userSection.innerHTML = userData;
  })
}

// Returns the signed-in user's email 
function getCurrentUserEmail(){
  return auth.currentUser.email;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!auth.currentUser;
}


// Returns the signed-in user's uid.
async function getUserUid() {
  const id = await auth;
  return id;
}


async function getCurrentUserName(uid) {
  // match a single doc in the collection
  //let uid = 'SI3PcDZK8LRPhuugHP91SixwrGt1';//auth.currentUser.uid;
  const docRef = doc(db, 'users', uid);
  const singleDoc = await getDoc(docRef);

  if (singleDoc.exists()) {
    console.log("Document data:", singleDoc.data());
    return singleDoc.data().forename;
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
  }
  /*getDoc(docRef)
  .then(function(doc){
    console.log(doc.data(), doc.id);
  })*/
}

// add user data to the user's doc
/*function addUserData(e) {
  const colRef = collection(db, 'users');
  e.preventDefault();
  let uid = getUserUid();
  // create tags array
  let tagList = addUserDataForm.tags.value.trim().split(",");
  console.log(tagList);
  // add form vals
  setDoc(doc(db, "users", uid), {
      name: addUserDataForm.name.value,
      bio: addUserDataForm.bio.value,
      tags: tagList
    }, { merge: true })
    .then(function(){
          addUserDataForm.reset();
      });
}*/

//******
// generic functions
// 
// get all users data
function getAllUserData(tag, fn) {
  // collection ref - in this case users
  const colRef = collection(db, 'users');
  // query
  let q = colRef;
  if (tag != undefined) {
    console.log(tag);
    q = query(colRef, where("tags", "array-contains", tag));
  };
  // get real time collection data - subscribe / listen to / runs on data change
  onSnapshot(q, function(snapshot){ // could use query orderByDate instead colRef
    let usersCollection = [];
      for (let i = 0; i < snapshot.docs.length; i++) {
        let user = snapshot.docs[i].data();
        usersCollection.push(user);
    }
    console.log(usersCollection);
    fn(usersCollection); // callback to 'return' result
  });

}

// get query string tag
function getTag() {
  const urlParams = new URLSearchParams(location.search);
  for (const [key, value] of urlParams) {
      console.log(`${key}:${value}`);
      return value; // only works with one param at the mo
  }
}


//===========DOM FUNCTIONS===================
function displayAllUserData(usersCollection) {
  let userData = "";
  for (var i = 0; i < usersCollection.length; i++) {
    for (const [key, value] of Object.entries(usersCollection[i])) {
      if (key == "tags") {
        for (var j = 0; j < value.length; j++) {
          let params = new URLSearchParams({tag: value[j]});
          let urlParam = params.toString();
          userData += '<a href="index.html?'+params+'">'+value[j]+'</a> ';
        };
        userData += "</br>";
      }
      else {
        userData += key+": "+value+"</br>";
      }
      //userData += key+": "+value+"</br>";
    }
    userData += "<br>";
  };
  
  allUserData.innerHTML = userData;
}

// show signed in user
function showSignedInUser(user) {
  if(signInLink) {
      signInLink.style.display = 'none';
      signedInLink.style.display = 'initial';
      signedInLink.innerHTML = 'Signed In:<br>'+user;
      logOut.style.display = 'initial';
  }
}

// show signed out user
function showSignedOutUser() {
  if(signedInLink) {
      signInLink.style.display = 'initial';
      signedInLink.style.display = 'none';
      logOut.style.display = 'none';
  }
}

//add-profile page
/*function showSignedInName() {

}*/

//===========DOM ELEMENTS===================
const logOut = document.querySelector('.sign-out');
const loginForm = document.querySelector('.login');
const signupForm = document.querySelector('.signup');
const userSection = document.querySelector('.user-data');
const addUserDataForm = document.querySelector('.add-user-data');
const allUserData = document.querySelector('.all-user-data');
const signInLink = document.querySelector('.dropdown-item.sign-in');
const signedInLink = document.querySelector('.dropdown-item.signed-in');
const signedInName = document.querySelector('.welcome-name');


//===========EVENT LISTENERS===================

// general
if (logOut) {
  logOut.addEventListener('click', signOutUser);
}

if (loginForm) {
  loginForm.addEventListener('submit', signInUser);
}
if (signupForm) {
  signupForm.addEventListener('submit', signUpUser);
}
//addUserDataForm.addEventListener('submit', addUserData);


// show name on page load on add-profile page
onAuthStateChanged(auth, function(user) {
  if (user) {
      // User logged in already or has just logged in.
      console.log(user.uid, "user x logged in");
      getCurrentUserName(user.uid).then(function(vals){
        if (signedInName) {
          signedInName.innerHTML = vals;
        }
      });
    } 
})

// add listeners if dom element present
window.addEventListener('DOMContentLoaded', function(){
  //getTag();
  if(allUserData) {
    getAllUserData(getTag(), function(userData){
      displayAllUserData(userData);
    });
  }

});

console.log('hello from index.js tucked at the bottom');
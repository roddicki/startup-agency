
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



export function loadCheck(){
	console.log("firebase functions loaded...");
}

//*******************************************
//===============Firebase functions==========

//*****************************************
// firebase general user functions

// sign up user
export function signUpUser(e) {
  e.preventDefault();
  const signupForm = document.querySelector('.signup');
  let email = signupForm.email.value;
  let password = signupForm.password.value;
  createUserWithEmailAndPassword(auth, email, password)
      .then(function(cred){
        console.log('user created:', cred.user);
        // create doc for user
        createUserDoc(cred.user.uid, email);
      })
      .catch(function(err) {
        console.log(err.message);
      });
}


// create doc for user
export function createUserDoc(uid, userEmail) {
  console.log(uid, userEmail);
  const signupForm = document.querySelector('.signup');
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
export function signOutUser(e) {
  // Sign out of Firebase.
  e.preventDefault();
  signOut(auth)
    .then(function(){
      console.log("Signed out");
      // go to add profile on completion
      window.location.href = "index.html";
    })
}


// login
export function signInUser(e) {
  e.preventDefault();
  const loginForm = document.querySelector('.login');
  let email = loginForm.email.value;
  let password = loginForm.password.value;
  signInWithEmailAndPassword(auth, email, password)
    .then(function(cred){
      console.log("Signed in", cred.user.uid);
      loginForm.reset();
      // go to profile page
      window.location.href = "profile.html?id="+cred.user.uid;
    })
}

// retrieve user data - single doc in the collection
export async function getUserData(uid) {
  const docRef = doc(db, 'users', uid);
  const singleDoc = await getDoc(docRef);
  if (singleDoc.exists()) {
    //console.log("requested document exists:", singleDoc.data());
    return singleDoc.data();
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
  }
}

// get profile data for signed in user
/*export async function getCurrentUserDetails(uid) {
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
}*/

// Returns the signed-in user's email 
export function getCurrentUserEmail(){
  return auth.currentUser.email;
}

// Returns true if a user is signed-in.
export function isUserSignedIn() {
  return !!auth.currentUser;
}

// Returns the signed-in user's uid. // does not work on page load // unreliable
export function getUserUid() {
  // on login state change
  onAuthStateChanged(auth, function(user) {
    if (user) {
        // User logged in already or has just logged in.
        console.log(user.uid, "current use id");
      } 
  })
}

//*****************************************
// firebase general  functions

// get all current jobs and order by deadline date
export function getAllJobData(fn) {
  // collection ref - in this case books
  const colRef = collection(db, 'jobs');

  // example of how to order by date
  const orderByDate = query(colRef, orderBy('deadline'))

  // get collection data - only runs on page load / refresh
  // getDocs(colRef)
  getDocs(orderByDate)
    .then(function(snapshot) {
      //console.log(snapshot.docs);
      let jobCollection = [];
      for (let i = 0; i < snapshot.docs.length; i++) {
        let job = snapshot.docs[i].data();
        job.id = snapshot.docs[i].id;
        jobCollection.push(job);
      }
      fn(jobCollection)
    })
    .catch(function(err) {
      console.log(err.message);
    });
}


// get single job details - - only runs on page load / refresh
export function getSingleJob (id, fn) {
  // match a single doc in the collection
  const docRef = doc(db, 'jobs', id);
  // get that doc once
  getDoc(docRef)
    .then(function(doc){
      //console.log(doc.data(), doc.id);
      fn(doc.data());
    })
    .catch(function(err) {
      console.log(err.message);
    });
}


// get all users data
export function getAllUserData(tag, fn) {
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
        user.id = snapshot.docs[i].id;
        usersCollection.push(user);
    }
    console.log(usersCollection);
    fn(usersCollection); // callback to 'return' result
  });
}
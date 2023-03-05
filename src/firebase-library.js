
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { getFirestore, collection, onSnapshot, getDocs, addDoc, deleteDoc, doc, query, where, orderBy, getDoc, serverTimestamp, updateDoc, setDoc,  Timestamp, arrayUnion} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';

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
  const signupForm = document.querySelector('.reg-form2');
  let email = signupForm.email.value;
  let password = signupForm.password.value;
  let emailWelcomeSubject = "Welcome to the Stiwdio Agency";
  let emailWelcomeMsg = "<p><strong>Thank you for signing up with the Stiwdio Agency</strong> - paid, degree-related work is at your fingertips.<br>Once your details have been approved, our admin will be in touch with the final steps...</p><p>In the meantime, please verify your email. And feel free to edit your profile to ensure you have your best portfolio pieces on show.</p><p>For more info on how to change your details and what you can upload, check out our 'how it works' section</p><p>All the best, and keep creating!<br>The Stiwdio Agency team</p>";
  createUserWithEmailAndPassword(auth, email, password)
    .then(function(cred) {
      console.log('user created:', cred.user);
      // send email verification
      sendEmailVerification(auth.currentUser);
      return cred;
    })
    .then(function(cred) {
      // Email verification sent!
      console.log('Email verification sent!');
      // create doc for user
      createUserDoc(cred.user.uid, email);
      return email;
    })
    .then(function(email){
      createSentEmailDoc(email, "noreply@startupagency.wales", emailWelcomeMsg, emailWelcomeSubject);
    })
    .catch(function(err) {
      console.log(err.message);
      if (err.message.includes("email-already-in-use")) {
        document.querySelector("#register-modal2 .alert-danger").innerHTML += "Email already in use, please try another or reset your password";
      }
      else {
        document.querySelector("#register-modal2 .alert-danger").innerHTML += "Error registering, please try again or contact us";
      }
      document.querySelector("#register-modal2 .alert-danger").removeAttribute("hidden");
    });
}


// create doc for user
export function createUserDoc(uid, userEmail) {
  console.log(uid, userEmail);
  const signupForm = document.querySelector('.reg-form1');
  const emailNewSignupMsg = "<h2>Auto-generated email from the Stiwdio Agency</h2><p>"+signupForm.forename.value+" "+signupForm.surname.value+", "+userEmail+" has registered with the Stiwdio Agency</p><p>Please approve them (log in as admin) <a href='https://studio-freelancer-agency.web.app/admin/userinfo.html?id="+uid+"'>https://studio-freelancer-agency.web.app/admin/userinfo.html?id="+uid+"</a></p>";
  //console.log(signupForm.forename.value, signupForm.surname.value, signupForm.studentid.value, signupForm.coursename.value, signupForm.graduation.value);
  setDoc(doc(db, "users", uid), {
    forename: signupForm.forename.value,
    surname: signupForm.surname.value,
    studentid: signupForm.studentid.value,
    course: signupForm.coursename.value,
    graduation: signupForm.graduation.value,
    email: userEmail,
    createdAt: serverTimestamp(),
    approved: false
  })
  .then(function(){
    console.log("successfully created");
    // send email to admin
    createSentEmailDoc("stiwdiofreelanceragency@gmail.com", "noreply@startupagency.wales", emailNewSignupMsg, "New Registration with the Stiwdio Agency");
    // go to add profile on completion
    window.location.href = "edit-profile.html?id="+uid+"&intro=true";
  });
}

// update doc for user
export function updateUserDoc(uid, key, val) {
  //console.log(uid, key, val);
  // create key val update
  let updateKeyVal = {};
  updateKeyVal[key] = val;
  updateDoc(doc(db, "users", uid), updateKeyVal)
  .then(function(){
    console.log("successfully updated user doc");
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
      window.location.href = "profile.html?id="+cred.user.uid+"&preview=true";
    })
    .catch(function(err) {
      console.log(err.message);
      document.querySelector("#signInModal .alert-danger").removeAttribute("hidden");
    });

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



// returns password reset link
export function resetPassword(email) {
  const forgotModal1 = bootstrap.Modal.getInstance(document.querySelector('#forgot-pass'));
  const forgotModal2 = new bootstrap.Modal(document.querySelector('#forgot-pass-success'));
  sendPasswordResetEmail(auth, email)
  .then(function() {
    // Password reset email sent!
    console.log("email sent");
    forgotModal1.hide();
    forgotModal2.show();
  })
  .catch(function(error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(error.message);
    document.querySelector("#forgot-pass .alert-danger").innerHTML += "Email not found, Please try another email";
    document.querySelector("#forgot-pass .alert-danger").removeAttribute("hidden");
  });
}

//*****************************************
// firebase general  functions

// SEND EMAIL FUNCTIONS
// create doc to send email // this uses a a google cloud function to auto send a a mail onCreate() // see functions > index.js
export async function createSentEmailDoc(to, from, msg, subject){
  // add doc to collection
  addDoc(collection(db, "sentmails"), {
    to: to,
    from: from,
    subject: subject,
    message: msg
  })
}


// get all current jobs and order by application deadline date
export function getAllCurrentJobData(sort, fn) {
  // collection ref - in this case books
  const colRef = collection(db, 'jobs');
  const dateNow = new Date();
  // find and sort jobs that have an application deadline in the future
  let orderByDate = query(colRef, where('applicationdeadline', '>', dateNow), orderBy('applicationdeadline'));

  // get collection data - only runs on page load / refresh
  // getDocs(colRef)
  getDocs(orderByDate)
    .then(function(snapshot) {
      let jobCollection = [];
      for (let i = 0; i < snapshot.docs.length; i++) {
        let job = snapshot.docs[i].data();
        job.id = snapshot.docs[i].id;
        if (job.approved) {
          jobCollection.push(job);
        }
      }
      // sort results based on incoming parameter
      let sortedArr = jobCollection;
      if (sort == 'oldest') {
        sortedArr = jobCollection.sort(
          (objA, objB) => Number(objA.createdAt) - Number(objB.createdAt),
        );
      }
      else if (sort == 'recent') {
        sortedArr = jobCollection.sort(
          (objA, objB) => Number(objB.createdAt) - Number(objA.createdAt),
        );
      }
      else {
        sortedArr = jobCollection;
      }  
      fn(sortedArr);
    })
    .catch(function(err) {
      console.log(err.message);
    });
}

// get all jobs and order by createdAt date
export function getAllJobData(fn) {
  // collection ref - in this case books
  const colRef = collection(db, 'jobs');

  // example of how to order by date
  const orderByDate = query(colRef, orderBy('createdAt'))

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

// update doc for user
export function updateJobDoc(uid, key, val) {
  //console.log(uid, key, val);
  // create key val update
  let updateKeyVal = {};
  updateKeyVal[key] = val;
  updateDoc(doc(db, "jobs", uid), updateKeyVal)
  .then(function(){
    console.log("successfully updated user doc");
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
    //console.log(usersCollection);
    fn(usersCollection); // callback to 'return' result
  });
}

// get random docs
export async function getRandomDocs(n){
  let docs = [];
  // get all uids & data
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc) => {
    // add doc if approved
    if (doc.data().approved) {
      let obj = {}
      obj.id = doc.id;
      let merged = {...obj, ...doc.data()};
      docs.push(merged);
    }
  })
  console.log("docs.length", docs.length)
  if (docs.length < n) {
    n = docs.length;
  }
  // get n random docs
  const shuffled = docs.sort(() => 0.5 - Math.random());
  let selected = shuffled.slice(0, n);
  return selected;
}









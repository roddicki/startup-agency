import header from './header.html'
import footer from './footer.html'
document.getElementById("header").innerHTML = header;
document.getElementById("footer").innerHTML = footer;


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes } from "firebase/storage";

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

//*******************************************
//===============Firebase functions==========
// sign up user
function signUpUser(e) {
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
function createUserDoc(uid, userEmail) {
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
function signOutUser(e) {
  // Sign out of Firebase.
  e.preventDefault();
  signOut(auth)
    .then(function(){
      console.log("Signed out");
      // go to add profile on completion
      window.location.href = "index.html";
    })
}

// >> TO DO - go to profile page 
// login
function signInUser(e) {
  e.preventDefault();
  const loginForm = document.querySelector('.login');
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
      currentUserData.uid = user.uid;
      currentUserData.email = user.email;
    } else {
      // User not logged in or has just logged out.
      console.log("logged out");
      showSignedOutUser();
    }
})

//*****************************************
// firebase general user functions
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

//*****************************************
// firebase generic functions
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


// get all current jobs and order by deadline date
function getAllJobData(fn) {
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
function getSingleJob (id, fn) {
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


// get query string tag
function getParam() {
  const urlParams = new URLSearchParams(location.search);
  for (const [key, value] of urlParams) {
      //console.log(`${key}:${value}`);
      return value; // only works with one param at the mo
  }
}

// create doc for job 
function createJobDoc(tags) {
  const jobDetailsForm = document.querySelector('.jobDetails');
  let jobDeadline = new Date(jobDetailsForm.deadline.value);
  let applicationDeadline = new Date(jobDetailsForm.applicationdeadline.value);
  addDoc(collection(db, "jobs"), {
    forename: jobDetailsForm.forename.value,
    surname: jobDetailsForm.surname.value,
    company: jobDetailsForm.company.value,
    email: jobDetailsForm.email.value,
    phone: jobDetailsForm.phone.value,
    title: jobDetailsForm.title.value,
    shortdescription: jobDetailsForm.shortdescription.value,
    longdescription: jobDetailsForm.longdescription.value,
    budget: jobDetailsForm.budget.value,
    deadline: Timestamp.fromDate(jobDeadline),
    applicationdeadline: Timestamp.fromDate(applicationDeadline),
    tc: jobDetailsForm.tc.checked,
    tags: tags,
    createdAt: serverTimestamp(),
    approved: false
  })
  .then(function(){
    alert("Placeholder alert box. This will probably be a modal or overlay...tbc... Thank you "+ jobDetailsForm.forename.value +". Your job "+ jobDetailsForm.title.value +" has been successfully submitted");
    console.log("successfully created new job");
    // go to add profile on completion
    //window.location.href = "index.html";
  });
}





//===========================================
//===========================================
//===========DOM FUNCTIONS===================



// show all jobs - jobs page
function displayAllJobs (jobCollection) {
  for (var i = 0; i < jobCollection.length; i++) {
  	if (jobCollection[i].approved) {
  		let date = new Date(jobCollection[i].deadline.seconds*1000);
  	
	  	let card = document.createElement("div");
	  	card.className = "card";

	  	let cardBody = document.createElement("div");
	  	cardBody.className = "card-body";

	  	let title = document.createElement("h5");
	  	title.className = "card-title";
	  	title.innerHTML = jobCollection[i].title;

	  	let subtitle = document.createElement("h6");
	  	subtitle.className = "card-subtitle mb-2 text-muted";
	  	subtitle.innerHTML = "£"+jobCollection[i].budget;

	  	let deadline = document.createElement("p");
	  	deadline.className = "card-text";
	  	deadline.innerHTML = date.toDateString();

      let descriptionText = jobCollection[i].shortdescription;
      let shortenedText = descriptionText.substring(0, 75); // 75 chars
	  	let shortdescription = document.createElement("p");
	  	shortdescription.className = "card-text";
	  	shortdescription.innerHTML = shortenedText;

      let link = document.createElement("a");
      link.className = "btn btn-primary stretched-link";
      link.href="job-details.html?id=" + jobCollection[i].id;
      link.innerHTML = "More..."

	  	cardBody.appendChild(title);
	  	cardBody.appendChild(subtitle);
	  	cardBody.appendChild(deadline);
	  	cardBody.appendChild(shortdescription);
      cardBody.appendChild(link);
	  	card.appendChild(cardBody);

	  	document.querySelector(".all-job-data").appendChild(card);
  	}
  }
  console.log(jobCollection);
}

// display single job
function displaySingleJob(jobData) {
  console.log(jobData);
  let date = new Date(jobData.deadline.seconds*1000);
    
  let card = document.createElement("div");
  card.className = "card";

  let cardBody = document.createElement("div");
  cardBody.className = "card-body";

  let title = document.createElement("h5");
  title.className = "card-title";
  title.innerHTML = jobData.title;

  let subtitle = document.createElement("h6");
  subtitle.className = "card-subtitle mb-2 text-muted";
  subtitle.innerHTML = "£"+jobData.budget;

  let deadline = document.createElement("p");
  deadline.className = "card-text";
  deadline.innerHTML = date.toDateString();

  let description = document.createElement("p");
  description.className = "card-text";
  description.innerHTML = jobData.longdescription;;


  cardBody.appendChild(title);
  cardBody.appendChild(subtitle);
  cardBody.appendChild(deadline);
  cardBody.appendChild(description);
  card.appendChild(cardBody);

  document.querySelector(".single-job-data").appendChild(card);
}


// show all user data - this is the basis for the front page
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

// ======CREATE AND EDIT PROFILE FUNCTIONS======
// show profile preview
function buildPreview(){
  const profileForm = document.querySelector('.addbio');
  const gallery = document.querySelector('.gallery');
  const bio = document.querySelector('.bio');
  const link = document.querySelector('.link');
  const userData = document.querySelector('.user-data');
  const imageDivs = document.querySelectorAll('.uploaded-image');
  gallery.innerHTML = "";

  for (var i = 0; i < imageDivs.length; i++) {
    let image = document.createElement('img');
    image.src = imageDivs[i].querySelector('img').src;
    image.className = 'img-fluid';
    image.style = 'width:25%;padding:10px;';
    
    gallery.appendChild(image);
  }

  bio.innerHTML = profileForm.bio.value;
  link.innerHTML = profileForm.website.value;
  let data = "";
  for (const property in currentUserData) {
    data += `${property}: ${currentUserData[property]}<br>`
  }
  userData.innerHTML = data;
}

// get image urls - return an object with all the user image urls to upload
function getImageUrls(e) {
  e.preventDefault();
  const imageDivs = document.querySelectorAll('.uploaded-image');

  let images = {};

  for (var i = 0; i < imageDivs.length; i++) {
  	console.log(imageDivs[i].querySelector('img').src);
    let blobUrl = imageDivs[i].querySelector('img').src;
    let fileSuffix = ".png";
  	let uploadUrl = "images/"+currentUserData.uid+ "/img-" + i + fileSuffix;

  	/*let myRequest = new Request(blobUrl);
  	// get blob file type from url and change suffix
    fetch(blobUrl)
      .then((response) => response.blob())
      .then(function(blob) {
	      	if (blob.type.includes('jpeg')) {
	      		fileSuffix = ".jpg";
	      	}
	      	let uploadUrl = "images/"+currentUserData.uid+ "/img-" + i + fileSuffix;
    		// add to object
    		console.log(uploadUrl, blobUrl);
    		images[uploadUrl] = blobUrl;
    		//console.log(images);
      })*/
    console.log(uploadUrl, blobUrl);
    images[uploadUrl] = blobUrl;
  }
  return images; 
}

// upload image - argument is an object - {upload url : blob url}
function uploadImage(urls) {
  console.log(urls);

  let i = 0;

  for (const [uploadUrl, blobUrl] of Object.entries(urls)) {
    console.log(`${uploadUrl}: ${blobUrl}`);
    let myRequest = new Request(blobUrl);
    i++;
    fetch(blobUrl)
      .then((response) => response.blob())
      .then(function(blob) {
        console.log(blob.type);
        return blob.type;
        // upload
        /*const storageRef = ref(storage, uploadUrl);
        // 'file' comes from the Blob or File API
        uploadBytes(storageRef, blob).then(function(snapshot) {
          console.log('Uploaded a blob or file!');
          // update user data with image urls
          let docRef = doc(db, 'users', currentUserData.uid);

          updateDoc(docRef, {
            images: arrayUnion(uploadUrl)
          })
        })
        .then(function () {
          console.log("upload complete");
        })
        .catch(function(err) {
          console.log(err.message);
        });*/

      })
  }
}

// ======POST JOB FUNCTIONS======
// create tag checkboxes
function createTagCheckboxes() {
  let checkboxContainer = document.querySelector("#tag-checkboxes");
  for (var i = 0; i < tags.length; i++) {
    let str = tags[i].replaceAll("-", ' ');
    let val = tags[i].toLowerCase();
    let div = document.createElement("div");
    div.className = "form-check";

    let checkbox = document.createElement("input");
    checkbox.className = "form-check-input tag";
    checkbox.type = "checkbox";
    checkbox.value = val;
    checkbox.dataset.label = tags[i];
    checkbox.name = "tag"+tags[i];
    checkbox.id = "tag"+tags[i];
    checkbox.onchange = addTagBadge;

    let label = document.createElement("label");
    label.className = "form-check-label";
    label.for = "tag"+tags[i];
    label.innerHTML = str;

    div.appendChild(checkbox);
    div.appendChild(label);

    checkboxContainer.appendChild(div);
  }
}

// add tag badge on change
function addTagBadge(){
  const tagList = document.querySelector('#tag-list');
  let name = this.dataset.label;
  let checkbox = document.querySelector("input[data-label='"+name+"']");
  let badge;
  if (!checkbox.checked) {
    // remove tag
    badge = document.querySelector("span[data-label='"+name+"']");
    if (badge) {
      badge.remove();
    }
  }
  else {
    // create tag
    badge = document.createElement("span");
    //badge.href = "#";
    badge.className = "badge rounded-pill bg-secondary";
    badge.style = "margin: 3px;"
    badge.dataset.label = name;
    badge.innerHTML = name.replaceAll("-", ' ');

    tagList.appendChild(badge);
  }
}


// show hide / next - prev sections of the 'post a job' form to create multiple steps
function showHide(evt) {
	evt.preventDefault();
	const yourDetails = document.querySelector('.your-details');
  	const jobDetails = document.querySelector('.job-details');
  	const jobSummary = document.querySelector('.job-summary');
	
	if (this.className.includes('show-job-details')) {
		yourDetails.style.display = "none";
		jobDetails.style.display = "initial";
	} 
	else if (this.className.includes('show-your-details')) {
		yourDetails.style.display = "initial";
		jobDetails.style.display = "none";
	} 
	else if (this.className.includes('back-job-details')) {
		jobDetails.style.display = "initial";
		jobSummary.style.display = "none";
	}
	else if (this.className.includes('show-summary')) {
		jobDetails.style.display = "none";
		jobSummary.style.display = "initial";
	} 
}

// return checked tags
function getTags(){
  let tags = [];
  // get tags
  const tagCheckboxes = document.querySelector('#tag-checkboxes').getElementsByTagName('input');
  for (var i = 0; i < tagCheckboxes.length; i++) {
    if (tagCheckboxes[i].checked) {
      tags.push(tagCheckboxes[i].value);
    }
  }
  return tags;
}

// return job form elements
function getJobForm() {
  const jobDetailsForm = document.querySelector('.jobDetails');
  let formValues = "";
  for (let i = 0; i < jobDetailsForm.length; i++) {
    if (jobDetailsForm.elements[i].type != 'checkbox') {
      formValues += jobDetailsForm.elements[i].name+ " : " +jobDetailsForm.elements[i].value + "<br>";
    }
  }
  return formValues;
}

// create preview of job details
function previewJob(e, tags, formValues) {
  e.preventDefault();
  /*const jobDetailsForm = document.querySelector('.jobDetails');
  let jobDeadline = new Date(jobDetailsForm.deadline.value);
  console.log(jobDeadline);*/
  document.querySelector(".preview").innerHTML = formValues + "tag: " + tags;
}



// enable / disable post job submit btn
function enableSubmitJob() {
  const tc = document.querySelector("#tc");
  console.log(tc.checked);
  if (tc.checked) {
    const submit = document.querySelector('#submit');
    submit.active = true;
    submit.disabled = false;
  } else {
    submit.disabled = true;
  }
}


//===========DOM ELEMENTS===================
// tag categories
const tags = ["Animation", "Visual-Effects", "Graphic-Design", "Games-Design-and-Production", "Video", "Audio-Production", "Journalism", "Photography", "Theatre-Dance"];

const page = document.body.getAttribute('data-page');
const logOut = document.querySelector('.sign-out');
//const loginForm = document.querySelector('.login');
//const signupForm = document.querySelector('.signup');
const userSection = document.querySelector('.user-data');
const addUserDataForm = document.querySelector('.add-user-data');
const allUserData = document.querySelector('.all-user-data');
const signInLink = document.querySelector('.dropdown-item.sign-in');
const signedInLink = document.querySelector('.dropdown-item.signed-in');
const signedInName = document.querySelector('.welcome-name');


//===========EVENT LISTENERS===================

// GENERAL ALL PAGES
if (logOut) {
  logOut.addEventListener('click', signOutUser);
}

// login page
if (page == "login") {
  console.log("login page");
  const loginForm = document.querySelector('.login');
  loginForm.addEventListener('submit', signInUser);

  const signupForm = document.querySelector('.signup');
  signupForm.addEventListener('submit', signUpUser);
};

/*if (loginForm) {
  loginForm.addEventListener('submit', signInUser);
}
if (signupForm) {
  signupForm.addEventListener('submit', signUpUser);
}*/
//addUserDataForm.addEventListener('submit', addUserData);

//===========PAGE SPECIFIC EVENT LISTENERS AND PROCESSES===================
// add listeners if dom element present
window.addEventListener('DOMContentLoaded', function(){
  //getTag();
  if(allUserData) {
    getAllUserData(getParam(), function(userData){
      displayAllUserData(userData);
    });
  }
});


// ADD PROFILE PAGE
if (page == "add-profile") {
  // show name on page load on add-profile page
  onAuthStateChanged(auth, function(user) {
    if (user) {
        // User logged in already or has just logged in.
        console.log("user "+user.uid+" logged in");
        getCurrentUserDetails(user.uid).then(function(vals){
          if (signedInName) {
            signedInName.innerHTML = vals.forename;
          }
        });
      } 
  })

  // show profile preview 
  const previewBtn = document.querySelector('.show-preview');
  previewBtn.addEventListener('click', buildPreview);

  // upload and save
  const uploadBtn = document.querySelector('.save-and-upload');
  //uploadBtn.addEventListener('click', uploadImage); 
  uploadBtn.addEventListener('click', function(e){
  	//console.log(getImageUrls(e));
    // return list of images - blob urls
    let images = getImageUrls(e);
    // for each image get blob type, make upload url
    // upload image, return on success
    // upload image url to user profile
    uploadImage(getImageUrls(e));
  }); 
}


// POST JOB PAGE
if (page == "post-job") {
  console.log("post-job page");

  // creat tag system
  createTagCheckboxes();

  // show hide post a job form
  const showJobDetails = document.querySelector('.show-job-details');
  showJobDetails.addEventListener('click', showHide);
  
  const showYourDetails = document.querySelector('.show-your-details');
  showYourDetails.addEventListener('click', showHide);
  
  const showSummary = document.querySelector('.show-summary');
  showSummary.addEventListener('click', showHide);
  // preview job listing
  showSummary.addEventListener('click', function (e) {
    previewJob(e, getTags(), getJobForm());
  });

  // go back
  const backJobDetails = document.querySelector('.back-job-details');
  backJobDetails.addEventListener('click', showHide);

  // allow submission after tc checked
  const tc = document.querySelector("#tc");
  tc.addEventListener('change', enableSubmitJob);

  // submit job to db
  const submitJob = document.querySelector('.submit-job-details');
  submitJob.addEventListener('click', function (e) {
    e.preventDefault();
    createJobDoc(getTags());
  });
}

// JOB BOARD PAGE
if (page == "jobs") {
  console.log("jobs page");
  // get and show all jobs
  getAllJobData(function(jobData){
    displayAllJobs(jobData);
  });
}

// JOB DETAILS PAGE
if (page == "job-details") {
  console.log("job details page");
  // get and show all jobs
  console.log(getParam());
  getSingleJob(getParam(), function(jobData){
    displaySingleJob(jobData);
  });
}




console.log('hello from index.js tucked at the bottom');
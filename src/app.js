
import {loadCheck, signUpUser, signOutUser, signInUser, getUserData, getCurrentUserEmail, createUserDoc, isUserSignedIn, getUserUid, getAllJobData, getAllCurrentJobData, getSingleJob, getAllUserData} from './firebase-library.js';

loadCheck();

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, connectStorageEmulator } from "firebase/storage";

import { getFirestore, collection, onSnapshot, getDocs, addDoc, deleteDoc, doc, query, where, orderBy, getDoc, serverTimestamp, updateDoc, setDoc,  Timestamp, arrayUnion, connectFirestoreEmulator} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPhoneNumber, ActionCodeURL } from 'firebase/auth';

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
let currentJobData = {};


// on login state change
onAuthStateChanged(auth, function(user) {
  if (user) {
      // User logged in already or has just logged in.
      console.log(user.uid, user.email, "logged in");
      currentUserData.uid = user.uid;
      currentUserData.email = user.email;
      getCurrentUserDetails(user.uid).then(function(vals){
        showSignedInUser(user.email, user.uid, vals.forename, vals.surname);
      });
    } else {
      // User not logged in or has just logged out.
      console.log("logged out");
      showSignedOutUser();
    }
})


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

// SEND EMAIL FUNCTIONS
// create doc to send email // this uses a a google cloud function to auto send a a mail onCreate() // see functions > index.js
async function createSentEmailDoc(to, from, msg){
  const modalHelp = new bootstrap.Modal(document.querySelector('#help'));
  const modalThankYou = new bootstrap.Modal(document.querySelector('#help-thank-you'));
  // add doc to collection
  addDoc(collection(db, "sentmails"), {
    to: to,
    from: from,
    message: msg
  })
}

// get form values to send help email 
function getHelpFormValues() {
  const helpForm = document.querySelector('.post-job-form2');
  let formValues = {};
  formValues.message = "<b>Name:</b> " + helpForm.helpForename.value + " " + helpForm.helpSurname.value + " <br><b>Message:</b> " + helpForm.helpDesc.value;
  formValues.from = helpForm.helpEmail.value;
  formValues.to = "stiwdiofreelanceragency@gmail.com";
  return formValues;
}

// confirm email sent - change spinner and message on help-thank-you / confirmation modal
function emailSentConfirmation() {
  console.log("sent email");
  const message = document.querySelector("#help-thank-you .modal-title");
  message.innerHTML = "Your message has been sent";
  const spinner = document.querySelector("#help-thank-you .sending-spinner");
  spinner.style.display = "none";
  const thankYouTick = document.querySelector("#help-thank-you  .sent-thank-you-tick");
  thankYouTick.style.display = "inline";
}

// POST A JOB FUNCTIONS
// create doc for job 
function createJobDoc() {
  const jobDetailsForm0 = document.querySelector('.post-job-form0');
  //console.log(jobDetailsForm0.firstname.value, jobDetailsForm0.lastname.value, jobDetailsForm0.email.value, jobDetailsForm0.phone.value);
  const jobDetailsForm1 = document.querySelector('.post-job-form1');
  //console.log(jobDetailsForm1.title.value, jobDetailsForm1.company.value, jobDetailsForm1.budgetRadio.checked, jobDetailsForm1.budget.value, jobDetailsForm1.hourlyRadio.checked, jobDetailsForm1.rate.value, jobDetailsForm1.applicationDeadline.value, jobDetailsForm1.location.value, jobDetailsForm1.remoteRadio.checked, jobDetailsForm1.completionRadio.value,  jobDetailsForm1.completionDate.value, jobDetailsForm1.durationRadio.checked, jobDetailsForm1.duration.value, jobDetailsForm1.jobBrief.value);

  let completionDate = new Date(jobDetailsForm1.completionDate.value);
  let applicationDeadline = new Date(jobDetailsForm1.applicationDeadline.value);
  let location = jobDetailsForm1.location.value;
  if(jobDetailsForm1.remoteRadio.checked) {
    location = "remote";
  }
  let tags = []; // send to db
  const allTags = document.querySelectorAll(".filtertag.active");
  for (var i = 0; i < allTags.length; i++) {
    // save tags
    tags.push(allTags[i].innerHTML);
  }

  addDoc(collection(db, "jobs"), {
    forename: jobDetailsForm0.firstname.value.toLowerCase(),
    surname: jobDetailsForm0.lastname.value.toLowerCase(),
    company: jobDetailsForm1.company.value.toLowerCase(),
    email: jobDetailsForm0.email.value,
    phone: jobDetailsForm0.phone.value,
    title: jobDetailsForm1.title.value,
    usebudget: jobDetailsForm1.budgetRadio.checked,
    budget: jobDetailsForm1.budget.value,
    usehourly: jobDetailsForm1.hourlyRadio.checked,
    hourlyrate: jobDetailsForm1.rate.value,
    longdescription: jobDetailsForm1.jobBrief.value.replace(/\n\r?/g, '<br>'),
    deadline: Timestamp.fromDate(completionDate),
    duration:jobDetailsForm1.duration.value,
    applicationdeadline: Timestamp.fromDate(applicationDeadline),
    location: location,
    tc: true,
    tags: tags,
    createdAt: serverTimestamp(),
    approved: false
  })
  .then(function(){
    console.log("successfully created new job");
    const thankYou = document.querySelector("#thankYouModal");
    thankYou.innerHTML = "Thank you for your submission!";
    const spinner = document.querySelector(".submitting-spinner");
    console.log(spinner);
    spinner.style.display = "none";
    const thankYouTick = document.querySelector(".thank-you-tick");
    thankYouTick.style.display = "inline";
  });
}



// upload image - argument is an object - {upload url : blob url}
// inserts a reference to the uploaded image/s into the logged in users profile
async function uploadImage(urls) {
  // update user data with image urls
  let docRef = doc(db, 'users', currentUserData.uid);
  // delete image urls from user profile
  updateDoc(docRef, {
    images: []
  })
  .then(function () {
    console.log("deleted image references");
  })

  for (var i = 0; i < urls.length; i++) {
    console.log(urls[i]);
    let uploadUrl = urls[i].url;
    let newImageRef = {};
    newImageRef.url = uploadUrl;
    newImageRef.hero = urls[i].hero;
    newImageRef.caption = urls[i].caption;
    console.log(newImageRef);
    // upload new blob image & upload reference
    if (urls[i].sourceUrl.includes('blob')) {
      let blobUrl = urls[i].sourceUrl;
      console.log(blobUrl);
      let blob = await fetch(blobUrl).then(response => response.blob());
      // upload
      const storageRef = ref(storage, uploadUrl);
      // upload file - 'blob' comes from the Blob or File API
      uploadBytes(storageRef, blob).then(function(snapshot) {
        console.log('Uploaded image blob file!');
        
        // update user profile with image urls
        updateDoc(docRef, {
          images: arrayUnion(newImageRef)
        })
        .then(function () {
          console.log("added new image reference to user profile");
        })
      });
    }
    // existing imgae - upload reference only
    else {
      // update user profile with image urls
      updateDoc(docRef, {
        images: arrayUnion(newImageRef)
      })
      .then(function () {
        console.log("added existing image reference to user profile");
      })
    }
  }

}


// add to profile 
function addToProfile(e, tags) {
  e.preventDefault()
  const profileForm = document.querySelector('.add-profile');
  let bio = profileForm.bio.value.replace(/\n\r?/g, '<br>');
  let docRef = doc(db, 'users', currentUserData.uid);
  //console.log(tags, bio);

  updateDoc(docRef, {
    bio: bio,
    website: profileForm.website.value,
    tags: tags,
    profileCreatedAt: serverTimestamp(),
    profileApproved: false
  })
  .then(function(){
    console.log("successfully added bio and tags to profile");
    // go to profile on completion
    //window.location.href = "index.html";
  });
}





//===========================================
//===========================================
//===========DOM FUNCTIONS===================

// get query by param key
function getParamKey(key) {
  const urlParams = new URLSearchParams(location.search);
  const val = urlParams.get(key)
  return val;
}

// get first query string tag
function getParam() {
  const urlParams = new URLSearchParams(location.search);
  for (const [key, value] of urlParams) {
      //console.log(`${key}:${value}`);
      return value; // only works with one param at the mo
  }
}

// ======SHOW JOB FUNCTIONS======
// validate job help
function validateHelpForm(event) {
  const helpForm = document.querySelector('.post-job-form2');
  const modalHelp = new bootstrap.Modal(document.querySelector('#help'));
  let wasValidated = false;
  console.log("modal help submit clicked");
    if (!helpForm.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      console.log("modal help was-NOT-validated");
    }
    else {
      console.log("modal help was-validated");
      modalHelp.hide();
      wasValidated = true;
      // modalStep3.show();
      //createSentEmailDoc("rod@roddickinson.net", "me@myemail.com", "Here is a message");
    }
    helpForm.classList.add('was-validated');
    return wasValidated;
}

// show all jobs - jobs page
function displayAllJobs (itemsPerPage, page, jobCollection) {
  let jobContainer = document.querySelector(".all-job-data");
  jobContainer.innerHTML = "";
  // display total jobs available
  let jobCount = document.querySelector(".jobs-available");
  jobCount.innerHTML = "AVALABLE JOBS ("+jobCollection.length+")";


  // get initial start and end items 
  let start = 0;
  let end;
  if (itemsPerPage < jobCollection.length) {
    end = itemsPerPage;
  }
  else {
    end = jobCollection.length;
  }
  // get start and end items for each page if using ?page=x param
  if(page) {
    page = page -1;
    start = page * itemsPerPage;
    end = start + itemsPerPage;
    if (start + itemsPerPage > jobCollection.length) {
      end = jobCollection.length; 
    }
  }

  // create cards for each job
  for (var i = start; i < end; i++) {
  	if (jobCollection[i].approved) {
	  	let card = document.createElement("div");
	  	card.className = "col-xl-3 col-lg-4 col-md-6 col-sm-12";

	  	let cardBody = document.createElement("div");
	  	cardBody.className = "jobblock";

	  	let title = document.createElement("h3");
	  	title.innerHTML = "<Strong>"+jobCollection[i].title+"</Strong>";

	  	let subtitle = document.createElement("h5");
      subtitle.innerHTML = jobCollection[i].company;

      let jobDetails = document.createElement("div");
      jobDetails.className = "lineheightjob";

      let cost;
      if(jobCollection[i].budget != null) {
        cost = "£"+jobCollection[i].budget;
      } 
      else if(jobCollection[i].hourlyrate != null){
        cost = jobCollection[i].hourlyrate + " p/h";
      }
      let budget = document.createElement("p");
      budget.innerHTML = "<i class='fa-solid fa-database'></i>  Budget: <strong>"+cost+"</strong>";
      
      let applicationDeadline = new Date(jobCollection[i].applicationdeadline.seconds*1000);
      let applicationDeadlineStr = applicationDeadline.toLocaleString("en-GB", {day: "numeric", month: "numeric", year: "numeric"});
      let applyBy = document.createElement("p");
      applyBy.innerHTML = "<i class='fa-regular fa-clock'></i>  Apply by: <strong>"+applicationDeadlineStr+"</strong>";
      
      let location = document.createElement("p");
      location.innerHTML = "<i class='fa-solid fa-location-dot'></i>  Location: <strong>"+jobCollection[i].location+"</strong>";
      
      let completionVal;
      if(jobCollection[i].deadline != null){
        let completionDate = new Date(jobCollection[i].deadline.seconds*1000);
        completionVal = completionDate.toLocaleString("en-GB", {day: "numeric", month: "numeric", year: "numeric"});
      } else if(jobCollection[i].duration != null){
        completionVal = jobCollection[i].duration + " days";
      }
      let completion = document.createElement("p");
      completion.innerHTML = "<i class='fa-solid fa-arrow-trend-up'></i>  Completion: <strong>"+completionVal+"</strong>";

      jobDetails.appendChild(budget);
      jobDetails.appendChild(applyBy);
      jobDetails.appendChild(location);
      jobDetails.appendChild(completion);

      // job posted at
      let now = new Date();
      let timeSinceCreated;
      // created days / hours / mins ago - 86400s in a day, 3600s in an hr
      let secondsSinceCreation = (now.getTime()/1000) - (jobCollection[i].createdAt.seconds);
      if (secondsSinceCreation/3600 > 24) {
        timeSinceCreated = Math.round(secondsSinceCreation/86400) + " days";
      }
      else if (secondsSinceCreation/60 > 60) {
        timeSinceCreated = Math.round(secondsSinceCreation/3600) + " hours";
      }
      else if (secondsSinceCreation/60 > 1) {
        timeSinceCreated = Math.round(secondsSinceCreation/60) + " mins";
      }
      else {
        timeSinceCreated = "Just now";
      }

      // last row
      let jobFooter = document.createElement("div");
      jobFooter.className = "job-footer";
      let row = document.createElement("div");
      row.className = "row";
      let col1 = document.createElement("div");
      col1.className = "col-8";
      let col2 = document.createElement("div");
      col2.className = "col-4";
      col2.innerHTML = "<p class='timetext'>"+timeSinceCreated+"</p>";
      let link = document.createElement("a");
      link.href="job-details.html?id=" + jobCollection[i].id;
      link.innerHTML = "View more details"
      
      col1.appendChild(link);
      row.appendChild(col1);
      row.appendChild(col2);
      jobFooter.appendChild(row);

	  	cardBody.appendChild(title);
	  	cardBody.appendChild(subtitle);
      cardBody.appendChild(jobDetails);
      cardBody.appendChild(jobFooter);
	  	card.appendChild(cardBody);

      jobContainer.appendChild(card);
  	}
  }
}


// create jobs page pagination links
function createPagination(pageParam, itemsPerPage, jobs) {
  // set forward and previous
  let totalPages = Math.ceil(jobs/itemsPerPage);
  let currentPageNo = parseInt(pageParam);
  let forward;
  if (pageParam && currentPageNo != totalPages) {
    forward = parseInt(pageParam)+1;
  } 
  else if (pageParam && currentPageNo == totalPages) {
    forward = currentPageNo;
  }
  else {
    forward = 2;
  }
  console.log("forward " + forward);
  let previous;
  if (pageParam && currentPageNo != 1) {
    previous = parseInt(pageParam)-1;
  } 
  else {
    previous = 1;
  }
  console.log("previous" + previous);
  
  let nav = document.querySelector(".pagination-nav"); 
  nav.innerHTML = "";
  let paginationUl = document.createElement("ul");
  paginationUl.className = "pagination paginationnav";
  
  // create page links / li elements
  let pageLinksLength = totalPages+2;
  console.log("no of pages", totalPages);

  for (var i = 0; i < pageLinksLength; i++) {  
    // set pagination urls
    let currentUrl = new URL(window.location);  
    let pageLi = document.createElement("li");
    pageLi.className = "page-item";
    let pageLink = document.createElement("a");
    pageLink.className = "page-link";
    // previous
    if(i == 0) {
      pageLink.setAttribute("aria-label", "Previous");
      currentUrl.searchParams.append('page', previous);
      pageLink.href = currentUrl.href;
      pageLink.innerHTML = '<span aria-hidden="true"><i class="fa fa-chevron-left" aria-hidden="true"></i></span>';
    }
    // next
    else if (i == pageLinksLength-1) {
      pageLink.setAttribute("aria-label", "Next");
      currentUrl.searchParams.append('page', forward);
      pageLink.href = currentUrl.href;
      pageLink.innerHTML = '<span aria-hidden="true"><i class="fa fa-chevron-right" aria-hidden="true"></i></span>';
    }
    // page links
    else {
      currentUrl.searchParams.append('page', i);
      pageLink.href = currentUrl.href;
      pageLink.innerHTML = i;
    }
    
    pageLi.appendChild(pageLink);
    paginationUl.appendChild(pageLi);
  }
  // only display if there is more than one page
  if (totalPages > 1) {
    nav.appendChild(paginationUl);
  }
}


// display single job
function displaySingleJob(jobData) {  
  let jobTitle = document.querySelector(".jobboardheader");
  jobTitle.innerHTML = jobData.title;

  let company = document.querySelector(".job-name");
  company.innerHTML = "<strong>"+jobData.company+"</strong>";

  let jobDetails = document.querySelector(".quickjobspec");
  let cost;
  if(jobData.budget != null) {
    cost = "£"+jobData.budget;
  } 
  else if(jobData.hourlyrate != null){
    cost = jobData.hourlyrate + " p/h";
  }
  let budget = document.createElement("p");
  budget.innerHTML = "<i class='fa-solid fa-database'></i>  Budget: <strong>"+cost+"</strong>";
  
  let applicationDeadline = new Date(jobData.applicationdeadline.seconds*1000);
  let applicationDeadlineStr = applicationDeadline.toLocaleString("en-GB", {day: "numeric", month: "numeric", year: "numeric"});
  let applyBy = document.createElement("p");
  applyBy.innerHTML = "<i class='fa-regular fa-clock'></i>  Apply by: <strong>"+applicationDeadlineStr+"</strong>";
  
  let location = document.createElement("p");
  location.innerHTML = "<i class='fa-solid fa-location-dot'></i>  Location: <strong>"+jobData.location+"</strong>";
  
  let completionVal;
  if(jobData.deadline != null){
    let completionDate = new Date(jobData.deadline.seconds*1000);
    completionVal = completionDate.toLocaleString("en-GB", {day: "numeric", month: "numeric", year: "numeric"});
  } else if(jobData.duration != null){
    completionVal = jobData.duration + " days";
  }
  let completion = document.createElement("p");
  completion.innerHTML = "<i class='fa-solid fa-arrow-trend-up'></i>  Completion: <strong>"+completionVal+"</strong>";

  jobDetails.appendChild(budget);
  jobDetails.appendChild(applyBy);
  jobDetails.appendChild(location);
  jobDetails.appendChild(completion);

  let jobDescription = document.querySelector(".job-description");
  jobDescription.innerHTML = jobData.longdescription;;

  let tagContainer = document.querySelector(".tag-container");
  for (var i = 0; i < jobData.tags.length; i++) {
    let tag = jobData.tags[i];
    let tagStr = tag.replace(/-/g, " ");
    let tagBtn = document.createElement("a");
    tagBtn.setAttribute("style", "text-transform: capitalize;");
    tagBtn.className = "btn btn-primary filtertag";
    tagBtn.href = "#";
    tagBtn.innerHTML = tagStr;

    tagContainer.appendChild(tagBtn);
  }
}

// activate apply for this job button
function activateApplyBtn(action){
  let applyBtn = document.querySelector('.apply-btn');
  let warningText = document.querySelector('.warningtext');
  if (action == "activate") {
    applyBtn.removeAttribute('disabled');
    warningText.innerHTML = "";
  } else {
    applyBtn.setAttribute('disabled', '');
    warningText.innerHTML = "<p>Sign in before applying for this job. Only active stwidio members are allowed to apply for the jobs posted on the platform</p>";
  }
}

function validateApplyForJob(event){
  const applyForm = document.querySelector('.apply-form');
  const textfield1 = applyForm.querySelector('#apply-for-job-text1');
  const textfield2 = applyForm.querySelector('#apply-for-job-text2');
  let wasValidated = false;
  // if textfield1 or textfield2 is not valid
  if (!textfield1.validity.valid || !textfield2.validity.valid) {
    event.preventDefault();
    event.stopPropagation();
  } 
  else {
    wasValidated = true;
  }

  applyForm.classList.add('was-validated');
  return wasValidated;
}

// apply for job display user data in modal
function applyForJobAddUserdata(userData) {
  const forename = document.querySelector('#applymodal .forename');
  forename.innerHTML = userData.forename;
  const surname = document.querySelector('#applymodal .surname');
  surname.innerHTML = userData.surname;
  const email = document.querySelector('#applymodal .email');
  email.innerHTML = userData.email;
  const portfolio = document.querySelector('#applymodal .portfolio');
  portfolio.innerHTML = userData.website;
}

console.log(window.location.href);
// apply for job get form values
function getApplyForJobValues(userData, jobData) {
  const how = document.querySelector('#applymodal #apply-for-job-text1');
  const why = document.querySelector('#applymodal #apply-for-job-text2');
  let formValues = {};
  formValues.message = "<h2>Application for job</h2><b>Job</b> " +window.location.href+ "<br><b>Job Title:</b> " +jobData.title+ "<h2>Applicant details</h2><b>Applicant Name:</b> " +userData.forename+ " " +userData.surname+ " <br><b>Applicant Email:</b> " +userData.email+ " <br><b>Applicant Portfolio:</b> " +userData.website+ " <br><h2>Applicant answers</h2><b>How will you approach and deliver this job?:</b><br>" + how.value+ " <br><b>Why are you right for this job?:</b><br>" + why.value;
  formValues.from = userData.email;
  formValues.to = "stiwdiofreelanceragency@gmail.com";
  return formValues;
}

// confirm application sent - change spinner and message on help-thank-you / confirmation modal
function applicationSentConfirmation() {
  console.log("sent application");
  const messageTitle = document.querySelector("#help-thank-you .modal-title");
  messageTitle.innerHTML = "Thank you for your submission!";
  const message = document.querySelector("#help-thank-you .modal-message");
  message.innerHTML = "<p>If your application and stiwdio portfolio are what the client is looking for, we will contact you to set up next steps and connect you to the client.</p><p>If you’re not successful with this one - don’t worry! There will soon be another opportunity to apply for! Keep browsing the job board and check your emails regurarly as we will send matching job briefs to your inbox.</p>";
  const spinner = document.querySelector("#help-thank-you .sending-spinner");
  spinner.style.display = "none";
  const thankYouTick = document.querySelector("#help-thank-you  .sent-thank-you-tick");
  thankYouTick.style.display = "inline";
}


// ======SHOW USER DATA FUNCTIONS======
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
      else if (key == "id") {
        userData += '<a href="profile.html?id='+value+'">see profile</a> ';
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
function showSignedInUser(user, id, forename, surname) {
  // get name

  // get profile pic

  // get profile pic
  const accountDropdown = document.querySelector('.dropdown-menu');
  // edit drop down contents
  const name = document.querySelector('.dropdown-toggle');
  name.innerHTML = forename + " " + surname;


  const dashboardLink = document.querySelector('.dropdown-menu .dashboard');
  dashboardLink.href = 'profile.html?id='+id;

  const portfolioLink = document.querySelector('.dropdown-menu .portfolio');
  portfolioLink.href = 'profile.html?id='+id;

  const accountLink = document.querySelector('.dropdown-menu .account');
  accountLink.href = 'profile.html?id='+id;

  const signoutLink = document.querySelector('.dropdown-menu .sign-out');
  signoutLink.addEventListener('click', signOutUser);
}


// show signed out user
function showSignedOutUser() {
  const profilePic = document.querySelector('.navbar .profile-pic');
  const accountDropdown = document.querySelector('.navbar .dropdown');
  const navbar = document.querySelector('.navbar .navbar-nav');
  // delete drop down contents & profile pic
  profilePic.innerHTML = ""
  accountDropdown.innerHTML = "";
  // create sign in and post job buttons
  let li = document.createElement('li');
  let a = document.createElement('a');
  a.className = 'btn btn-outline-primary sign-in';
  //a.href = 'login.html';
  a.dataset.bsToggle = 'modal';
  a.dataset.bsTarget = '#signInModal';
  a.innerHTML = 'Sign in';
  li.className = 'nav-item pe-3';
  li.appendChild(a);
  navbar.appendChild(li);
  li = document.createElement('li');
  a = document.createElement('a');
  a.className = 'btn btn-primary post-job';
  a.href = '#';
  a.dataset.bsToggle = 'modal';
  a.dataset.bsTarget = '#postmodal';
  a.innerHTML = 'Post job';
  li.className = 'nav-item';
  li.appendChild(a);
  navbar.appendChild(li);
}




// ======CREATE AND EDIT PROFILE FUNCTIONS======

// watch for new uploaded images add edit caption icon
function uploadImageWatcher(){
  const captionImg = document.querySelector('#caption-image');
  // add edit icon to each new upload image
  const observer = new MutationObserver(function(mutations_list) {
    mutations_list.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(added_node) {
        if(added_node.className == 'uploaded-image') {
          let randStr = Math.random().toString(36).substr(2, 5);
          // create hidden input to store caption
          let captionInput = document.createElement('input');
          captionInput.type = 'hidden';
          captionInput.className = 'form-control caption-text';
          captionInput.name = 'caption-'+randStr;
          added_node.appendChild(captionInput);

          // create hidden input to stor hero image
          let heroInput = document.createElement('input');
          heroInput.type = 'hidden';
          heroInput.className = 'form-control hero-image';
          heroInput.name = 'hero-'+randStr;
          added_node.appendChild(heroInput);

          let btn = document.createElement('button');
          btn.className = 'edit-image';
          btn.onclick = function(e) {
            e.preventDefault();
            captionImg.src = this.parentElement.querySelector('img').src;
            document.querySelector('#captionModal #caption').value = captionInput.value;
            document.querySelector('#captionModal #caption').name = 'caption-'+randStr;
            if (heroInput.value == 'true') {
              document.querySelector('#captionModal #hero-image-switch').checked = true;
            } else {
              document.querySelector('#captionModal #hero-image-switch').checked = false;
            }
            //document.querySelector('#captionModal #hero-image-switch').value = heroInput.value;
            document.querySelector('#captionModal #hero-image-switch').name = 'hero-'+randStr;
            $("#captionModal").modal("show");
          }

          let icon = document.createElement('i');
          icon.className = 'material-icons';
          icon.innerHTML = 'edit';
          btn.appendChild(icon);
          added_node.appendChild(btn);

          console.log('#child has been added');
          //observer.disconnect();
        }
      });
    });
  });

  observer.observe(document.querySelector("#image-uploader"), { subtree: true, childList: true });
}

// save edited caption from caption modal to hidden input for upload image
function saveCaption(e) {
	e.preventDefault();
	// copy value from caption modal input to hidden imput
	const captionModalInput = document.querySelector('#captionModal #caption');
	const hiddenInputName = captionModalInput.name;
	const hiddenInput = document.querySelector('.add-profile [name="'+hiddenInputName+'"]');
	hiddenInput.value = captionModalInput.value;
	// close modal
	$("#captionModal").modal("hide");	
}

// save edited hero switch from caption modal to hidden input for upload image
function saveHero(e) {
  e.preventDefault();
  // copy switch value from caption modal input to hidden imput
  const heroModalSwitch = document.querySelector('#captionModal #hero-image-switch');
  const hiddenInputName = heroModalSwitch.name;
  const hiddenInput = document.querySelector('.add-profile [name="'+hiddenInputName+'"]');
  hiddenInput.value = heroModalSwitch.checked;
  // if checked is true set all others to not checked / false
  console.log(hiddenInputName, hiddenInput.value);
  if (heroModalSwitch.checked == true) {
    const div = document.querySelectorAll('.uploaded-image');
    for (var i = 0; i < div.length; i++) {
      if (div[i].querySelector('.hero-image').name != hiddenInputName) {
        div[i].querySelector('.hero-image').value = 'false';
      }
    }
  }
}

// show profile preview
function showPreview(selectedTags){
  const profileForm = document.querySelector('.add-profile');
  const gallery = document.querySelector('.gallery');
  const bio = document.querySelector('.bio');
  const link = document.querySelector('.link');
  const userData = document.querySelector('.user-data');
  const tags = document.querySelector('.selected-tags');
  const imageDivs = document.querySelectorAll('.uploaded-image');
  gallery.innerHTML = "";

  for (var i = 0; i < imageDivs.length; i++) {
    let image = document.createElement('img');
    image.src = imageDivs[i].querySelector('img').src;
    image.className = 'img-fluid';
    image.style = 'width:25%;padding:10px;';
    
    gallery.appendChild(image);
  }

  for (var i = 0; i < selectedTags.length; i++) {
    // create tag
    let badge = document.createElement("span");
    //badge.href = "#";
    badge.className = "badge rounded-pill bg-secondary";
    badge.style = "margin: 3px;"
    badge.innerHTML = selectedTags[i].replaceAll("-", ' ');

    tags.appendChild(badge);
  }

  bio.innerHTML = profileForm.bio.value.replace(/\n\r?/g, '<br>');
  link.innerHTML = profileForm.website.value;
  let data = "";
  for (const property in currentUserData) {
    data += `${property}: ${currentUserData[property]}<br>`
  }
  userData.innerHTML = data;
}


// get upload image urls - return an object with all the new upload image urls
async function getImageUrls(e){
  e.preventDefault();
  const suffix = {'image/jpeg':'jpg', 'image/png':'png', 'image/gif':'gif'};
  // all upload images
  const imageDivs = document.querySelectorAll('.uploaded-image');
  let images = [];
  let uploadUrl = "";

  for (var i = 0; i < imageDivs.length; i++) {
    let img = {};
    let caption = imageDivs[i].querySelector('.caption-text').value;
    img.caption = caption;
    let hero = imageDivs[i].querySelector('.hero-image').value;
    img.hero = hero;

    let url = imageDivs[i].querySelector('img').src;
    // if http - existing - images
    if (url.includes('https://firebasestorage.googleapis.com')) {
    	uploadUrl = url.split('/o/').pop().split('?')[0];
    	uploadUrl = uploadUrl.replace(/%2F/g, "/")
    	//images[uploadUrl] = url;
      img.url = uploadUrl;
      img.sourceUrl = url;
      images.push(img);
    }
    // blob url
    else {
	    let blob = await fetch(url).then(response => response.blob());
	    // get blob filename suffix
	    let fileSuffix = suffix[blob.type];
	    let randStr = Math.random().toString(36).substr(2, 5);
	    uploadUrl = "images/"+currentUserData.uid+ "/img-" + randStr + "." + fileSuffix;
    	//images[uploadUrl] = url;
      img.url = uploadUrl;
      img.sourceUrl = url;
      images.push(img);
    }
    
  }
  //console.log(images);
  return images; 
}

// show all existing profile data in form fields
function showProfileData(userData) {
  console.log("show user data", userData.tags);
  const welcomeMsg = document.querySelector('.welcome-msg');
  const profileForm = document.querySelector('.add-profile');
  welcomeMsg.innerHTML = "edit your profile";
  profileForm.website.value = userData.website;
  profileForm.bio.value = userData.bio.replace(/<br>/gi, '\n');
  profileForm.bio.style.height = profileForm.bio.scrollHeight+3+'px';

  const tagList = document.querySelector('#tag-list');
  // check check box tags
  const checkboxes = document.querySelectorAll('.form-check-input.tag');
  for (var i = 0; i < checkboxes.length; i++) {
    if (userData.tags.includes(checkboxes[i].value)) {
      checkboxes[i].checked = true; // check checkbox
      // add badge
      let badge = document.createElement("span");
      //badge.href = "#";
      badge.className = "badge rounded-pill bg-secondary";
      badge.style = "margin: 3px;"
      badge.dataset.label = checkboxes[i].value;
      badge.innerHTML = checkboxes[i].value.replaceAll("-", ' ');
      tagList.appendChild(badge);
    }
    
  }

  // if images exist get url and show
  if (userData.images) {
    const uploadedDiv = document.querySelector('.existing-images');
    const imageUploaderDiv = document.querySelector('.image-uploader');
    //imageUploaderDiv.classList.add("has-files");
    // show images
    for (var i = 0; i < userData.images.length; i++) {
      let uploadedImageDiv = document.createElement('div');
      uploadedImageDiv.className = 'uploaded-image image-'+i;
      uploadedImageDiv.dataset.index = i;
      //uploadedImageDiv.style.zIndex = '100';

      // create random string
      let randStr = Math.random().toString(36).substr(2, 5);
      // create hidden input to store caption
      let captionInput = document.createElement('input');
      captionInput.type = 'hidden';
      captionInput.className = 'form-control caption-text';
      captionInput.name = 'caption-'+randStr;
      captionInput.value = userData.images[i].caption;
      uploadedImageDiv.appendChild(captionInput);

      // create hidden input to stor hero image
      let heroInput = document.createElement('input');
      heroInput.type = 'hidden';
      heroInput.className = 'form-control hero-image';
      heroInput.name = 'hero-'+randStr;
      heroInput.value = userData.images[i].hero;
      uploadedImageDiv.appendChild(heroInput);


      // create delete image btn & icon
      let btn = document.createElement('button');
      btn.className = 'delete-image';
      btn.onclick = function(e) {
        e.preventDefault();
        this.parentElement.remove();
      }

      let icon = document.createElement('i');
      icon.className = 'material-icons';
      icon.innerHTML = 'clear';
      btn.appendChild(icon);

      // create edit caption btn & icon
      let editBtn = document.createElement('button');
      editBtn.className = 'edit-image';
      editBtn.onclick = function(e) {
        e.preventDefault();
        // populate modal with existing image, caption and hero bool
        const captionImg = document.querySelector('#caption-image');
        captionImg.src = this.parentElement.querySelector('img').src;
        document.querySelector('#captionModal #caption').value = captionInput.value;
        document.querySelector('#captionModal #caption').name = 'caption-'+randStr;
        //console.log('hero-'+randStr+' : '+heroInput.value);
        if (heroInput.value === 'true') {
          document.querySelector('#captionModal #hero-image-switch').checked = true;
        } else {
          document.querySelector('#captionModal #hero-image-switch').checked = false;
        }
        document.querySelector('#captionModal #hero-image-switch').name = 'hero-'+randStr;
        $("#captionModal").modal("show");
      }

      let editIcon = document.createElement('i');
      editIcon.className = 'material-icons';
      editIcon.innerHTML = 'edit';
      editBtn.appendChild(editIcon);

      // get image
      getDownloadURL(ref(storage, userData.images[i].url))
        .then((url) => {
          let imageTag = document.createElement('img');
          imageTag.src = url;
          uploadedImageDiv.appendChild(imageTag);
          uploadedImageDiv.appendChild(btn);
          uploadedImageDiv.appendChild(editBtn);
          uploadedDiv.appendChild(uploadedImageDiv);
        })
    }
  }
}



// ======PROFILE FUNCTIONS======

// show profile 
function showProfile(userData) {
  console.log(userData);
  const forename = document.querySelector('.single-profile .forename');
  const surname = document.querySelector('.single-profile .surname');
  const bio = document.querySelector('.single-profile .bio');
  const tagList = document.querySelector('.single-profile .tags');
  const website = document.querySelector('.single-profile .website');
  const course = document.querySelector('.single-profile .course');
  const gallery = document.querySelector('.single-profile .gallery');

  forename.innerHTML = userData.forename;
  surname.innerHTML = userData.surname;
  bio.innerHTML = userData.bio;
  course.innerHTML = userData.course;
  website.innerHTML = userData.website;

  // if tags exist create badges
  if (userData.tags) {
    // create tag badges
    for (var i = 0; i < userData.tags.length; i++) {
      // create tag
      let badge = document.createElement("span");
      //badge.href = "#";
      badge.className = "badge rounded-pill bg-secondary";
      badge.style = "margin: 3px;"
      badge.dataset.label = userData.tags[i];
      badge.innerHTML = userData.tags[i].replaceAll("-", ' ');
      tagList.appendChild(badge);
    }
  }

  // if images exist get url and show
  if (userData.images) {
    // show images
    for (var i = 0; i < userData.images.length; i++) {
      // caption
      let caption = userData.images[i].caption;
      // get image
      getDownloadURL(ref(storage, userData.images[i].url))
        .then((url) => {
          let imageTag = document.createElement('img');
          imageTag.src = url;
          gallery.appendChild(imageTag);
          let captionTag = document.createElement('span');
          captionTag.innerHTML = "caption: " + caption;
          gallery.appendChild(captionTag);
        })
    }
  }
}


// add edit btn to current user
function showEditBtn (userID, paramID) {
  if (userID == paramID) {
    //console.log(userID, paramID, "showEditBtn current user id");
    const container = document.querySelector('.edit');
    let btn = document.createElement('button');
    btn.className = "btn btn-primary edit-profile-btn";
    btn.innerHTML = "Edit profile";
    container.appendChild(btn);
    btn.addEventListener('click', function (e) {
      window.location.href = "add-profile.html?id="+userID;
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
/* function getJobForm() {
  const jobDetailsForm = document.querySelector('.jobDetails');
  let formValues = "";
  for (let i = 0; i < jobDetailsForm.length; i++) {
    if (jobDetailsForm.elements[i].name == 'longdescription' || jobDetailsForm.elements[i].name == 'shortdescription') {
      console.log(jobDetailsForm.elements[i].value);
      formValues += jobDetailsForm.elements[i].value.replace(/\n\r?/g, '<br>');
    }
    else if (jobDetailsForm.elements[i].type != 'checkbox') {
      formValues += jobDetailsForm.elements[i].name+ " : " +jobDetailsForm.elements[i].value + "<br>";
    }
  }
  return formValues;
}
 */
// create preview of job details
/* function previewJob(e, tags, formValues) {
  e.preventDefault();
  document.querySelector(".preview").innerHTML = formValues + "tag: " + tags;
} */



// enable / disable post job submit btn
/* function enableSubmitJob() {
  const tc = document.querySelector("#tc");
  console.log(tc.checked);
  if (tc.checked) {
    const submit = document.querySelector('#submit');
    submit.active = true;
    submit.disabled = false;
  } else {
    submit.disabled = true;
  }
} */


//==========================================
//==========================================
//===========DOM ELEMENTS===================
import header from './header.html'
import footer from './footer.html'
import signinmodal from './signinmodal.html'
import postjobmodal from './postjobmodal.html'
document.getElementById("header").innerHTML = header;
document.getElementById("footer").innerHTML = footer;
document.getElementById("signinmodal").innerHTML = signinmodal;
document.getElementById("postjobmodal").innerHTML = postjobmodal;

// tag categories
const tags = ["Animation", "Visual-Effects", "Graphic-Design", "Games-Design-and-Production", "Video", "Audio-Production", "Journalism", "Photography", "Theatre-Dance"];

const page = document.body.getAttribute('data-page');
const userSection = document.querySelector('.user-data');
const addUserDataForm = document.querySelector('.add-user-data');
const allUserData = document.querySelector('.all-user-data');
const signedInName = document.querySelector('.welcome-name');


//===========EVENT LISTENERS===================

//===========NON PAGE SPECIFIC EVENT LISTENERS AND PROCESSES===================
// submit job to db
const submitJob = document.querySelector('.submit-job-details');
submitJob.addEventListener('click', function (e) {
  e.preventDefault();
  console.log("submitting job");
  //createJobDoc(getTags());
  createJobDoc();
});


// send help email about posting a job
const modalHelpButton = document.querySelector('#submit3');
const helpSendModal = new bootstrap.Modal(document.querySelector('#help'));
const thankYouModal = new bootstrap.Modal(document.querySelector('#help-thank-you'));
modalHelpButton.addEventListener('click', function (e) {
  if(validateHelpForm(e)) {
    // hide / show modals
    helpSendModal.hide(); 
    thankYouModal.show();
    // get form values and close and open modal
    let formValues = getHelpFormValues();
    // send email if help modal validated
    createSentEmailDoc(formValues.to, formValues.from, formValues.message).then(function(){
      // when sent change message and graphic
      emailSentConfirmation();
    });
  }
});  


// LOGIN PAGE
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


// ADD / EDIT PROFILE PAGE
if (page == "add-profile") {
  console.log("add-profile page");
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

  // create tag system
  createTagCheckboxes();

  // watch for new uploaded images add edit caption icon
  uploadImageWatcher();

  // load any existing profile info
  getUserData(getParam()).then(function(vals){
      showProfileData(vals);
    });

  // save edited caption from modal
  const captionModal = document.querySelector('#captionModal .save-caption');
  captionModal.addEventListener('click', saveCaption);
  const captionSwitch = document.querySelector('#captionModal #hero-image-switch');
  captionSwitch.addEventListener('change', saveHero);

  // show profile preview 
  const previewBtn = document.querySelector('.show-preview');
  previewBtn.addEventListener('click', function () {
    showPreview(getTags());
  });

  // upload and save
  const uploadBtn = document.querySelector('.save-and-upload');
  uploadBtn.addEventListener('click', function(e){
    // add profile info
    addToProfile(e, getTags());
  	// get urls of images to upload - resolve promise > upload
    getImageUrls(e).then(function(result) { 
         //console.log(result);
         uploadImage(result).then(function(){
         	console.log('complete');
         });
      });
  }); 

}


// SHOW PROFILE
if (page == "single-profile") {
  console.log("profile page");
  // show profile passed as param
  getUserData(getParam()).then(function(vals){
      showProfile(vals);
    });
  
  // on login add edit my profile btn
  onAuthStateChanged(auth, function(user) {
    if (user) {
        // User logged in already or has just logged in.
        console.log("profile page logged in user is", user.uid);
        showEditBtn(user.uid, getParam());
      } 
  })
}


// JOB BOARD PAGE
if (page == "jobs") {
  console.log("jobs page");
  const itemsPerPage = 12;   // jobs per page
  const sortJobsSelect = document.querySelector('.sort-jobs');
  let sortVal = "applyby";  // initial sort value
  // sort parameter set this as the db query
  if (getParamKey("sort")) {
    sortJobsSelect.value = getParamKey("sort"); // change select menu to match
    sortVal = getParamKey("sort"); // param sort value
  }
  // retrieve all current jobs and display
  getAllCurrentJobData(sortVal, function(jobData){
    displayAllJobs(itemsPerPage, getParamKey("page"), jobData); // err
    createPagination(getParamKey("page"), itemsPerPage, jobData.length);
  });

  // on select change reload  page and add sort param
  sortJobsSelect.addEventListener('change', function (e) {
    window.location.href = "jobs.html?sort="+e.target.value;
  });  
}

// JOB DETAILS PAGE
if (page == "job-details") {
  console.log("job details page");
  // on login add / remove disabled from apply btn
  onAuthStateChanged(auth, function(user) {
    if (user) {
      // User logged in already or has just logged in.
      activateApplyBtn("activate");
    } else {
      activateApplyBtn("disable");
    }
  })
  // set go back link
  const goBack = document.querySelector('.go-back');
  goBack.addEventListener('click', function (e) {
    e.preventDefault();
    if(document.referrer.includes("jobs")) {
      history.back();
    } else {
      location.href = "jobs.html";
    }
  });
  // get and show job
  getSingleJob(getParam(), function(jobData){
    currentJobData = jobData;
    displaySingleJob(jobData);
  });

  // apply for job
  // populate user details on clicking appl button
  const applyForJob = document.querySelector('.apply-btn');
  applyForJob.addEventListener('click', function (event) {
    // add user data from global currentUserData
    applyForJobAddUserdata(currentUserData);
  }, false)

  // validate application and send message
  const jobApplicationModal = new bootstrap.Modal(document.querySelector('#applymodal'));
  const submittedModal = new bootstrap.Modal(document.querySelector('#help-thank-you'));
  const submitApplication = document.querySelector('.apply-job-btn');
  submitApplication.addEventListener('click', function (event) {
    if(validateApplyForJob(event)){
      // close / open modal
      jobApplicationModal.hide();
      submittedModal.show();
      // get form values inc user data from global currentUserData
      let formValues = getApplyForJobValues(currentUserData, currentJobData);
      // send email if help modal validated
      createSentEmailDoc(formValues.to, formValues.from, formValues.message).then(function(){
        // when sent change message and graphic
        applicationSentConfirmation();
      });
      console.log("success success");
    }

  }, false)
}




console.log('hello from index.js tucked at the bottom');
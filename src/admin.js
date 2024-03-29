
import {loadCheck, signUpUser, signOutUser, signInUser, getUserData, getCurrentUserEmail, createUserDoc, updateUserDoc,isUserSignedIn, getUserUid, getAllCurrentJobData, getAllJobData, getSingleJob, updateJobDoc, getAllUserData, createSentEmailDoc} from './firebase-library.js';

import {getSkillsTags, getCategories} from './tags-categories.js';

loadCheck();

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { getFirestore, collection, onSnapshot, getDocs, addDoc, doc, query, where, orderBy, getDoc, serverTimestamp, updateDoc, setDoc, deleteDoc, Timestamp, arrayUnion} from 'firebase/firestore';
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
const adminEmail = "stiwdiofreelanceragency@gmail.com";

// on login state change
onAuthStateChanged(auth, function(user) {
  if (user) {
      // User logged in already or has just logged in.
      console.log(user.uid, user.email, "logged in");
      loadPages();
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
  if (email == adminEmail) {
    signInWithEmailAndPassword(auth, email, password)
    .then(function(cred){
      console.log("Signed in", cred.user.uid);
      loginForm.reset();
      // go to profile page
      window.location.href = "jobboard.html";
    })
    .catch(function(err) {
      console.log(err.message);
      document.querySelector("#login-err").removeAttribute("hidden");
    });
  }
  else {
    document.querySelector("#login-err-admin").removeAttribute("hidden");
  }
  
  
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
  console.log("running createUserList - create list of users");
  let userListContainer = document.querySelector(".user-list tbody");
  const noOfUsers = document.querySelector(".no-of-users");
  noOfUsers.innerHTML = "("+userData.length + " Users)";
  for (var i = 0; i < userData.length; i++) {
    //userData[i]
    let tr = document.createElement("tr");
    let name = document.createElement("td");
    name.innerHTML = userData[i].forename + " " + userData[i].surname;

    let approvedUser = "";
    if (userData[i].approved) {
      approvedUser = "checked";
    }
    let idUser = "approve-"+i;
    let userApproved = document.createElement("td");
    userApproved.innerHTML = '<div class="form-check user-approved form-switch"><input id="'+idUser+'" class="form-check-input" type="checkbox" data-id="'+userData[i].id+'" '+approvedUser+'></div>';


    let userInfo = document.createElement("td");
    userInfo.className = "d-none d-md-table-cell";
    userInfo.innerHTML = '<a class="btn btn-primary" style="white-space: nowrap;" href="userinfo.html?id='+userData[i].id+'">User Record</a>';

    let approvedProfile = "";
    if (userData[i].profileApproved) {
      approvedProfile = "checked";
    } 
    let idProfile = "approve-profile-"+i;
    let profileApproved = document.createElement("td");
    profileApproved.classList = "d-none";
    profileApproved.innerHTML = '<div class="form-check profile-approved form-switch d-none"><input class="form-check-input" type="checkbox" id="'+idProfile+'" data-id="'+userData[i].id+'" '+approvedProfile+'></div>';

    let profileLink = document.createElement("td");
    profileLink.className = "d-none d-md-table-cell";
    profileLink.innerHTML = '<a target="_blank" href="../profile.html?id='+userData[i].id+'" class="btn btn-primary">Profile</a>';

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
      updateUserDoc(approveSwitch.dataset.id, "approved", approveSwitch.checked); 
    });
    // add event listeners for the switch
    const profileApproveSwitch = document.querySelector("#"+idProfile);
    profileApproveSwitch.addEventListener('change', function(){ 
      // update doc
      console.log(profileApproveSwitch.dataset.id); 
      // update user doc with key val
      updateUserDoc(profileApproveSwitch.dataset.id, "profileApproved", profileApproveSwitch.checked); 
    });
  }
}


// get all users data in single snapshot no live update
async function getUserCollection() {
  const querySnapshot = await getDocs(collection(db, "users"));
  let vals = [];
  let docData;
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    docData = doc.data();
    docData.id = doc.id;
    vals.push(docData);
  });
  return vals;
}


function createUserRecord(userData) {
  const availability = document.querySelector(".user-record .availability");
  if (userData.available) {
    availability.classList.add("bg-success");
  }
  else {
    availability.classList.add("bg-danger");
  }
  const forename = document.querySelector(".user-record .forename");
  forename.innerHTML = userData.forename;
  const surname = document.querySelector(".user-record .surname");
  surname.innerHTML = userData.surname;
  const pronouns = document.querySelector(".user-record .pronouns");
  pronouns.innerHTML = userData.pronouns;
  const email = document.querySelector(".user-record .email");
  email.innerHTML = '<a href="mailto:'+userData.email+'">'+userData.email+'</a>'//userData.email;
  const bio = document.querySelector(".user-record .bio");
  bio.innerHTML = userData.bio;
  const website = document.querySelector(".user-record .website");
  website.innerHTML = '<a target="_blank" href="'+userData.website+'">'+userData.website+'</a>'//userData.website;

  const studentid = document.querySelector(".user-record .student-id");
  studentid.innerHTML = userData.studentid;
  const course = document.querySelector(".user-record .course");
  course.innerHTML = userData.course;
  const graduation = document.querySelector(".user-record .graduation");
  graduation.innerHTML = userData.graduation;
  const approved = document.querySelector(".user-record .approved-switch");
  if (userData.approved) {
    approved.checked = true;
  }

  // add event listener for the switch
  approved.addEventListener('change', function(){ 
    // update user doc with key val
    updateUserDoc(getParam(), "approved", approved.checked); 
  });
}

// show list of jobs
function createJobList(userData) {
  console.log("running createJobList - create list of jobs");
  let jobListContainer = document.querySelector(".job-list tbody");
  const noOfJobs = document.querySelector(".no-of-jobs");
  noOfJobs.innerHTML = "("+userData.length + " Jobs)";

  // variables for the send email job modal
  let emailList = [];
  let selectedJob;
  
  for (var i = 0; i < userData.length; i++) {
    //userData[i]
    const tr = document.createElement("tr");

    const jobTitle = userData[i].title;
    const jobTitleEl = document.createElement("td");
    jobTitleEl.innerHTML = jobTitle;

    let applicationDeadline = new Date(userData[i].applicationdeadline.seconds*1000);
    let applicationDeadlineStr = applicationDeadline.toLocaleString("en-GB", {day: "numeric", month: "numeric", year: "numeric"});
    const deadline = document.createElement("td");
    deadline.innerHTML = applicationDeadlineStr;

    let approvedUser = "";
    if (userData[i].approved) {
      approvedUser = "checked";
    }
    let idUser = "approve-"+i;
    let userApproved = document.createElement("td");
    userApproved.innerHTML = '<div class="form-check user-approved form-switch"><input id="'+idUser+'" class="form-check-input" type="checkbox" data-id="'+userData[i].id+'" '+approvedUser+'></div>';

    const preview = document.createElement("td");
    preview.className = "d-none d-md-table-cell";
    preview.innerHTML = '<a class="btn btn-primary" target="_blank" style="white-space: nowrap;" href="../job-details.html?id='+userData[i].id+'">View Job</a>';

    
    const editLink = document.createElement("td");
    editLink.className = "d-none d-md-table-cell";
    editLink.innerHTML = '<a style="white-space: nowrap;" href="jobedit.html?id='+userData[i].id+'" class="btn btn-primary">Edit Job</a>';

    const sendMail = document.createElement("td");
    sendMail.className = "d-none d-md-table-cell";
    sendMail.innerHTML = '<a style="white-space: nowrap;" href="#" class="btn btn-primary" id="sendmail-'+i+'" data-bs-toggle="modal" data-bs-target="#SendMailModal" data-id="'+userData[i].id+'">Send Email</a>';

    tr.appendChild(jobTitleEl);
    tr.appendChild(deadline);
    tr.appendChild(userApproved);
    tr.appendChild(preview);
    tr.appendChild(editLink);
    tr.appendChild(sendMail);
    jobListContainer.appendChild(tr);

    // add event listeners for the switch
    const approveSwitch = document.querySelector("#"+idUser);
    approveSwitch.addEventListener('change', function(){ 
      // update doc
      console.log(approveSwitch.dataset.id); 
      // update user doc with key val
      updateJobDoc(approveSwitch.dataset.id, "approved", approveSwitch.checked); 
    });

    // add event listener for the send mail
    const sendMailBtn = document.querySelector("#sendmail-"+i);
    sendMailBtn.addEventListener('click', function(){
      // find users 
      getSingleJob (sendMailBtn.dataset.id, function(jobData){
        findUsers(jobData).then(function(results){
          console.log("job:", results);
          // add the id to the job details
          jobData.id = sendMailBtn.dataset.id;
          emailList = results; // set email list
          selectedJob = jobData; // set selected job details
          // populate modal
          populateModal(results, jobData.categories, jobTitle);
        });
      });
    });

  }
  // add event listener for the send btn in modal
  const sendBtn = document.querySelector("#SendMailModal #send-email");
  sendBtn.addEventListener('click', function() {
    sendJobEmail(emailList, selectedJob)
  });
}


// find users to send job emails to
async function findUsers(data) {
  // find category for job
  let categories = data.categories;
  if (data.categories == null) {
    return;
  }
  // query and match with users
  let vals = [];
  try {
    const q = query(collection(db, "users"), where('categories', 'array-contains-any', categories));
    const querySnapshot = await getDocs(q);
    let docData;
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      if (doc.data().approved) {
        console.log(doc.id, doc.data().email, doc.data().forename, doc.data().surname);
        docData = doc.data();
        docData.id = doc.id;
        vals.push(docData);
      }
    });
  }
  catch(err) {
    //console.log("no categories");
    return null;
  }
  
  return vals; 
}


// populate send email Modal
function populateModal(valsArr, categories, jobTitle) {
  const modalBody = document.querySelector("#SendMailModal .modal-body .modal-text");
  const sendMailBtn = document.querySelector("#SendMailModal #send-email");
  // reset send btn
  sendMailBtn.removeAttribute('disabled');
  sendMailBtn.classList.remove('btn-success');
  sendMailBtn.classList.add('btn-primary');
  sendMailBtn.innerHTML = "Send";
  modalBody.innerHTML = "<h2>Job: "+jobTitle+"</h2>"
  if (valsArr == null) {
    modalBody.innerHTML += "This Job listing has no categories so emails cannot be sent, you can add categories by editing the job listing<br>";
    sendMailBtn.setAttribute('disabled', '');
    return;
  } 
  modalBody.innerHTML += "This Job listing has the categories:<br>";
  for (var i = 0; i < categories.length; i++) {
    modalBody.innerHTML += "<strong style='text-transform: capitalize;'>"+categories[i]+"</strong><br>";
  }
  if (valsArr == "") {
    modalBody.innerHTML += "<br>There were no email matches<br>";
    sendMailBtn.setAttribute('disabled', '');
    return;
  }
  modalBody.innerHTML += "<br>Emails will be sent to:<br>";
  for (var i = 0; i < valsArr.length; i++) {
    modalBody.innerHTML += "<strong>"+valsArr[i].forename+" "+valsArr[i].surname+"</strong>: "+valsArr[i].email+"<br>";
  }
}

// Create text for job email alert to freelancers
function createJobAlertEmail(job, customMsg, user) {
  console.log(job);
  let thisDomain = window.location.hostname;
  let costEng = "";
  let costWelsh = "";
  let emailMsg = "";
  let categories = "";
  let completionDateEng = "";
  let completionDateWelsh = "";
  const applicationdeadline = job.applicationdeadline.toDate().toDateString();
  // categories array in separate file
  const categoriesList = getCategories(); // from tags-categories.js
  // add categories
  for (var i = 0; i < job.categories.length; i++) {
    if (i > 0) {
      categories += " / "
    }
    // compare job categories with list of all categories to get description of category
    for (var j = 0; j < categoriesList.length; j++) {
      if (job.categories[i] == categoriesList[j].category) {
        categories += categoriesList[j].description;
      }
    }
  }
  // budget or hourly
  if (job.usehourly) {
    costEng = "Budget (hourly rate): £" +job.hourlyrate+ " per hour<br>";
    costWelsh = "Cyllideb (cyfradd yr awr): £" +job.hourlyrate+ " yr awr<br>";
  }
  else {
    costEng = "Budget: £" +job.budget+ "<br>";
    costWelsh = "Cyllideb: £" +job.budget+ "<br>";
  }
  // custom message
  if (customMsg != "") {
    customMsg = customMsg+"<br><br>";
  }
  // completion date/ duration
  if (job.duration != "" && job.duration) {
    completionDateEng = job.duration+ " days";
    completionDateWelsh = job.duration+ " dyddiau";
  }
  else {
    completionDateEng = job.deadline.toDate().toDateString();
    completionDateWelsh = job.deadline.toDate().toDateString();
  }
  emailMsg += "Dear "+user+ "<br><br>";
  emailMsg += customMsg;
  emailMsg += "Good news!<br>The Stiwdio Agency has received the following job brief \""+job.title+"\" and you listed "+categories+" as one / some of your key skill/s.<br>";
  emailMsg += costEng;
  emailMsg += "Timescale: " +completionDateEng+ "<br>";
  emailMsg += "This job's location: " +job.location+ "<br><br>";
  emailMsg += "If you are interested, don't forget to submit your proposal before <b>"+applicationdeadline+"</b> and read the full job description here <br><a href='https://"+thisDomain+ "/job-details.html?id=" +job.id+"'>https://"+thisDomain+ "/job-details.html?id=" +job.id+"</a><br>";
  emailMsg += "<br>//<br>";
  emailMsg += "Newyddion da!<br>Mae Asiantaeth Stiwdio wedi derbyn teitl briffio \""+job.title+"\" ac fe wnaethoch chi restru "+categories+" fel rhai o'ch sgiliau allweddol.<br>";
  emailMsg += costWelsh;
  emailMsg += "Amserlen: " +completionDateWelsh+ "<br>";
  emailMsg += "Lleoliad: " +job.location+ "<br><br>";
  emailMsg += "Os oes gennych ddiddordeb, peidiwch ag anghofio cyflwyno eich cynnig cyn <b>"+applicationdeadline+"</b> yma, lle gallwch hefyd ddarllen y disgrifiad swydd llawn: <br><a href='https://"+thisDomain+ "/job-details.html?id=" +job.id+"'>https://"+thisDomain+ "/job-details.html?id=" +job.id+"</a><br>";
  emailMsg += "<br><br>As ever, keep creating!<br>//<br>Fel erioed, daliwch ati i greu!";

  return emailMsg;
}


// send email AND compile list of names  with job info
function sendJobEmail(users, job) {
  const sendMailBtn = document.querySelector("#SendMailModal #send-email");
  let thisDomain = window.location.hostname;
  // Remove all parameters from the URL
  //let amendedUrl = new URL(thisUrl.split('/')[0]);
  sendMailBtn.innerHTML = "Sending...";
  for (var i = 0; i < users.length; i++) {
    // send email if help modal validated
    const modalMsgText = document.querySelector("#SendMailModal .modal-body form #msg-text");
    let message = createJobAlertEmail(job, modalMsgText.value, users[i].forename+ " " +users[i].surname);
    // send email
    createSentEmailDoc(users[i].email, adminEmail, message, 'Stiwdio Agency Job alert // rhybudd swydd asiantaeth Stiwdio').then(function(){
      // when sent change message and btn
      console.log("Email sent");
      sendMailBtn.classList.remove('btn-primary');
      sendMailBtn.classList.add('btn-success');
      sendMailBtn.innerHTML = "Emails sent";
    });
  }
  console.log(job.title, job.id);
  console.log(job);
}


// Display job
function displayJobDetails(jobData) {
  console.log(jobData);
  document.querySelector("#edit-job-content").removeAttribute("hidden");
  const jobDetailsForm = document.querySelector('.jobDetails');
  jobDetailsForm.title.value = jobData.title;
  jobDetailsForm.forename.value = jobData.forename;
  jobDetailsForm.surname.value = jobData.surname;
  jobDetailsForm.company.value = jobData.company;
  jobDetailsForm.email.value = jobData.email;
  jobDetailsForm.phone.value = jobData.phone;
  jobDetailsForm.longdescription.value = jobData.longdescription.replace(/<br\s*[\/]?>/gi, "\n");
  jobDetailsForm.budget.value = jobData.budget;
  jobDetailsForm.duration.value = jobData.duration;
  jobDetailsForm.hourlyrate.value = jobData.hourlyrate;
  jobDetailsForm.deadline.valueAsDate = new Date(jobData.deadline.seconds*1000);
  jobDetailsForm.applicationdeadline.valueAsDate = new Date(jobData.applicationdeadline.seconds*1000);

  // skills tags
  const tagContainer = document.querySelector('#tag-checkboxes');
  // categories array in separate file
  const categories = getCategories();
  for (var i = 0; i < categories.length; i++) {
    if (jobData.categories && jobData.categories.includes(categories[i].category)) {
      tagContainer.innerHTML += '<div class="form-check form-switch pt-2"><input checked class="form-check-input" type="checkbox" id="'+categories[i].category+'" name="category">'+categories[i].description+'</div>';
    }
    else {
      tagContainer.innerHTML += '<div class="form-check form-switch pt-2"><input class="form-check-input" type="checkbox" id="'+categories[i].category+'" name="category">'+categories[i].description+'</div>';
    }
  }
}

// Save job edits
async function saveJobEdits(uid){
  const updateJobDetailsForm = document.querySelector(".jobDetails");
  let response = document.querySelector(".response-msg");
  let completionDate = new Date(updateJobDetailsForm.deadline.value);
  let applicationDeadline = new Date(updateJobDetailsForm.applicationdeadline.value);

  let categories = []; // send to db
  const categorySwitches = document.querySelectorAll('input[name="category"]:checked');
  for (var i = 0; i < categorySwitches.length; i++) {
    // save tags
    categories.push(categorySwitches[i].id);
  }

  const update = await updateDoc(doc(db, "jobs", uid), {
    title: updateJobDetailsForm.title.value,
    forename: updateJobDetailsForm.forename.value,
    surname: updateJobDetailsForm.surname.value,
    company: updateJobDetailsForm.company.value,
    email: updateJobDetailsForm.email.value,
    phone: updateJobDetailsForm.phone.value,
    longdescription: updateJobDetailsForm.longdescription.value.replace(/\n\r?/g, '<br>'), 
    budget: updateJobDetailsForm.budget.value,
    hourlyrate: updateJobDetailsForm.hourlyrate.value,
    deadline: Timestamp.fromDate(completionDate),
    duration:updateJobDetailsForm.duration.value,
    applicationdeadline: Timestamp.fromDate(applicationDeadline), 
    categories: categories
  })
  .then(function(){
    console.log("successfully updated job doc");
    response.classList.add("text-success");
    response.innerHTML = "Successfully Updated Job";
  })
  .catch(function(error){
    console.log("Error: Getting document:", error); 
    response.classList.add("text-danger");
    response.innerHTML = "Something went wrong Job not updated";
  });
}

// delete job
async function deleteJob(uid) {
  await deleteDoc(doc(db, "jobs", uid));
}

//===========PAGE EVENT LISTENERS===================
const page = document.body.getAttribute('data-page');

// ALL PAGES
window.addEventListener('DOMContentLoaded', function(){
  const sidebarLogoutBtn = document.querySelector('#sidebar #sidebar-sign-out');
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
      logoutBtn.addEventListener('click', signOutUser);
  }
  if (sidebarLogoutBtn) {
      sidebarLogoutBtn.addEventListener('click', signOutUser);
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

function loadPages(){
  // LOGIN PAGE
  if (page == "login") {
    window.location.href = "jobboard.html";
  }

  // GRADUATE / USER PAGE
  if (page == "graduates") {
    console.log("graduate page");
    getUserCollection().then(function(userData){
      //console.log(userData);
      createUserList(userData);
    });

  };

  // SINGLE GRADUATE / USER PAGE
  if (page == "single-graduate-record") {
    console.log("single graduate page");
    let uid = getParam();
    console.log(uid);
    getUserData(uid).then(function(singleUserData){
      console.log(singleUserData);
      createUserRecord(singleUserData);
    })
  };

  // SHOW JOBS
  if (page == "job-listings") {
    console.log("job-listings page");
    let sortVal = "applicationdeadline";  // initial sort value
    // retrieve all current jobs and display
    getAllJobData(function(jobData){
      console.log(jobData);
      createJobList(jobData);
    });  
  };

  // EDIT JOB
  if (page == "edit-job") {
    console.log("edit job");
    let uid = getParam();
    console.log(uid);
    getSingleJob(uid, function(singleJobData){
      console.log(singleJobData);
      displayJobDetails(singleJobData);
    })
    // save edit
    const saveEdit = document.querySelector("#save-edit");
    saveEdit.addEventListener('click', function(e){
      e.preventDefault();
      saveJobEdits(uid).then(function(){
        console.log("edit saved");
      });
    })

    // save edit & preview
    const saveEditPreview = document.querySelector("#save-edit-preview");
    saveEditPreview.addEventListener('click', function(e){
      e.preventDefault();
      saveJobEdits(uid).then(function(){
        console.log("edit saved");
        window.open("../job-details.html?id="+uid);
      });
    })

    // delete job
    const deleteJobBtn = document.querySelector("#delete-job");
    deleteJobBtn.addEventListener('click', function(e){
      e.preventDefault();
      deleteJob(uid).then(function(){
        console.log("Job Deleted");
        window.location.href = "jobboard.html";
      })
    })

  };
}























console.log('hello from admin.js tucked at the bottom');

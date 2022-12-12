
import {loadCheck, signUpUser, signOutUser, signInUser, getUserData, getCurrentUserEmail, createUserDoc, updateUserDoc,isUserSignedIn, getUserUid, getAllCurrentJobData, getAllJobData, getSingleJob, updateJobDoc, getAllUserData} from './firebase-library.js';

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

// on login state change
onAuthStateChanged(auth, function(user) {
  if (user) {
      // User logged in already or has just logged in.
      console.log(user.uid, user.email, "logged in");
      showSignedInUser(user.email, user.uid);
      loadPages();
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
    .catch(function(err) {
      console.log(err.message);
      document.querySelector("#login-err").removeAttribute("hidden");
    });
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
    profileApproved.innerHTML = '<div class="form-check profile-approved form-switch"><input class="form-check-input" type="checkbox" id="'+idProfile+'" data-id="'+userData[i].id+'" '+approvedProfile+'></div>';

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
  
  for (var i = 0; i < userData.length; i++) {
    //userData[i]
    const tr = document.createElement("tr");

    const jobTitle = document.createElement("td");
    jobTitle.innerHTML = userData[i].title;

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

    tr.appendChild(jobTitle);
    tr.appendChild(deadline);
    tr.appendChild(userApproved);
    tr.appendChild(preview);
    tr.appendChild(editLink);
    jobListContainer.appendChild(tr);

    // add event listeners for the switch
    const approveSwitch = document.querySelector("#"+idUser);
    approveSwitch.addEventListener('change', function(){ 
      // update doc
      console.log(approveSwitch.dataset.id); 
      // update user doc with key val
      updateJobDoc(approveSwitch.dataset.id, "approved", approveSwitch.checked); 
    });
  }
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
  
  const deadline = new Date(jobData.deadline.seconds*1000);
  jobDetailsForm.deadline.value = deadline.toLocaleDateString('en-CA');

  const applicationDeadline = new Date(jobData.applicationdeadline.seconds*1000);
  jobDetailsForm.applicationdeadline.value = applicationDeadline.toLocaleDateString('en-CA');

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
      //displayAllJobs(itemsPerPage, getParamKey("page"), jobData); // err
      //createPagination(getParamKey("page"), itemsPerPage, jobData.length);
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

























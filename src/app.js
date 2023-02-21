
import {loadCheck, signUpUser, signOutUser, signInUser, getUserData, getCurrentUserEmail, createUserDoc, updateUserDoc, isUserSignedIn, getUserUid, getAllJobData, getAllCurrentJobData, getSingleJob, getAllUserData, resetPassword, getRandomDocs} from './firebase-library.js';

import {getSkillsTags, getCategories} from './tags-categories.js';

loadCheck();

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, getMetadata, uploadString, connectStorageEmulator } from "firebase/storage";

import { getFirestore, collection, onSnapshot, getDocs, addDoc, deleteDoc, deleteField, doc, query, where, orderBy, getDoc, serverTimestamp, updateDoc, setDoc,  Timestamp, arrayUnion, connectFirestoreEmulator} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, signInWithPhoneNumber, ActionCodeURL, deleteUser, updateEmail } from 'firebase/auth';

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
        // add profile pic
        populateProfilePicNav(vals);
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
    console.log("Login user document data:", singleDoc.data());
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
  formValues.message = "<h2>Enquiry about help posting a Job:<br>Message from: " + helpForm.helpForename.value + " " + helpForm.helpSurname.value + "<br>Reply to: "+helpForm.helpEmail.value+"<br><br>Message:</h2>" + helpForm.helpDesc.value;
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

// HOME PAGE FUNCTIONS

// create graduate preview cards
async function createGradPreview(docsArray) {
  console.log(docsArray);
  const container = document.querySelector('#grad-preview-container');
  // empty the container
  container.innerHTML = "";
  // if carousel wrap in <li>
  let isCarousel = container.dataset.carousel;
  let carouselLi = "";
  let carouselLiClose = "";
  if (isCarousel) {
    carouselLi = '<li class="splide__slide mx-3">';
    carouselLiClose = '</li>';
  }
 
  // create grad preview cards
  for (var i = 0; i < docsArray.length; i++) {
    console.log(docsArray[i].id, docsArray[i].forename+' '+docsArray[i].surname);
    let location = "<p></p>";
    if (docsArray[i].location) {
      location = '<p><img alt="map icon" src="assets/img/mapicon.svg"> '+docsArray[i].location+'</p>';
    }
    let available = '<p class="cant-work"><i class="bi bi-circle-fill"></i> Not available</p>';
    if (docsArray[i].available && docsArray[i].available == true){
      available = '<p class="can-work"><i class="bi bi-circle-fill"></i> Available for work</p>';
    }
    // create card
    let previewCard = '<!-- grad preview card --> <div id="id-'+docsArray[i].id+'" class="grad-preview-card col col-md-6 col-sm-12"> <div class="grad-preview-block"> <div class="row"> <div class="col-xl-auto col-sm-4 col-4 padding-left-0"> <div style="width:85px; height:85px; background-size:cover; background-image:url(\'assets/img/generic-profile.jpg\');" class="rounded-circle profile-pic"> </div> </div> <div class="col-xl-auto col-sm-8 col-8 grad-preview"> <h5><Strong class="grad-preview-name">'+docsArray[i].forename+' '+docsArray[i].surname+'</Strong></h5> <h6>'+docsArray[i].jobTitle+'</h6> '+location+available+' </div> </div> <div id="images-container" class="lineheightjob row mt-3">  </div> <div class="job-footer row"> <div class="col-12 padding-left-0"> <a href="profile.html?id='+docsArray[i].id+'">View more details</a> </div> </div> </div> </div> <!-- grad preview card -->';
    // insert into page
    container.innerHTML += carouselLi + previewCard + carouselLiClose;
  }
  // insert profile pic 
  for (var i = 0; i < docsArray.length; i++) {
    // insert profile pic
    if (docsArray[i].profilePic != null) {
      const profilePicContainer = document.querySelector('#id-'+docsArray[i].id+' .profile-pic');
      try {
        const storageRef = ref(storage, docsArray[i].profilePic);
        // get download image ref - don't need this 
        getDownloadURL(storageRef)
          .then(function(url) {
            //console.log(url);
            // add to modal as background image
            profilePicContainer.style.backgroundImage = "url("+url+")";
          });
      }
      catch(err) {
        console.log(err);
      } 
      
    }
  }
  // get project images add to card
  for (var i = 0; i < docsArray.length; i++) {
    // if projects
    if (docsArray[i].projects != null) {
      //console.log(docsArray[i].id, docsArray[i].forename+' '+docsArray[i].surname);
      let projects = docsArray[i].projects;
      const projectPicContainer = document.querySelector('#id-'+docsArray[i].id+' #images-container');
      projectPicContainer.innerHTML = "";
      let j = 0;
      // get key value for first 2 projects
      for (const [key, value] of Object.entries(projects)) {
        j++;
        try {
          if (j < 3) {
            //const projectPicContainer = document.querySelector('#id-'+docsArray[i].id+' #images-container');
            const storageRef = ref(storage, value.images[0]);
            // get download image ref - don't need this 
            getDownloadURL(storageRef)
              .then(function(url) {
                //console.log(url);
                // add to card as col + image
                projectPicContainer.innerHTML += '<div class="col grad-preview-images-container"> <img alt="graduate artwork" class="grad-preview-images" src="'+url+'">';
              });
          }
        }
        catch(err) {
          console.log(err);
        } 
      }
    }
  }
  // if cards are in a carousel initialise it
  if (isCarousel) {
    createCarousel();
  }

}

// contact form
function getContactFormValues() {
  // contact form
  const contactMessageForm = document.querySelector('#contact .send-home-form');
  let formValues = {};
  //formValues.message = "test from contact form";
  formValues.message = "<h2>Message From stiwdio agency contact form<br>From: "+contactMessageForm.forename.value+" "+contactMessageForm.surname.value+"<br>Email: "+contactMessageForm.email.value+"<br>Tel: "+contactMessageForm.phone.value+"</h2><h2>Message:</h2><p>"+contactMessageForm.message.value+"</p>";
  formValues.from = contactMessageForm.email.value;
  formValues.to = "stiwdiofreelanceragency@gmail.com";
  return formValues;
}

// confirm ent from contact from - change spinner and message on thank-you / confirmation modal
function homepageMessageSent() {
  const messageTitle = document.querySelector("#help-thank-you .modal-title");
  messageTitle.innerHTML = "Thank you for your message";
  const message = document.querySelector("#help-thank-you .modal-message");
  message.innerHTML = "<p>Your message has been sent to our admin team</p>";
  const spinner = document.querySelector("#help-thank-you .sending-spinner");
  spinner.style.display = "none";
  const thankYouTick = document.querySelector("#help-thank-you  .sent-thank-you-tick");
  thankYouTick.style.display = "inline";
}


//===========================
// BROWSE FOLIOS FUNCTIONS

// create url & search params from category filters
function setCategoryParams() {
  // check category check sub categories 
  const categoryCheckboxes = document.querySelectorAll('#filters input.category');
  let currentUrl = new URL(window.location); 
  currentUrl.searchParams.delete('searchField'); // delete search param
  for (var i = 0; i < categoryCheckboxes.length; i++) {
    if (categoryCheckboxes[i].type === 'checkbox') {
      categoryCheckboxes[i].onclick = function(e) {
        console.log("clicked category", this.dataset.skills);
        const tags = document.querySelectorAll('#filters .tag input[data-category="'+this.dataset.skills+'"]');
        if (this.checked && this.dataset.skills != undefined) {
          // add category search param 
          //currentUrl.searchParams.append(this.dataset.skills, 'category');
          // check other sub categories
          for (var j = 0; j < tags.length; j++) {
            tags[j].checked = true;
            // add tags search param here
            currentUrl.searchParams.append(tags[j].dataset.skills, 'tag');
          }
        } 
        else {
          for (var k = 0; k < tags.length; k++) {
            tags[k].checked = false;
            // add tags search param here
            currentUrl.searchParams.delete(this.dataset.skills);
            currentUrl.searchParams.delete(tags[k].dataset.skills);
          }
        }
        window.history.pushState({}, '', currentUrl);
      }
    }
  }
  
}


// create url & search params from tag filters
function setTagParams() {
  const checkboxes = document.querySelectorAll('#filters .tag input');
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].type === 'checkbox') {
      checkboxes[i].onclick = function(e) {
        let currentUrl = new URL(window.location); 
        currentUrl.searchParams.delete('searchField'); // delete search param
        if (this.checked && this.dataset.skills != undefined) {
          // if a category
          currentUrl.searchParams.append(this.dataset.skills, 'tag');
        } 
        else {
          currentUrl.searchParams.delete(this.dataset.skills);
        }
        // set checked / indeterminate
        setCategoryCheckbox(this);
        window.history.pushState({}, '', currentUrl);
      } 
    }
  }

}


// set checked / indeterminate
function setCategoryCheckbox(el){
  // set checked / indeterminate // get checked tags and all tags
  const tags = document.querySelectorAll('.tag input[data-category="'+el.dataset.category+'"]');
  const tagsChecked = document.querySelectorAll('.tag input[data-category="'+el.dataset.category+'"]:checked');
  const categoryCheckbox = document.querySelector('input[data-skills="'+el.dataset.category+'"]');
  if (tagsChecked.length == tags.length) {
    categoryCheckbox.indeterminate = false;
    categoryCheckbox.checked = true;
  }
  else if (tagsChecked.length == 0) {
    categoryCheckbox.indeterminate = false;
    categoryCheckbox.checked = false;
  }
  else if (tagsChecked.length != tags.length) {
    categoryCheckbox.indeterminate = true;
  }
}


// read params and check checkbox filters
function setFiltersFromParams() {
  let filters = [];
  const checkboxes = document.querySelectorAll('#filters input');
  const params = new URLSearchParams(window.location.search);
  // create array of params
  for (const key of params.keys()) {
    filters.push(key);
  }
  // match checkbox to param
  for (var i = 0; i < checkboxes.length; i++) {
    const skill = checkboxes[i].dataset.skills;
    // search filters array for match
    const found = filters.find( function(el) { return el == skill } );
    if (found) {
      checkboxes[i].checked = true;
      setCategoryCheckbox(checkboxes[i]);
    }
  }
}


// read params for queries
function getAllParams() {
  const searchParams = new URLSearchParams(window.location.search);
  const checkboxes = document.querySelectorAll('#filters input');
  // Log the values
  //console.log("\nfrom getAllParams()");
  let paramsArr = [];
  searchParams.forEach(function(value, key) {
    //console.log(value, key);
    let paramsObj = {};
    paramsObj[value] = key;
    paramsArr.push(paramsObj);
  });
  return paramsArr;
}

// return true if any params exist bar page=
function paramsExist() {
  const searchParams = new URLSearchParams(window.location.search);
  let noParams = true;
  searchParams.forEach(function(value, key) {
    if (key != "page") {
      noParams = false;
    }
  });
  return noParams;
}


// query / filter users by tag
async function filterUsers(allParams) {
  //console.log("\nFiltered docs");
  //console.log("allParams", allParams);
  let tags = [];
  let docs = [];
  let docIds = [];
  // create array of all tags
  for (var i = 0; i < allParams.length; i++) {
    // if param is 'tag' (not 'page' or anything else) add to array
    if (allParams[i].tag) {
      tags.push(allParams[i].tag);
    }
  }
  console.log(tags);
  // while tags array is not empty
  while (tags.length > 0) {
    // create tag sub array / batch of 10
    let tagsBatch = [];
    let n = 10; // get batches of 10 tags
    if (tags.length < 10) {
      n = tags.length;
    }
    for (var j = 0; j < n; j++) {
      tagsBatch.push(tags[0]);
      tags.shift(); // delete first item from tags
    }
    // create query from tagsBatch - max of 10 array items to query
    const q = query(collection(db, "users"), where('tags', 'array-contains-any', tagsBatch));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc has not already been added to array of docs
      const notInArr = !docIds.includes(doc.id);
      if (notInArr) {
        docIds.push(doc.id);
        // add dod.id to doc & push to docs array
        let obj = {}
        obj.id = doc.id;
        let merged = {...obj, ...doc.data()};
        docs.push(merged);
        console.log(doc.data().forename, " => ", doc.id);
      }
    });
  }
  //console.log("filterUsers - docs results", docs);
  return docs;
} 

// display the number of filtered portfolios
function setFolioNum(docs) {
  const folioNumContainer = document.querySelector('.project-showcase-text .folio-numbers');
  folioNumContainer.innerHTML = docs.length;
}

// return the docs to display accroding to the 'page='' param
function getDocsBatch(itemsPerPage, page, docs) {
  //console.log("itemsPerPage =",itemsPerPage, "| page =",page, "| docs.length =",docs.length);
  // get initial start and end items 
  let start = 0;
  let end;
  if (itemsPerPage < docs.length) {
    end = itemsPerPage;
  }
  else {
    end = docs.length;
  }
  // get start and end items for each page if using ?page=x param
  if(page) {
    page = page -1;
    start = page * itemsPerPage;
    end = start + itemsPerPage;
    if (start + itemsPerPage > docs.length) {
      end = docs.length; 
    }
  }
  console.log(docs.slice(start, end));
  return(docs.slice(start, end));
}

// if no filter or search results
function ifNoResults(docs) {
  //console.log("ifNoResults", docs.length);
  if (docs.length == 0) {
    // inject message
    const container = document.querySelector('#grad-preview-container');
    container.innerHTML = '<h2 class="text-center pt-5">It looks like there were no results...</h2><p class="text-center">Try a different filter or search term:<br>Search terms are best as a single keyword, like "Fashion" or "Smith".</p>';
  }
}


// get search term from form
function getSearchTerm() {
  const searchForm = document.querySelector('#search');
  let searchTerm = search.searchField.value.trim();
  return searchTerm;
}

// uncheck all Filters / check boxes and amend params
function uncheckAllFilters() {
  const allCheckboxes = document.querySelectorAll('#filters input');
  for (var i = 0; i < allCheckboxes.length; i++) {
    allCheckboxes[i].checked = false;
  }
  // delete all params then re add bar page and search
  //let page = getParamKey("page");
  let thisUrl = window.location.href;
  // Remove all parameters from the URL
  let amendedUrl = new URL(thisUrl.split('?')[0]);
  //if (page) {amendedUrl.searchParams.append("page", page)}
  window.history.pushState({}, '', amendedUrl);
}

// search keyword
async function searchKeyword(allDocs, searchStr) {
  searchStr = searchStr.trim();
  let searchArr = searchStr.split(' ');
  let docs = [];
  let docIds = [];
  let searchTerm
  let currentUrl = new URL(window.location);
  // loop through each word of the search terms
  for (var j = 0; j < searchArr.length; j++) {
    searchTerm = searchArr[j].trim();
    searchTerm = searchTerm.toLowerCase();
    // test all fields of all user docs for searchTerm
    for (var i = 0; i < allDocs.length; i++) {
      let isMatched = false;
      for (const [key, value] of Object.entries(allDocs[i])) {
        // test any value that is in string form
        if (typeof value === 'string') {
          let searchStr = value.toLowerCase();
          isMatched = searchStr.includes(searchTerm);
        }
        // test any value that is an array (categories etc)
        else if (Array.isArray(value)) {
          isMatched = value.includes(searchTerm);
        }
        // found add to results array docs
        if (isMatched) {
          const notInArr = !docIds.includes(allDocs[i].id);
          if (notInArr) {
            docIds.push(allDocs[i].id);
            docs.push(allDocs[i]);
          }
        }
      }
    }
  }
  // manage the parameters
  // delete search params then re add 
  currentUrl.searchParams.delete("searchField");
  currentUrl.searchParams.append("searchField", searchStr);
  window.history.pushState({}, '', currentUrl);
  return docs;
}


// POST A JOB FUNCTIONS
// create doc for job 
function createJobDoc() {
  const jobDetailsForm0 = document.querySelector('.post-job-form0');
  //console.log(jobDetailsForm0.firstname.value, jobDetailsForm0.lastname.value, jobDetailsForm0.email.value, jobDetailsForm0.phone.value);
  const jobDetailsForm1 = document.querySelector('.post-job-form1');
  let completionDate = new Date(jobDetailsForm1.completionDate.value);
  let applicationDeadline = new Date(jobDetailsForm1.applicationDeadline.value);
  let location = jobDetailsForm1.location.value;
  if(jobDetailsForm1.remoteRadio.checked) {
    location = "remote";
  }
  let categories = []; // send to db
  const allCategoryTags = document.querySelectorAll("#post-job-modal2 .filtertag.active");
  for (var i = 0; i < allCategoryTags.length; i++) {
    // save tags
    categories.push(allCategoryTags[i].name);
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
    categories: categories,
    createdAt: serverTimestamp(),
    approved: false
  })
  .then(function(){
    console.log("successfully created new job");
    const thankYou = document.querySelector("#thankYouModal");
    thankYou.innerHTML = "Thank you for your submission!";
    const spinner = document.querySelector(".submitting-spinner");
    spinner.style.display = "none";
    const thankYouTick = document.querySelector(".thank-you-tick");
    thankYouTick.style.display = "inline";
  });
}


// upload image - argument is a base64 string
// inserts a reference to the uploaded image/s into the logged into storgare using users profile
async function uploadBase64Image(base64string) {
  console.log("base64= " + base64string);
  // url is From Storage - not a new image - or doesn't exist - exit with a return
  if (base64string.includes("firebasestorage") || base64string == false) {
    return base64string;
  }
  // get filetype from string
  let fileSuffix = "";
  const fileTypes = ["png", "jpg", "jpeg", "svg"];
  // split string to get binary and test for what file ending
  const splitStr = base64string.split(",");
  const base64Type = splitStr[0];
  console.log(splitStr);
  for (var i = 0; i < fileTypes.length; i++) {
    if (base64string.includes(fileTypes[i])) {
      fileSuffix = fileTypes[i];
      console.log(fileTypes[i]);
      break;
    }
    else {
      console.log("file Type not found");
    }
  }
  // create upload url
  const randStr = Math.random().toString(36).substr(2, 5);
  const uploadUrl = "images/"+ currentUserData.uid + "/img-profile-"+randStr+"." + fileSuffix;
  console.log(uploadUrl);
  // if not from storage else return base64string
  const storageRef = ref(storage, uploadUrl);
  // upload
  const uploaded = await uploadString(storageRef, base64string, 'data_url')
  .then(function() {
    console.log('Uploaded a base64url string!', uploadUrl);
    
  })
  .catch(function(error){
    console.log("Error: uploading pic:", error); 
  });

  return uploadUrl;
}

// update user doc with profile pic image reference
async function updateUserDocProfilePic(imageUrl) {
  // update user profile with image url
  let docRef = doc(db, 'users', currentUserData.uid);
  const update = await updateDoc(docRef, {
    profilePic: imageUrl
  })
  .then(function () {
    console.log("added new profile image reference to user profile");
  });
} 


// upload images - argument is array of base64 strings
// inserts a reference to the uploaded image/s into the logged into storgare using users profile
async function uploadBase64Images(base64strings) {
  //console.log("base64s array= " + base64strings.length);
  let uploadUrls = [];
  // loop through all strings / images
  for (var i = 0; i < base64strings.length; i++) {
    // url is From Storage - not a new image - or doesn't exist - exit with a return
    if (base64strings[i].includes("firebasestorage") || base64strings[i] == false) {
      return base64strings[i];
    }
    // get filetype from string
    let fileSuffix = "";
    const fileTypes = ["png", "jpg", "jpeg", "svg"];
    // split string to get binary and test for what file ending
    const splitStr = base64strings[i].split(",");
    const base64Type = splitStr[0];
    //console.log("image: " + i, splitStr[0]);
    for (var j = 0; j < fileTypes.length; j++) {
      if (base64Type.includes(fileTypes[j])) {
        fileSuffix = fileTypes[j];
        //console.log("image: " + i, fileSuffix);
        break;
      }
    }
    // if couldn't find a filetype stop
    if (fileSuffix == "") {
      return;
    }
    // create upload url
    const randStr = Math.random().toString(36).substr(2, 5);
    const uploadUrl = "images/"+ currentUserData.uid + "/img-project-showcase-"+randStr+"." + fileSuffix;
    //console.log(uploadUrl);
    // if not from storage else return base64strings[i]
    const storageRef = ref(storage, uploadUrl);
    // upload
    const uploaded = await uploadString(storageRef, base64strings[i], 'data_url')
    .then(function() {
      console.log('Uploaded a base64url string!');
      //console.log('Uploaded a base64url string!', uploadUrl);
    })
    .catch(function(error){
      console.log("Error: uploading pic:", error); 
    });

    uploadUrls.push(uploadUrl);
  }
  return uploadUrls;
}


// get pdf file from edit-profile modal
function getFilePath(){
  const fileInput = document.querySelector('#edit-details #pdf-folio-file');
  let fileList = fileInput.files;
  if (fileList != 0) {
    // get the first file (should be only one)
    return fileList[0];
  }
  else {
    return;
  }
}


// upload file
async function uploadFile(filePath) {
  // if filePath is null (no uploaded file)
  if (! filePath) {
    console.log("filepath is ", filePath);
    return;
  }
  // update user data with doc url
  const docRef = doc(db, 'users', currentUserData.uid);

  // create upload url
  const uploadUrl = "files/"+ currentUserData.uid + "/folio.pdf";
  console.log(uploadUrl);
  // upload
  const storageRef = ref(storage, uploadUrl);
  // upload file - File API
  const uploaded = await uploadBytes(storageRef, filePath)
  .then(function(snapshot) {
    console.log('Uploaded file!');
    
    // update user profile with image urls
    updateDoc(docRef, {
      folioPdf: uploadUrl
    })
    .then(function () {
      console.log("added new file / pdf reference to user profile");
    })
  })
  .catch(function(error){
    console.log("Error: uploading file:", error); 
  });
}

// delete field file
async function deleteDocField(field){
  const docRef = doc(db, 'users', currentUserData.uid);
  // Remove the field from the document
  const removed = await updateDoc(docRef, {
      folioPdf: deleteField()
  })
  .catch(function(error){
    console.log("Error: removing file:", error); 
  });
}

function confirmDeletion(){
  const removedFolioPDF = document.querySelector("#edit-details .remove-pdf-file-feedback");
  removedFolioPDF.classList.remove("d-none");
}


// upload image - argument is an object - {upload url : blob url}
// inserts a reference to the uploaded image/s into the logged in users profile
/*async function uploadImage(urls) {
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

}*/


// add to profile 
/*function addToProfile(e, tags) {
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
}*/





//===========================================
//===========================================
//===========DOM FUNCTIONS===================

// set a param
function setParam(key, value) {
  let currentUrl = new URL(window.location); 
  currentUrl.searchParams.set(key, value);
  console.log(currentUrl); // "foo=1&bar=2&baz=3"
  window.history.pushState({}, '', currentUrl);
}

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

function deleteParam(key) {
  const urlParams = new URLSearchParams(location.search);
  urlParams.delete(key)
}

// ======SHOW JOB FUNCTIONS======

// add category buttons in the post job modal
function createCategoryButtons(){
  const categoryContainer = document.querySelector('#post-job-modal2 .category-tags');
  const categories = getCategories(); // imported obj
  for (var i = 0; i < categories.length; i++) {
    let categoryBtn = document.createElement('button');
    categoryBtn.type = "button";
    categoryBtn.className = "btn btn-primary filtertag";
    categoryBtn.autocomplete = "off";
    categoryBtn.dataset.bsToggle = 'button';
    categoryBtn.name = categories[i].category;
    categoryBtn.innerHTML = categories[i].description;
    // add to container
    categoryContainer.appendChild(categoryBtn);
  }
  
}

// show all jobs - jobs page
function displayAllJobs (itemsPerPage, page, jobCollection) {
  let jobContainer = document.querySelector(".all-job-data");
  jobContainer.innerHTML = "";
  // display total jobs available
  
  let jobCount = jobCollection.length;
  let jobCountContainer = document.querySelector(".jobs-available");
  jobCountContainer.innerHTML = "AVALABLE JOBS ("+jobCount+")";


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
      if(jobCollection[i].budget != "") {
        cost = "£"+jobCollection[i].budget;
      } 
      else if(jobCollection[i].hourlyrate != ""){
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
      if(jobCollection[i].duration != ""){
        completionVal = jobCollection[i].duration + " days";
      }
      else if(jobCollection[i].deadline != ""){
        let completionDate = new Date(jobCollection[i].deadline.seconds*1000);
        completionVal = completionDate.toLocaleString("en-GB", {day: "numeric", month: "numeric", year: "numeric"});
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
function createPagination(pageParam, itemsPerPage, docs) {
  // set forward and previous
  let totalPages = Math.ceil(docs/itemsPerPage);
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
  //console.log("forward " + forward);
  let previous;
  if (pageParam && currentPageNo != 1) {
    previous = parseInt(pageParam)-1;
  } 
  else {
    previous = 1;
  }
  //console.log("previous" + previous);
  
  let nav = document.querySelector(".pagination-nav"); 
  nav.innerHTML = "";
  let paginationUl = document.createElement("ul");
  paginationUl.className = "pagination paginationnav";
  
  // create page links / li elements
  let pageLinksLength = totalPages+2;

  for (var i = 0; i < pageLinksLength; i++) {  
    // set pagination urls
    let currentUrl = new URL(window.location);  
    let pageLi = document.createElement("li");
    pageLi.className = "page-item";
    let pageLink = document.createElement("a");
    if (i == currentPageNo) {
      pageLink.className = "page-link active";
    }
    else {
      pageLink.className = "page-link";
    }
    // previous
    if(i == 0) {
      pageLink.setAttribute("aria-label", "Previous");
      currentUrl.searchParams.delete('page');
      currentUrl.searchParams.append('page', previous);
      pageLink.href = currentUrl.href;
      pageLink.innerHTML = '<span aria-hidden="true"><i class="fa fa-chevron-left" aria-hidden="true"></i></span>';
    }
    // next
    else if (i == pageLinksLength-1) {
      pageLink.setAttribute("aria-label", "Next");
      currentUrl.searchParams.delete('page');
      currentUrl.searchParams.append('page', forward);
      pageLink.href = currentUrl.href;
      pageLink.innerHTML = '<span aria-hidden="true"><i class="fa fa-chevron-right" aria-hidden="true"></i></span>';
    }
    // page links
    else {
      currentUrl.searchParams.delete('page');
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
  if(jobData.budget != "") {
    cost = "£"+jobData.budget;
  } 
  else if(jobData.hourlyrate != ""){
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
  if(jobData.duration != ""){
    completionVal = jobData.duration + " days";
  }
  else if(jobData.deadline != ""){
    let completionDate = new Date(jobData.deadline.seconds*1000);
    completionVal = completionDate.toLocaleString("en-GB", {day: "numeric", month: "numeric", year: "numeric"});
  } 

  let completion = document.createElement("p");
  completion.innerHTML = "<i class='fa-solid fa-arrow-trend-up'></i>  Completion: <strong>"+completionVal+"</strong>";

  jobDetails.appendChild(budget);
  jobDetails.appendChild(applyBy);
  jobDetails.appendChild(location);
  jobDetails.appendChild(completion);

  let jobDescription = document.querySelector(".job-description");
  jobDescription.innerHTML = jobData.longdescription;

  let tagContainer = document.querySelector(".tag-container");
  const categories = getCategories(); // from import
  for (var i = 0; i < jobData.categories.length; i++) {
    let category = jobData.categories[i];
    // match category in imported array
    let categoryObj = categories.find(function(x){
      return x.category === category;
    });
    console.log(categoryObj);
    let tagBtn = document.createElement("span");
    tagBtn.setAttribute("style", "text-transform: capitalize;cursor: default;");
    tagBtn.className = "btn btn-primary filtertag";
    tagBtn.name = category;
    //tagBtn.href = "#";
    tagBtn.innerHTML = categoryObj.description;

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
  const profilePic = document.querySelector('.navbar .profile-pic');
  const liDropdown = document.querySelector('.navbar .dropdown');
  const navbar = document.querySelector('.navbar .navbar-nav');
  // create profile pic
  // reset profile pic
  profilePic.innerHTML = ""
  let img = document.createElement('img');
  img.width = "32";
  img.height = "32";
  img.src = "./assets/img/generic-profile.jpg";
  img.alt = forename + " " + surname;
  img.className = "rounded-circle mx-1";
  profilePic.appendChild(img);
  // create dropdown
  let dropdownAnchor = document.createElement('a');
  dropdownAnchor.className = "nav-link dropdown-toggle";
  dropdownAnchor.href = "#";
  dropdownAnchor.id = "navbarDropdown";
  dropdownAnchor.role = "button";
  dropdownAnchor.dataset.bsToggle = 'dropdown';
  dropdownAnchor.setAttribute("aria-expanded", "false");
  dropdownAnchor.innerHTML = forename + " " + surname;
  liDropdown.appendChild(dropdownAnchor);

  let ul = document.createElement("ul");
  ul.className = "dropdown-menu";
  ul.setAttribute("aria-labelledby", "navbarDropdown");
  // Dashboard dropdown link
  let li = document.createElement("li");
  let a = document.createElement("a");
  // line break
  let hr = document.createElement("hr");
  // Folio dropdown link
  li = document.createElement("li");
  a = document.createElement("a");
  a.className = "dropdown-item portfolio";
  a.href = 'profile.html?id='+id+ "&preview=true";
  a.innerHTML = "<i class=\"bi bi-person\"></i> Portfolio profile";
  li.appendChild(a);
  ul.appendChild(li);
  // line break
  hr = document.createElement("hr");
  ul.appendChild(hr);
  // account dropdown link
  li = document.createElement("li");
  a = document.createElement("a");
  a.className = "dropdown-item account";
  a.href = 'account.html?id='+id;
  a.innerHTML = "<i class=\"bi bi-gear\"></i> Account settings";
  li.appendChild(a);
  ul.appendChild(li);
  // line break
  hr = document.createElement("hr");
  ul.appendChild(hr);
  // sign out dropdown link
  li = document.createElement("li");
  a = document.createElement("a");
  a.className = "dropdown-item sign-out";
  a.href = 'profile.html?id='+id;
  a.innerHTML = "<i class=\"bi bi-box-arrow-right\"></i> Sign Out";
  li.appendChild(a);
  ul.appendChild(li);
  a.addEventListener('click', signOutUser);

  liDropdown.appendChild(ul);
}


// show signed out user
function showSignedOutUser() {
  const profilePic = document.querySelector('.navbar .profile-pic');
  const liDropdown = document.querySelector('.navbar .dropdown');
  const navbar = document.querySelector('.navbar .navbar-nav');
  // delete drop down contents & profile pic
  profilePic.innerHTML = ""
  liDropdown.innerHTML = "";
  // create sign in button
  //let li = document.createElement('li');
  let a = document.createElement('a');
  a.className = 'btn btn-outline-primary mx-1 sign-in';
  //a.href = 'login.html';
  a.dataset.bsToggle = 'modal';
  a.dataset.bsTarget = '#signInModal';
  a.innerHTML = 'Sign in';
  //li.className = 'nav-item pe-3';
  liDropdown.appendChild(a);
  //navbar.appendChild(li);
  // create post job button
  //li = document.createElement('li');
  a = document.createElement('a');
  a.className = 'btn btn-primary mx-2 post-job';
  a.href = '#';
  a.dataset.bsToggle = 'modal';
  a.dataset.bsTarget = '#post-job-modal0';
  a.innerHTML = 'Post job';
  //li.className = 'nav-item';
  liDropdown.appendChild(a);
  //navbar.appendChild(li);
}




// ======CREATE AND EDIT PROFILE FUNCTIONS======

// launch intro modal
function introModal(show) {
  const modalIntro = new bootstrap.Modal(document.querySelector('#inital-sign-up'));
  if (show) {
    modalIntro.show();
  }
}

// update bio info using modal
async function updatePersonalDetails(uid){
  //console.log("update personal details");
  const updateDetailsForm = document.querySelector('.change-Details');
  updateDoc(doc(db, "users", uid), {
    forename: updateDetailsForm.forename.value,
    surname: updateDetailsForm.surname.value,
    pronouns: updateDetailsForm.pronouns .value,
    businessName: updateDetailsForm.businessName.value,
    jobTitle: updateDetailsForm.jobTitle.value,
    location: updateDetailsForm.userLocation.value,
    website: updateDetailsForm.webLink.value,
    bio: updateDetailsForm.bio.value.replace(/\n\r?/g, '<br>'),
  })
  .then(function(){
    console.log("successfully updated user doc");
  })
  .catch(function(error){
    console.log("Error: Getting document:", error); 
  });
}

// update tags using modal
async function updateSkillsTags(uid){
  //console.log("update tags");
  // get active buttons / tag from skill-categories modal
  let tagEls = document.querySelectorAll("#skills-categories .tab-pane button.active");
  let tagList = [];
  let categoryList = [];
  const categories = getCategories(); // fom import
  for (var i = 0; i < tagEls.length; i++) {
    // create tags array
    let tag = tagEls[i].dataset.skills;
    tagList.push(tagEls[i].dataset.skills);
    // create category array
    let category = tag.split("-");
    console.log(category[0]);
    // match category in imported array
    let categoryObj = categories.find(function(x){
      return x.category === category[0];
    });
    // add to category list if not already present
    if (! categoryList.includes(categoryObj.category)) {
      categoryList.push(categoryObj.category);
    }
  }
  
  updateDoc(doc(db, "users", uid), {
    tags: tagList,
    categories: categoryList
  })
  .then(function(){
    console.log("successfully updated user doc with new tags");
  })
  .catch(function(error){
    console.log("Error: Getting document:", error); 
  });
}

// update social media links using modal
async function updateSocialsLinks(uid){
  console.log("update social links");  
  let socialsForm = document.querySelector("#social-modal .SocialMedia");
  let socialsList = [];
  if (socialsForm.socialSelect1.value != "default") {
    let social1 = {};
    social1[socialsForm.socialSelect1.value] = socialsForm.socialInput1.value;
    socialsList.push(social1);
  }
  if (socialsForm.socialSelect2.value != "default") {
    let social2 = {};
    social2[socialsForm.socialSelect2.value] = socialsForm.socialInput2.value;
    socialsList.push(social2);
  }
  if (socialsForm.socialSelect3.value != "default") {
    let social3 = {};
    social3[socialsForm.socialSelect3.value] = socialsForm.socialInput3.value;
    socialsList.push(social3);
  }

  //console.log(socialsList);
  updateDoc(doc(db, "users", uid), {
    socials: socialsList
  })
  .then(function(){
    console.log("successfully updated user doc with new social links");
  })
  .catch(function(error){
    console.log("Error: Getting document:", error); 
  });
}

// show bio info / personal info in personal details modal
function populatePersonalDetailsModal(vals){
  let forename = document.querySelector("#edit-details #bio-edit-firstname");
  forename.value = vals.forename;
  let surname = document.querySelector("#edit-details #bio-edit-lastname");
  surname.value = vals.surname;
  // add profile image
  if (vals.businessName) {
    let businessName = document.querySelector("#edit-details #business-name");
    businessName.value = vals.businessName;
  }
  if (vals.pronouns) {
    let pronouns = document.querySelector("#edit-details #pronoun-selection");
    pronouns.value = vals.pronouns;
  }
  if (vals.jobTitle) {
    let jobTitle = document.querySelector("#edit-details #job-title");
    jobTitle.value = vals.jobTitle;
  }
  if (vals.location) {
    let location = document.querySelector("#edit-details #user-location");
    location.value = vals.location;
  }
  if (vals.website) {
    let website = document.querySelector("#edit-details #user-website");
    website.value = vals.website;
  }
  if (vals.bio) {
    let bio = document.querySelector("#edit-details #user-bio");
    bio.value = vals.bio.replace(/<br\s*[\/]?>/gi, "\n");
  }
}

// show personal details in the bio column of edit-profile
function populateBio(vals) {
  // available for work
  try {
    let available = document.querySelector("section #available-for-work");
    if (vals.available) {
      available.checked = true;
    }
    else {
      available.checked = false;
    }
  }
  catch(err) {
    console.log(err.message);
  }
  
  // name
  let name = document.querySelector("section #personal-details-name");
  name.innerHTML = vals.forename + " " + vals.surname;
  // title
  let jobTitle = document.querySelector("section #personal-details-title");
  jobTitle.innerHTML = vals.jobTitle;
  // website
  let website = document.querySelector("section #personal-details-link");
  website.innerHTML = "<a target='_blank' href='"+vals.website+"'>"+vals.website+"</a>";
  // location
  let location = document.querySelector("section #personal-details-location");
  location.innerHTML = vals.location;
  // bio
  try {
    let bio = document.querySelector("section #personal-details-bio");
    bio.innerHTML = vals.bio;
  }
   catch(err) {
    console.log(err.message);
  }
}

// populate downloadable file
function populateDownloadFile(vals){
  const downloadPanel = document.querySelector('.download-portfolio');
  const downloadLink = document.querySelector('.download-portfolio .download-link');
  const downloadSize = document.querySelector('.download-portfolio .size-text');
  
  if(vals.folioPdf) {
    // get download link
    const storageRef = ref(storage, vals.folioPdf);
    // get download image ref - don't need this 
    getDownloadURL(storageRef)
      .then(function(url) {
        // add to edit profile panel
        downloadLink.href = url;
      })
      .catch(function(err){
        console.log("download link error", err);
      })
    // get matadata add link, text, size
    getMetadata(storageRef)
      .then(function(metadata) {
        //console.log(metadata);
        downloadSize.innerHTML = Math.round(metadata.size/1000) + " KB";
      })
      .catch(function(err) {
        console.log("metadata error", err);
      });
    // un hide panel
    downloadPanel.classList.remove("d-none");
  }
  else {
    // hide panel
    console.log("no download pdf");
    downloadPanel.classList.add("d-none");
    downloadSize.innerHTML = "";
    downloadLink.href = "#";
  }
}

// populate skills tags modal
function populateSkillsModal(vals){
  if (vals.tags) {
    for (var i = 0; i < vals.tags.length; i++) {
      let el = document.querySelector('[data-skills="'+vals.tags[i]+'"]');
      el.classList.add("active");
    }
  }
}

// populate personal details modal with a saved profile pic
function populateProfilePicModal(vals) {
  // exit if not profile pic
  if (! vals.profilePic) {
    return;
  }
  const profilePicContainer = document.querySelector('#edit-details #display-image');
  const storageRef = ref(storage, vals.profilePic);
  // get download image ref - don't need this 
  getDownloadURL(storageRef)
    .then(function(url) {
      //console.log(url);
      // add to modal as background image
      profilePicContainer.style.backgroundImage = "url("+url+")";
    })
}

// populate personal details edit page with a saved profile pic
function populateProfilePic(vals) {
  // exit if not profile pic
  if (! vals.profilePic) {
    return;
  }
  const profilePicContainer = document.querySelector('section .profile-img div');
  const storageRef = ref(storage, vals.profilePic);
  // get download image ref - don't need this 
  getDownloadURL(storageRef)
    .then(function(url) {
      //console.log(url);
      // add to modal as background image
      profilePicContainer.style.backgroundImage = "url("+url+")";
    })
}

function populateProfilePicNav(vals) {
  const profilePicContainer = document.querySelector('.navbar .profile-pic img');
  // if not profile pic return
  if (! vals.profilePic) {
    return;
  }
  //console.log(vals.profilePic);
  const storageRef = ref(storage, vals.profilePic);
  // get download image ref - don't need this 
  getDownloadURL(storageRef)
    .then(function(url) {
      //console.log(url);
      // add to modal as background image
      profilePicContainer.src = url;
    })
}

// populate skills in bio section of edit
function populateSkills(vals){
  // remove existing skills tags to avoid duplication
  let allTagContainers = document.querySelectorAll('#skills-categories-list .skills-tags');
  for (var i = 0; i < allTagContainers.length; i++) {
    allTagContainers[i].innerHTML = "";
  } 
  // if there are some skills tags - hide placeholder
  let placeholder = document.querySelector('.placeholder-category');
  if (vals.tags && vals.tags.length > 0) {
    placeholder.classList.add("d-none");
  } else {
    placeholder.classList.remove("d-none");
  }
  // find tags and categories
  try {
    for (var i = 0; i < vals.tags.length; i++) {
      // find category
      let category = vals.tags[i].split('-');
      // unhide category
      let el = document.querySelector('[data-category="'+category[0]+'"]');
      el.classList.remove('d-none');    
      // add tag
      let tagTitle = vals.tags[i].replace(category[0], "").replace("-", "");
      tagTitle = tagTitle.split('-').join(' ');
      //let tagEl = "<div class=\"filter-tag-profile\">"+tagTitle+"</div>";
      let tagEl = document.createElement('div');
      tagEl.className = "filter-tag-profile text-capitalize";
      tagEl.innerHTML = tagTitle;
      let tagContainer = document.querySelector('[data-category="'+category[0]+'"] .skills-tags');
      tagContainer.appendChild(tagEl);
    }
  }
  catch(err) {
    console.log(err);
  }
  
  // hide categories title if no div skill-tags
  for (var i = 0; i < allTagContainers.length; i++) {
    if (allTagContainers[i].innerHTML == "") {
      //console.log("empty", allTagContainers[i])
      allTagContainers[i].parentElement.classList.add("d-none");
    }
  } 
}

// populate socials modal
function populateSocialsModal(vals) {
  //console.log(vals.socials);
  // exit if no socials
  if (! vals.socials) {
    return;
  }
  for (var i = 0; i < vals.socials.length; i++) {
    //console.log(vals.socials[i]);
    let entries = Object.entries(vals.socials[i]);
    let key = entries[0][0];
    let value = entries[0][1];
    //console.log(entries[0][0], entries[0][1]); 
    if (i == 0) {
      showSocialDiv0();
      document.querySelector("#SocialMedia-1-Select-input").value = key;
      document.querySelector("#Social-Media-1-user-input").value = value;
    } else if (i == 1) {
      showSocialDiv1();
      document.querySelector("#SocialMedia-2-Select-input").value = key;
      document.querySelector("#Social-Media-2-user-input").value = value;
    }
    else if (i == 2) {
      showSocialDiv2();
      document.querySelector("#SocialMedia-3-Select-input").value = key;
      document.querySelector("#Social-Media-3-user-input").value = value;
    }
  }
}

// populate socials in edit page
function populateSocials(vals) {
  console.log("add social links");
  // exit if no socials
  if (! vals.socials) {
    return;
  }
  const icons = {"instagram" : "./assets/img/InstagramSocial.svg", "twitter": "./assets/img/TwitterSocial.svg", "facebook": "./assets/img/FaceBookIcon.svg", "dribble": "./assets/img/WebSocialIcon.svg"};
  const socialContainer = document.querySelector("section .socials-details");
  // empty the div to prevent duplication
  socialContainer.innerHTML = "";
  // create and ad social links with icons
  for (var i = 0; i < vals.socials.length; i++) {
    let socialObject = vals.socials[i];
    let keys = Object.keys(socialObject);  
    //console.log(keys[0], socialObject[keys[0]]);
    let container = document.createElement('div');
    container.className = "col-4 col-md-4 col-lg-4 col-xl-4";
    let link = document.createElement('a');
    link.href = socialObject[keys[0]];
    let img = document.createElement("img");
    img.src = icons[keys[0]];
    link.appendChild(img);
    container.appendChild(link);
    socialContainer.appendChild(container);
  }
}



// ======CREATE AND EDIT PROFILE SHOWCASE FUNCTIONS======

// create cards with thumbs and details for each project showcase
function populateProjectShowcases(vals) {
  //console.log(vals.projects);
  // exit if no project showcases
  if (vals.projects == null) {
    return;
  }
  const showcaseContainer = document.querySelector('#projects-showcase-container');
  const showcaseAddBtn = document.querySelector('#add-project-showcase');
  showcaseContainer.innerHTML = "";
  let showcaseTotal = 0;
  for (const [key, value] of Object.entries(vals.projects)) {
    //console.log(key, value.name +"\n"+ value.images);
    // add html
    showcaseTotal ++;
    let description = '';
    if (value.description != "") {description = '<p id="'+key+'-description">'+value.description+'</p>'}
    let link = '';
    if (value.link != "") {link = '<p><a class="underline" href="'+value.link+'" target="_blank">'+value.link+'</a></p>'}
    /*let valueStr = JSON.stringify(value);
    console.log(valueStr);*/
    let projectName = value.name;
    console.log(projectName);
    let showcaseComponent = '<!--start of project showcase--> <div class="col-lg-6 col-md-12 mt-4"> <div class="port-block"> <div id="'+key+'-hero-img" class="row"> <!-- inject hero col and image --> </div><div id="'+key+'-thumbs" class="row d-flex justify-content-evenly"> <!-- inject thumbs --> </div> <div class="row"> <div class="col-10 mt-4"> <h2><strong id="'+key+'-name">'+value.name+'</strong></h2> </div> <div class="col-2 mt-4"> <button class="dropdown-edit float-right" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false"> <i class="bi bi-pencil-square cursor-pointer edit-size" height="16px"> </i> </button> <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1"> <li> <a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#editProject" data-id="'+key+'" onclick="populateProjectModal(\''+key+'\',\''+value.link+'\')" href="#">Edit Project </a> </li> <li> <hr class="dropdown-divider"> </li> <li> <a class="dropdown-item text-danger" data-id="'+key+'" href="#" data-bs-toggle="modal" data-bs-target="#deleteShowcase" onclick="populateDeleteModal(\''+key+'\')">Delete Project </a> </li> </ul> </div> </div> <div class="row"> <div class="col-12">'+description+link+'</div> </div> </div> </div> <!--end of project showcase--> ';
    // add showcase
    showcaseContainer.innerHTML += showcaseComponent;    
    // get and add images
    for (var i = 0; i < value.images.length; i++) {
      //value.images[i]
      // get download link
      const storageRef = ref(storage, value.images[i]);
      let imgUrl = value.images[i];
      //console.log(imgUrl);
      // get download image ref 
      getDownloadURL(storageRef)
        .then(function(url) {
          // add thumbnail
          document.querySelector('#'+key+'-thumbs').innerHTML += '<div class="col-4 mt-4 d-flex align-items-center port-edit-img"> <img alt="graduate artwork" class="rounded-3 img-fluid" onclick="swapHeroImg(this, \'hero-'+key+'\')" src="'+url+'" data-imgurl="'+imgUrl+'"> </div>';
          // add hero
          document.querySelector('#'+key+'-hero-img').innerHTML = '<div class="col-12"> <img alt="graduate artwork" class="port-edit-img-main" id="hero-'+key+'" src="'+url+'"> </div> ';
          
        })
        .catch(function(err){
          console.log("download link error", err);
        })
    }
  }
  // remove add showcase button if 4 showcases
  if (showcaseTotal > 3) {
    showcaseAddBtn.classList.add("d-none");
  }
  else {
    showcaseAddBtn.classList.remove("d-none");
  }
}

// populate project showcase modal // NOTE at the bottom of edit-profile to use onclick
/*function populateProjectModal(projectId, projectInfo) {
  console.log(projectId, projectInfo);
}*/

async function deleteProjectShowcase(uid, vals) {
  const modalForm = document.querySelector('#deleteShowcase #delete-project-form');
  const projectId = modalForm.projectId.value;
  let allProjects = vals.projects;
  delete allProjects[projectId];
  // update doc
  const updated = await updateDoc(doc(db, "users", uid), {
    projects: allProjects,
  })
  .then(function(){
    console.log("successfully deleted project from user doc");
  })
  .catch(function(error){
    console.log("Error: Getting document:", error); 
  });
  return projectId;

}

// add or update a project showcase details
async function updateProjectShowcase(uid, imageUrls){
  // get form content
  const projectForm = document.querySelector('#editProject .edit-project-form');
  let project = {};
  let projectDetails = {};
  let projectId = projectForm.projectId.value;
  let randomStr = "id-"+(Math.random() + 1).toString(36).substring(7);
  if (! projectForm.projectId.value) {
    projectId = randomStr;
  }
  let projectName = projectForm.projectName.value;
  projectName = projectName.replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  projectDetails.name = projectName;
  projectDetails.link = projectForm.projectLink.value;
  let projectDescription = projectForm.projectDescription.value;
  projectDescription = projectDescription.replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  projectDetails.description = projectDescription;
  projectDetails.images = imageUrls;
  project[projectId] = projectDetails;
  // update doc
  const updated = await setDoc(doc(db, "users", uid), {
    projects: project,
    //"projects.projectId.images": imageUrls
  }, { merge: true })
  .then(function(){
    console.log("successfully updated user doc with new project details");
  })
  .catch(function(error){
    console.log("Error: Getting document:", error); 
  });
  return projectId;
}

// get new upload images for a project showcase 
function getUploadImgs(){
  // get images using data attr
  const imageContainers = document.querySelectorAll('#editProject .upload__img-box [data-preloaded="false"]');
  let dataImgUrls = [];
  for (var i = 0; i < imageContainers.length; i++) {
    const url = imageContainers[i].style.backgroundImage.slice(5, -2);
    dataImgUrls.push(url);
  }
  //console.log(dataImgUrls);
  return dataImgUrls;
}

// urls of preloaded images for a project showcase 
function getPreloadedImgs(){
  // get images using data attr
  const imageContainers = document.querySelectorAll('#editProject .upload__img-box [data-preloaded="true"]');
  let preloadedImgUrls = [];
  for (var i = 0; i < imageContainers.length; i++) {
    const url = imageContainers[i].dataset.ref;
    preloadedImgUrls.push(url);
  }
  return preloadedImgUrls;
}


// OLD
// watch for new uploaded images add edit caption icon
/*function uploadImageWatcher(){
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
}*/

// OLD
// save edited caption from caption modal to hidden input for upload image
/*function saveCaption(e) {
	e.preventDefault();
	// copy value from caption modal input to hidden imput
	const captionModalInput = document.querySelector('#captionModal #caption');
	const hiddenInputName = captionModalInput.name;
	const hiddenInput = document.querySelector('.add-profile [name="'+hiddenInputName+'"]');
	hiddenInput.value = captionModalInput.value;
	// close modal
	$("#captionModal").modal("hide");	
}*/

// save edited hero switch from caption modal to hidden input for upload image
/*function saveHero(e) {
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
}*/

// OLD
/*// show profile preview
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
}*/


// get upload image portrait url - return an object with all the new upload image urls
function getProfileImageUrl(){
  const imageDiv = document.querySelector('#edit-details #display-image');
  const url = imageDiv.style.backgroundImage.slice(5, -2);
  //console.log(images);
  return url; 
}


// old check if needed before delete
// get upload image urls - return an object with all the new upload image urls
/*async function getImageUrls(e){
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
}*/

// OLD
// show all existing profile data in form fields
/*function showProfileData(userData) {
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
}*/




// show profile 
/*function showProfile(userData) {
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
}*/

// ======PROFILE FUNCTIONS======

// add edit btn to current user
function showEditBtn (userID, paramID) {
  const backContainer = document.querySelector('section .edit-profile-back-container');
  if (userID == paramID) {
    console.log(userID, paramID, "showEditBtn current user id");
    const btnContainer = document.querySelector('section .edit-profile-btn-container');
    let btn = document.createElement('button');
    btn.className = "btn btn-primary btn-lg btn-block float-right";
    btn.innerHTML = "Edit profile";
    btnContainer.appendChild(btn);
    btn.addEventListener('click', function (e) {
      window.location.href = "edit-profile.html?id="+userID;
    })
  }
  // hide go back to folios if preview
  if (getParamKey("preview") == "true") {
    backContainer.innerHTML = "";
  }
  else {
    backContainer.innerHTML = '<a onclick="history.back()" href="#"><i class="bi bi-chevron-left"></i> Back</a>';
  }
}


// create carousel navigation for profile page showcases
// using https://splidejs.com/
function populateShowcasesNav(vals) {
  // exit if no project showcases
  if (vals.projects == null) {
    return;
  }
  const showcaseNavContainer = document.querySelector('#project-showcase-nav');
  let navComponentStart = '<!-- project showcase nav --> <div class="splide" aria-label="Portfolio navigation"> <div class="splide__track"> <ul class="splide__list">';
  let navComponentEnd = '</ul> </div> </div> <!-- project showcase nav -->';
  let navComponentSlides = "";
  // get images
  for (const [key, value] of Object.entries(vals.projects)) {
    //console.log(key, value.name);
    // create a slide for each image
    navComponentSlides += '<li class="splide__slide"><img data-id="'+key+'" src="" class="portfolio-header-img" onclick="showcaseShow(\''+key+'\');"></li>';

    //navComponentSlides += '<li class="splide__slide"><div data-id="'+key+'" class="portfolio-header-img" onclick="showcaseShow(\''+key+'\');" style="background-size: cover;background:rgba(50,50,50,0.25);"><div style="background:rgba(50,50,50,0.25);" class="px-3 text-light text-center w-100 h-100 d-flex justify-content-center align-items-center">'+value.name+'</div></div></li>';

    try {
      // get download link
      const storageRef = ref(storage, value.images[0]);
      getDownloadURL(storageRef)
        .then(function(url) {
          // add image to slide
          document.querySelector('#project-showcase-nav img[data-id="'+key+'"]').src = url;  
          //document.querySelector('#project-showcase-nav div[data-id="'+key+'"]').style.backgroundImage = "url('"+url+"')";       
        })
        .catch(function(err){
          console.log("download link error", err);
        });
    }
    catch(err) {
      console.log(err);
    }
    
  }
  showcaseNavContainer.innerHTML = navComponentStart + navComponentSlides + navComponentEnd;
  createCarousel();
}


// create showcases for profile page
async function populateShowcases(vals) {
  const showcaseContainer = document.querySelector('#project-showcase');
  // exit if no project showcases
  if (vals.projects == null) {
    // if no projects add no showcase projects placeholder image
    showcaseContainer.innerHTML = '<div class="text-center"><img class="img-fluid" alt="No showcase projects to show" src="https://via.placeholder.com/600x600/e9ecef?text=No+project+showcase+placeholder"></div>';
    return;
  }
  let index = 0;
  let showcaseVisibility = "";
  // make previous and next
  let previousID = "";
  let nextID = "";
  let keys = [];
  // create array of showcase ids
  for (const [key, value] of Object.entries(vals.projects)) {
    keys.push(key);
  }

  for (const [key, value] of Object.entries(vals.projects)) {
    let heroImages = "";
    let thumbImages = "";
    let activeSlide = "";
    //let activeThumb = "document.querySelector(\"#project-showcase-nav img[data-id="+key+"]\")";
    let activeThumb = document.querySelector('#project-showcase-nav img[data-id=\"id-2t4w4f\"]'); // doesnt work
    //console.log(document.querySelector('#project-showcase-nav img[data-id=\"id-2t4w4f\"]'));
    if (index > 0) {
      showcaseVisibility = "d-none";
    }

    if (index > 0) {
      previousID = '<a class="text-nowrap showcase-text-nav" onclick="showcaseShow(\''+keys[index-1]+'\');event.preventDefault();" href="#!"><i class="bi bi-chevron-left"></i> Previous</a>'; 
      //console.log(keys[index-1]);
    }
    else {
      //console.log("no previous");
    }
    if (index < keys.length-1) {
      //nextID = keys[index+1];
      nextID = '<a class="text-nowrap showcase-text-nav" onclick="showcaseShow(\''+keys[index+1]+'\');event.preventDefault();" href="#!">Next <i class="bi bi-chevron-right"></i></a>';
      //console.log(keys[index+1]);
    }
    else {
      //console.log("no next");
      nextID = "";
    }

    index++;
    for (var i = 0; i < value.images.length; i++) {
      //console.log(value.images[i]);
      if (i == 0) {
        activeSlide = "active";
      } else {
        activeSlide = "";
      }
      heroImages += '<div class="carousel-item '+activeSlide+'"><img id="hero-'+i+'-'+key+'" src="assets/img/dummy-900X600.png" alt="'+value.name+' thumbnail image" class="d-block w-100 carousel-main-size"></div>';
      thumbImages += '<div data-bs-target="#carouselslider-'+key+'" class="active carousel-thumbs" data-bs-slide-to="'+i+'"><img id="thumb-'+i+'-'+key+'" src="assets/img/dummy-900X600.png" alt="'+value.name+' thumbnail image" class="d-block w-100 carousel-thumbnail-size rounded-border"></div>';
    }
    let link = "";
    if (value.link) {
      link = '<p><a href="'+value.link+'">'+value.link+'</a></p>';
    }
    let showcaseStart = '<div class="'+showcaseVisibility+' project-showcase" id="'+key+'"> <div class="row text-center my-5"> <div class="col-3"> '+previousID+' </div> <div class="col-6 justify-content-center"> <h3><b>'+value.name+'</b></h3> </div> <div class="col-3"> '+nextID+' </div> </div>';
    let showcaseCarousel = '<!--carousel--> <div id="carouselslider-'+key+'" class="carousel slide" data-bs-ride="carousel"> <div class="carousel-showcase-container"> <!-- hero flex col --> <div class="carousel-showcase-hero pe-2"> <div class="carousel-inner rounded-border"> '+heroImages+' </div> </div> <!-- thumb flex col --> <div class="carousel-showcase-thumbs"> <!-- Indicator start --> <div class="carousel-indicators"> '+thumbImages+' </div> </div> <!-- Indicator Close --> </div> </div> <!--carousel-->';
    let showcaseEnd = '<!-- text block --> <div class="row text-left"> <div class="col-md-12 pt-4"> <p>'+value.description+'</p> '+link+' </div> </div> <!-- text block --> </div> <!-- showcase -->';
    showcaseContainer.innerHTML += showcaseStart + showcaseCarousel + showcaseEnd;
    // get images
    for (var j = 0; j < value.images.length; j++) {
      let heroImgID = "#hero-"+j+"-"+key;
      let thumbImgID = "#thumb-"+j+"-"+key;
      // get download link
      const storageRef = ref(storage, value.images[j]);
      getDownloadURL(storageRef)
        .then(function(url) {
          // add image to slide
          document.querySelector(heroImgID).src = url;
          document.querySelector(thumbImgID).src = url;        
        })
        .catch(function(err){
          console.log("download link error", err);
        });
    }
  }

}

// add freelancer name to contact modal
function populateContactModals(vals) {
  // message modal & success modal
  const nameContainer = document.querySelector('#grad-message-modal .modal-title span');
  if (vals.forename) {
    nameContainer.innerHTML = vals.forename + " " + vals.surname; // message modal
  } else {
    nameContainer.innerHTML = "stiwdio member";
  }
}

// get values from contact form
function getContactMeFormValues(vals) {
  const sendGradMessageForm = document.querySelector('#grad-message-modal .send-grad-message');
  let formValues = {};
  //formValues.message = "test from contact form";
  formValues.message = "<h2>This is a message to Freelancer: "+vals.forename+" "+vals.surname+"<br>Email: "+vals.email+" <br>Student ID: "+vals.studentid+"<br>Profile: <a href="+window.location.href+">"+window.location.href+"</a></h2><h2>Message From prospective client: "+sendGradMessageForm.forename.value+" "+sendGradMessageForm.surname.value+"<br>Email: "+sendGradMessageForm.email.value+"<br>Tel: "+sendGradMessageForm.phone.value+"</h2><h2>Message:</h2><p>"+sendGradMessageForm.message.value+"</p>";
  formValues.from = sendGradMessageForm.email.value;
  formValues.to = "stiwdiofreelanceragency@gmail.com";
  return formValues;
}


// confirm ent from contact from - change spinner and message on thank-you / confirmation modal
function messageSentConfirmation(vals) {
  const messageTitle = document.querySelector("#help-thank-you .modal-title");
  messageTitle.innerHTML = "Thank you for your message!";
  const message = document.querySelector("#help-thank-you .modal-message");
  message.innerHTML = "<p>Your message will be sent to our admin team who will forward it to  "+vals.forename+" "+vals.surname+"</p>";
  const spinner = document.querySelector("#help-thank-you .sending-spinner");
  spinner.style.display = "none";
  const thankYouTick = document.querySelector("#help-thank-you  .sent-thank-you-tick");
  thankYouTick.style.display = "inline";
}


// ======POST JOB FUNCTIONS======
// create tag checkboxes
/*function createTagCheckboxes() {
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
}*/


// add tag badge on change
/*function addTagBadge(){
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
}*/


// return checked tags
/*function getTags(){
  let tags = [];
  // get tags
  const tagCheckboxes = document.querySelector('#tag-checkboxes').getElementsByTagName('input');
  for (var i = 0; i < tagCheckboxes.length; i++) {
    if (tagCheckboxes[i].checked) {
      tags.push(tagCheckboxes[i].value);
    }
  }
  return tags;
}*/


// ======ACCOUNT SETTINGS FUNCTIONS======

// disable the availability tag
function populateAvailability(vals){
  const available = document.querySelector('.available-tag');
  if (! vals.available) {
    available.classList.add("availability-disabled");
    available.innerHTML = "Not available";
  } 
  else {
    available.classList.add("availability-active");
    available.innerHTML = "Available for work";
  }
}

// populate phone and email
function populateAcccountDetails(vals){
  const settingsForm = document.querySelector('.edit-details-form');
  if (vals.phone) {
    settingsForm.phone.value = vals.phone;
  }
  settingsForm.email.value = vals.email;
}

async function saveDetails(uid) {
  const settingsForm = document.querySelector('.edit-details-form');
  const successMsg = document.querySelector('.edit-details-form .save-success');
  const errMsg = document.querySelector('.edit-details-form .save-error');
  const updated = await updateDoc(doc(db, "users", uid), {
    phone: settingsForm.phone.value,
    email: settingsForm.email.value
  })
  .then(function(){
    console.log("successfully updated user doc");
  })
  .catch(function(error){
    console.log("Error: Getting document:", error); 
  });

  // update login auth email
  updateEmail(auth.currentUser, settingsForm.email.value).then(function() {
    // Email updated!
    console.log("Email updated!");
    successMsg.classList.remove("d-none");
  }).catch(function(error) {
    // An error occurred
    console.log("Error: updating email:", error); 
    errMsg.classList.remove("d-none");
  });
}

// delete profile
async function deleteProfile(uid){
  const user = auth.currentUser;
  deleteUser(user).then(function() {
    console.log("user deleted");
    window.location.href = "index.html";
    // delete use then delete doc
    deleteDoc(doc(db, 'users', uid))
      .then(function(){
        console.log("user doc deleted");
      });
  }).catch(function(error) {
    console.log("error deleting profile", error);
    // show alert
    const deleteModalTitle = document.querySelector('#deleteAccount .signinheader');
    deleteModalTitle.innerHTML = "Oops... account not deleted..."
    const deleteModalText = document.querySelector('#deleteAccount .modal-body');
    deleteModalText.innerHTML = "<p>To delete your account you must be recently logged in.</p><p>Please log out and log back in, then try deleting your account again.</p>";
  });
}


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
//const allUserData = document.querySelector('.all-user-data');
const signedInName = document.querySelector('.welcome-name');


//===========EVENT LISTENERS===================
// add listeners if dom element present
window.addEventListener('DOMContentLoaded', function(){
  // load category buttons into the post job modal
  createCategoryButtons();
  //getTag();
  /*if(allUserData) {
    getAllUserData(getParam(), function(userData){
      displayAllUserData("user data:", userData);
    });
  }*/
});

//===========NON PAGE SPECIFIC EVENT LISTENERS AND PROCESSES===================
// submit job to db
const submitJob = document.querySelector('.submit-job-details');
submitJob.addEventListener('click', function (e) {
  e.preventDefault();
  console.log("submitting job");
  //createJobDoc(getTags());
  createJobDoc();
});

// login and validation
const loginForm = document.querySelector('.login');
const loginFormSubmit = document.querySelector('#login-submit');
loginFormSubmit.addEventListener('click', function (e) {
  e.preventDefault();
  let validated = validateLoginForm(loginForm); // from form-validation.js
  if (validated) {
    signInUser(e);
  }
});

// register and validation
const regForm2 = document.querySelector('.reg-form2');
const regForm2Submit = document.querySelector('#submit-reg2');
regForm2Submit.addEventListener('click', function (e) {
    console.log("reg modal 1 submit clicked");
    e.preventDefault();
    let validated = validateRegForm2(regForm2); // from form-validation.js 
    console.log(validated);
    // register
    if (validated) {
      signUpUser(e);
    }
  });


// reset password
//resetPassword("rod@roddickinson.net");
const forgotPassSubmit = document.querySelector('#submit-forgot1');
forgotPassSubmit.addEventListener('click', function (event) {
  let validated = validateEmail(); // from form-validation.js
  const forgotForm = document.querySelector('#forgot-pass-form');
  if (validated) {
    resetPassword(forgotForm.email.value); // from firebase-library.js
  }
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



// HOME / INDEX PAGE
if (page == "home") {
  console.log("home page");
  // populate page with profiles
  getRandomDocs(8).then(function(docs){
    createGradPreview(docs);
  });

  // contact form send messsage
  const getInTouchSubmit = document.querySelector('#contact #submit-home-message');
  const messageSentModal = new bootstrap.Modal(document.querySelector('#help-thank-you'));
  const getInTouchForm = document.querySelector('#contact  .send-home-form'); 
  getInTouchSubmit.addEventListener('click', function (event) {
    let validated = validateHomeContactForm(event, getInTouchForm);
    if (validated) {
      messageSentModal.show();
      // get form vals and create email message
      let formValues = getContactFormValues();
      // send email if help modal validated
      createSentEmailDoc(formValues.to, formValues.from, formValues.message).then(function(){
        console.log("email sent success");
        homepageMessageSent(); // when sent change message and graphic
        getInTouchForm.reset();  // reset form
      });
    }
  });

}


// PORTFOLIOS PAGE
if (page == "portfolios") {
  console.log("portfolios  page");
  // navigate to new url
  setCategoryParams();
  setTagParams();
  // set checkboxes onload
  setFiltersFromParams();
  // set filters onload
  let allParams = getAllParams();
  //console.log(allParams);

  // display cards based on params onload
  const cardsPerPage = 6;
  filterUsers(allParams).then(function(docs) {
    //console.log("filtered docs", docs);
    let docsBatch = getDocsBatch(cardsPerPage, getParamKey("page"), docs); 
    createGradPreview(docsBatch);
    setFolioNum(docs);
    createPagination(getParamKey("page"), cardsPerPage, docs.length);
    //ifNoResults(docs);
  });

  // if no params (filters set) get all get all cards
  let noParams = paramsExist();
  
  // if search param - load search results - paginated
  if (getParamKey("searchField")) {
    getAllUserData(undefined, function(allDocs){ 
      let searchInput = getParamKey("searchField");
      searchKeyword(allDocs, searchInput).then(function(resultsDocs){
        let docsBatch = getDocsBatch(cardsPerPage, getParamKey("page"), resultsDocs); 
        createGradPreview(docsBatch);
        setFolioNum(resultsDocs);
        createPagination(getParamKey("page"), cardsPerPage, resultsDocs.length);
        ifNoResults(resultsDocs);
      });
    });
  }
  // if no params (filters set) get all get all cards
  else if (noParams) {
    getAllUserData(undefined, function(allDocs){
      let docsBatch = getDocsBatch(cardsPerPage, getParamKey("page"), allDocs); 
      createGradPreview(docsBatch);
      setFolioNum(allDocs);
      createPagination(getParamKey("page"), cardsPerPage, allDocs.length);
    });
  }
  
  // if checkbox clicked filter results
  const allCheckboxes = document.querySelectorAll('#filters input');
  for (var i = 0; i < allCheckboxes.length; i++) {
    allCheckboxes[i].addEventListener("click", function() {
      console.log("clicked Checkbox");
      // set page param to 1
      setParam("page", 1);
      allParams = getAllParams();
      filterUsers(allParams).then(function(docs) {
        //console.log("filtered docs", docs);
        let docsBatch = getDocsBatch(cardsPerPage, getParamKey("page"), docs); 
        createGradPreview(docsBatch);
        setFolioNum(docs);
        createPagination(getParamKey("page"), cardsPerPage, docs.length);
        ifNoResults(docs);
      });
      // if no params (filters set) get all get all cards
      let noParams = paramsExist();
      if (noParams) {
        getAllUserData(undefined, function(allDocs){
          console.log("user data:", allDocs);
          let docsBatch = getDocsBatch(cardsPerPage, getParamKey("page"), allDocs); 
          createGradPreview(docsBatch);
          setFolioNum(allDocs);
          createPagination(getParamKey("page"), cardsPerPage, allDocs.length);
        });
      }
    });
  }

  // search keywords
  const searchBtn = document.querySelector('#search #search-keyword');
  searchBtn.addEventListener('click', function(e){
    e.preventDefault();
    uncheckAllFilters();
    getAllUserData(undefined, function(allDocs){
      let searchInput = getSearchTerm();
      searchKeyword(allDocs, searchInput).then(function(resultsDocs){
        console.log("resultsDocs", resultsDocs.length);
        let docsBatch = getDocsBatch(cardsPerPage, getParamKey("page"), resultsDocs); 
        createGradPreview(docsBatch);
        setFolioNum(resultsDocs);
        createPagination(getParamKey("page"), cardsPerPage, resultsDocs.length);
        ifNoResults(resultsDocs);
      });
    });
  })
}


// ACCOUNT SETTINGS PAGE
if (page == "account-seetings") {
  console.log("account-seetings  page");
  let section = document.querySelector("section");
  // show name on page load on add-profile page
  onAuthStateChanged(auth, function(user) {
    if (user) {
      // User logged in already or has just logged in.
      getCurrentUserDetails(user.uid).then(function(vals){
        // show page when logged in
        section.classList.remove("d-none");
        // populate profile pic in modal
        populateProfilePic(vals);
        // populate bio section and available for work
        populateBio(vals);
        // available or not
        populateAvailability(vals);
        // populate phone and email
        populateAcccountDetails(vals);
      });
    } 
  }) 

  // delete account and profile
  const deleteProfileBtn = document.querySelector('#deleteAccount #delete-profile');
  deleteProfileBtn.addEventListener('click', function(){
    //console.log('clicked delete-profile');
    deleteProfile(currentUserData.uid);
  });

  // save edited account details
  const saveDetailsBtn = document.querySelector('.edit-details-form #save-details');
  saveDetailsBtn.addEventListener('click', function(e){
    e.preventDefault();
    console.log('clicked save details');
    saveDetails(currentUserData.uid).then(function(){
      console.log('saved details');
    });
  });

}

// EDIT PROFILE PAGE edit-profile.html
if (page == "edit-profile") {
  console.log("edit-profile page");
  // first time edit show welcome modal
  let firstTime = getParamKey("intro"); //inital-sign-up
  introModal(firstTime);
  let section = document.querySelector("section");
  // show name on page load on add-profile page
  onAuthStateChanged(auth, function(user) {
    if (user) {
      // User logged in already or has just logged in.
      console.log("user "+user.uid+" logged in");
      getCurrentUserDetails(user.uid).then(function(vals){
        // show page when logged in
        section.style.display = "block";
        // populate personal details modal
        populatePersonalDetailsModal(vals);
        // pipoulate bio section and available for work
        populateBio(vals);
        // populate downloadable file
        populateDownloadFile(vals);
        // populate skills tags modal
        populateSkillsModal(vals);
        // populate skills 
        populateSkills(vals);
        // populate socials modal
        populateSocialsModal(vals);
        // populate socials section
        populateSocials(vals);
        // populate profile pic in modal
        populateProfilePic(vals);
        // populate profile pic in modal
        populateProfilePicModal(vals);
        // populate project showcase
        populateProjectShowcases(vals);
      });
    } 
  }) 

  let pageEdited = false;
  // listen for change to available for work switch
  const availability = document.querySelector(".edit-section #available-for-work");
  availability.addEventListener('change',function(){
    // update user doc with key val
    updateUserDoc(currentUserData.uid, "available", availability.checked);
  })

  // submit personal details modal, update edit page
  const submitPersonalDetails = document.querySelector("#edit-details #change-Details-Submit");
  submitPersonalDetails.addEventListener('click', function(){
    // get urls of image to upload 
    const base64img = getProfileImageUrl(); 
    // upload base64 image
    uploadBase64Image(base64img).then(function(url){
      console.log('complete', url);
      // add a reference in the user doc
      updateUserDocProfilePic(url).then(function(){
        getCurrentUserDetails(currentUserData.uid).then(function(vals){
          // populate bio section with new pic
          populateProfilePic(vals);
          pageEdited = true;
        });
      });
    });

    // update personal details bio
    updatePersonalDetails(currentUserData.uid).then(function(){
      getCurrentUserDetails(currentUserData.uid).then(function(vals){
        // populate bio section and available for work
        populateBio(vals);
        pageEdited = true;
      });
    });

    const PDFpath = getFilePath();
    uploadFile(PDFpath).then(function(){
      console.log('file upload complete');
      getCurrentUserDetails(currentUserData.uid).then(function(vals){
          // populate bio section with new pic
          populateDownloadFile(vals);
          pageEdited = true;
        });
    })

  });

  // remove uploaded files
  const removeFolioPDF = document.querySelector("#edit-details .remove-pdf-file");
  removeFolioPDF.addEventListener('click', function(){
    console.log("removeFolioPDF");
    deleteDocField("folioPdf").then(function(){
      console.log("folio removed");
      confirmDeletion();
    });
  });

  // submit / update skills tags, update edit page
  const submitSkillsTags = document.querySelector("#skills-categories #save-skills");
  submitSkillsTags.addEventListener('click', function(){
    updateSkillsTags(currentUserData.uid).then(function(){
      getCurrentUserDetails(currentUserData.uid).then(function(vals){
        // populate skills tags
        populateSkills(vals);
        pageEdited = true;
      });
    });
  });

  // submit / update socials links, update edit page
  const submitSocials = document.querySelector("#social-modal #Social-Media-Submit");
  submitSocials.addEventListener('click', function(){
    updateSocialsLinks(currentUserData.uid).then(function(){
      getCurrentUserDetails(currentUserData.uid).then(function(vals){
        // populate socials modal
        populateSocialsModal(vals);
        // populate socials section
        populateSocials(vals);
        pageEdited = true;
      });
    });
  });

  // add or edit a project showcase
  const submitProject = document.querySelector('#editProject #submit-edit-project');
  submitProject.addEventListener('click', function(e){
    e.preventDefault();
    let validated = validateEditProjectForm(e); // from edit-profile.html
    if (validated) {
      let uploadImgs = getUploadImgs();
      // upload images
      uploadBase64Images(uploadImgs).then(function(imageUrls){
        // add preloaded images
        let allImageUrls = imageUrls.concat(getPreloadedImgs());
        // update db with modal form details
        updateProjectShowcase(currentUserData.uid, allImageUrls).then(function(projectId, imageUrls){
          console.log("updated project showcase with projectId:", projectId);
          // next load data into page and back into modal when clicked
          getCurrentUserDetails(currentUserData.uid).then(function(vals){
            // populate project showcase
            populateProjectShowcases(vals);
            // empty modal
            emptyProjectModal(); // from edit-profile.js
          });
          pageEdited = true;
        });
      });
    }
  });

  // delete a project showcase
  const deleteProjectBtn = document.querySelector('#deleteShowcase #confirm-delete-showcase');
  deleteProjectBtn.addEventListener('click', function(e){
    e.preventDefault();
    console.log("delete project");
    getCurrentUserDetails(currentUserData.uid).then(function(vals){
      // populate socials modal
      deleteProjectShowcase(currentUserData.uid, vals).then(function(){
        console.log('deleted');
        // populate project showcase
        populateProjectShowcases(vals);
        pageEdited = true;
      })
      
    });
  });

  // show client view
  const clientViewBtn = document.querySelector('#client-view');
  clientViewBtn.addEventListener('click', function(){
    window.location.href = "profile.html?id="+ currentUserData.uid + "&preview=true";
  });

  // listen for a page focus change change and use this to send an email to admin
  document.addEventListener("visibilitychange", function(){
    if (document.visibilityState == "hidden" && pageEdited) {
      //console.log("edit page: ",document.visibilityState);
      let msg = "User " + currentUserData.forename + " " + currentUserData.surname + ", user ID: " + currentUserData.uid + " has updated their profile<br><br>Please view it here: https://studio-freelancer-agency.web.app/profile.html?id=" + currentUserData.uid;
      createSentEmailDoc("stiwdiofreelanceragency@gmail.com", "stiwdiofreelanceragency@gmail.com", msg);
    }
  });

}


// ADD PROFILE PAGE add-profile.html
/*if (page == "add-profile") {
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

}*/


// SHOW PROFILE
if (page == "single-profile") {
  console.log("profile page");
  // show profile passed as param
  const id = getParamKey("id");
  getUserData(id).then(function(vals){
      console.log(vals);
      // available or not
      populateAvailability(vals);
      // populate profile pic in modal
      populateProfilePic(vals);
      // populate bio section 
      populateBio(vals);
      // populate downloadable file
      populateDownloadFile(vals);
      // populate skills 
      populateSkills(vals);
      // populate socials section
      populateSocials(vals);
      // populate project showcase
      populateShowcasesNav(vals);
      populateShowcases(vals);
      // populate contact thank you mobile
      populateContactModals(vals);
  });

  // contact form send messsage
  const sendGradSubmit = document.querySelector('#submit-grad-message');
  const sentModal = new bootstrap.Modal(document.querySelector('#help-thank-you'));
  sendGradSubmit.addEventListener('click', function (event) {
    let validated = validateContactForm(event);
    if (validated) {
      sentModal.show();
      // get profile data 
      getUserData(id).then(function(vals){
          // get form vals and create email message
          let formValues = getContactMeFormValues(vals);
          // send email if help modal validated
          createSentEmailDoc(formValues.to, formValues.from, formValues.message).then(function(){
            // when sent change message and graphic
            console.log("email sent success");
            messageSentConfirmation(vals);
          });
      });
    }
  });
  
  // on login add edit my profile btn
  onAuthStateChanged(auth, function(user) {
    if (user) {
      // User logged in already or has just logged in.
      console.log("profile page logged in user is", user.uid);
      showEditBtn(user.uid, id);
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
    displayAllJobs(itemsPerPage, getParamKey("page"), jobData); 
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
      console.log("email sent success");
    }

  }, false)
}





console.log('hello from index.js tucked at the bottom');
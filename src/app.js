
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
    shortdescription: jobDetailsForm.shortdescription.value.replace(/\n\r?/g, '<br>'),
    longdescription: jobDetailsForm.longdescription.value.replace(/\n\r?/g, '<br>'),
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

// get query string tag
function getParam() {
  const urlParams = new URLSearchParams(location.search);
  for (const [key, value] of urlParams) {
      //console.log(`${key}:${value}`);
      return value; // only works with one param at the mo
  }
}

// ======SHOW JOB FUNCTIONS======
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
  a.href = 'login.html';
  a.innerHTML = 'Sign in';
  li.className = 'nav-item pe-3';
  li.appendChild(a);
  navbar.appendChild(li);
  li = document.createElement('li');
  a = document.createElement('a');
  a.className = 'btn btn-primary post-job';
  a.href = 'post-job.html';
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


//==========================================
//==========================================
//===========DOM ELEMENTS===================
import header from './header.html'
import footer from './footer.html'
import signinmodal from './signinmodal.html'
document.getElementById("header").innerHTML = header;
document.getElementById("footer").innerHTML = footer;
document.getElementById("footer").innerHTML = signinmodal;

// tag categories
const tags = ["Animation", "Visual-Effects", "Graphic-Design", "Games-Design-and-Production", "Video", "Audio-Production", "Journalism", "Photography", "Theatre-Dance"];

const page = document.body.getAttribute('data-page');
const userSection = document.querySelector('.user-data');
const addUserDataForm = document.querySelector('.add-user-data');
const allUserData = document.querySelector('.all-user-data');
const signedInName = document.querySelector('.welcome-name');


//===========EVENT LISTENERS===================


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
  
  // add edit my profile btn
  onAuthStateChanged(auth, function(user) {
    if (user) {
        // User logged in already or has just logged in.
        console.log("profile page logged in user is", user.uid);
        showEditBtn(user.uid, getParam());
      } 
  })
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
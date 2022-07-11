console.log("loading fb library");

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
      console.log("Signed in", cred.user.uid);
      loginForm.reset();
      // go to profile page
      window.location.href = "profile.html?id="+cred.user.uid;
    })
}

//*****************************************
// firebase general user functions
// 

// retrieve user data - single doc in the collection
async function getUserData(uid) {
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
function getCurrentUserEmail(){
  return auth.currentUser.email;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!auth.currentUser;
}


// Returns the signed-in user's uid. // does not work on page load // unreliable
function getUserUid() {
  // on login state change
  onAuthStateChanged(auth, function(user) {
    if (user) {
        // User logged in already or has just logged in.
        console.log(user.uid, "current use id");
      } 
  })
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
        user.id = snapshot.docs[i].id;
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




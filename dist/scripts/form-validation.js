// login validation
//const loginModal = new bootstrap.Modal(document.querySelector('#signInModal'));

function validateLoginForm(loginForm) {
  if (!loginForm.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
    console.log("modal 1 was-NOT-validated");
  }
  else {
    console.log("modal 1 was-validated");  
    //loginModal.hide();
    return true;
  }
  loginForm.classList.add('was-validated');
}


//step 1 registration validaiton
const regForm1 = document.querySelector('.reg-form1');
const regForm1Submit = document.querySelector('#submit-reg1');

const regModal1 = new bootstrap.Modal(document.querySelector('#register-modal1'));
const regModal2 = new bootstrap.Modal(document.querySelector('#register-modal2'));

// Loop over inputs and prevent submission
regForm1Submit.addEventListener('click', function (event) {
  console.log("modal reg 1 submit clicked");
  if (!regForm1.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
    console.log("modal reg 1 was-NOT-validated");
  }
  else {
    console.log("modal reg 1 was-validated");
    regModal1.hide();
    regModal2.show();
  }
  regForm1.classList.add('was-validated');
}, false)



//step 2 registration validation registration details

function validateRegForm2(regForm2) {
  if (document.querySelector("#passwordRegister").value == document.querySelector("#passwordConfirmation").value) {
    document.querySelector("#passwordConfirmation").setCustomValidity("");
  }
  else {
    document.querySelector("#passwordConfirmation").setCustomValidity("Duplicate passwords do not match");
  }
  // other validation
  if (regForm2.checkValidity() == false ) {
    event.preventDefault();
    event.stopPropagation();
    console.log("modal reg 2 was-NOT-validated");
  }
  else {
    console.log("modal reg 2 was-validated");
    return true;
  }
  regForm2.classList.add('was-validated');
}

// show hide password functions
function showPass(eye, id) {
    eye.classList.add("fa-eye-slash");
    eye.classList.remove("fa-eye");
    const p = document.getElementById(id);
    p.setAttribute('type', 'text');
}

function hidePass(eye, id) {
    eye.classList.add("fa-eye");
    eye.classList.remove("fa-eye-slash");
    const p = document.getElementById(id);
    p.setAttribute('type', 'password');
}

// show hide passsword
document.getElementById("eye-signin").addEventListener("click", function () {
    const eye = document.getElementById("eye-signin");
    if (eye.classList.contains("fa-eye")) {
      showPass(eye, "passwordSignin");
    } else {
      hidePass(eye, "passwordSignin");
    }
}, false);

// show hide passsword
document.getElementById("eye-register").addEventListener("click", function () {
    const eye = document.getElementById("eye-register");
    if (eye.classList.contains("fa-eye")) {
      showPass(eye, "passwordRegister");
    } else {
      hidePass(eye, "passwordRegister");
    }
}, false);

// show hide conform passsword
document.getElementById("eye-confirmation").addEventListener("click", function () {
    const eye = document.getElementById("eye-confirmation");
    if (eye.classList.contains("fa-eye")) {
      showPass(eye, "passwordConfirmation");
    } else {
      hidePass(eye, "passwordConfirmation");
    }
}, false);




//==POST JOB validation==
//STEP 1 validation
const jobForm0 = document.querySelector('.post-job-form0');

const submitJobModal1 = document.querySelector('#submit1'); 
const jobModalStep1 = new bootstrap.Modal(document.querySelector('#post-job-modal1'));
const jobModalStep2 = new bootstrap.Modal(document.querySelector('#post-job-modal2'));
// Loop over them and prevent submission
submitJobModal1.addEventListener('click', function (event) {
  console.log("modal 1 submit clicked");
  if (!jobForm0.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
    console.log("post job modal 1 was-NOT-validated");
  }
  else {
    console.log("post job modal 1 was-validated");
    jobModalStep1.hide();
    jobModalStep2.show();
  }
  jobForm0.classList.add('was-validated');
});


//post job STEP 2 validation
const jobForm1 = document.querySelector('.post-job-form1');
const submitJobModal2 = document.querySelector('#submit2'); // preview
const jobModalStep3 = new bootstrap.Modal(document.querySelector('#post-job-modal3'));
// Loop over them and prevent submission
submitJobModal2.addEventListener('click', function (event) {
  console.log("preview job clicked");
  if (!jobForm1.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
    console.log("post job modal 2 was-NOT-validated");
  }
  else {
    console.log("post job modal 2 was-validated");
    jobModalStep2.hide();
    jobModalStep3.show();
    // populate preview modal
    createJobPreview();
  }
  jobForm1.classList.add('was-validated');
});

// post job Help form - 
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
  }
  helpForm.classList.add('was-validated');
  return wasValidated;
}


// show job preview on preview modal
function createJobPreview() {
  console.log("job preview");
  // first modal
  const form0 = document.querySelector('.post-job-form0');
  //console.log(form0.firstname.value, form0.lastname.value, form0.email.value, form0.phone.value);
  // second modal
  const form1 = document.querySelector('.post-job-form1');
  const jobTitle = document.querySelector(".job-title-preview");
  jobTitle.innerHTML = form1.title.value;
  const company = document.querySelector(".company-name-preview");
  company.innerHTML = form1.company.value;
  const budgetHeader = document.querySelector(".budget-hourly-header");
  const budgetPreview = document.querySelector(".budget-hourly-preview");
  if(form1.budgetRadio.checked) {
    budgetHeader.innerHTML = "Budget";
    budgetPreview.innerHTML = "Set budget - £"+form1.budget.value;
  }
  else {
    budgetHeader.innerHTML = "Hourly Rate";
    budgetPreview.innerHTML = "£"+form1.rate.value + " p/h";
  }
  // job location
  const jobLocation = document.querySelector(".job-location-preview");
  if(form1.remoteRadio.checked) {
    jobLocation.innerHTML = "Remote";
  }
  else {
    jobLocation.innerHTML = form1.location.value;
  }
  // completion deadline / duration period
  let completionDate = new Date(form1.completionDate.value);
  const completionDeadline = document.querySelector(".completion-deadline-preview");
  if(form1.completionRadio.checked) {
    completionDeadline.innerHTML = "Completion deadline - " + completionDate.toLocaleString("en-GB", {day: "numeric", month: "numeric", year: "numeric"});
  }
  else {
    completionDeadline.innerHTML = form1.duration.value + " days";
  }

  // job brief
  const jobDesc = document.querySelector(".job-description-preview");
  jobDesc.innerHTML = form1.jobBrief.value.replace(/\n\r?/g, '<br>');

  // application deadline
  let applicationDate = new Date(form1.applicationDeadline.value);
  const applicationDeadline = document.querySelector(".application-deadline-preview");
  applicationDeadline.innerHTML = "Apply by - " + applicationDate.toLocaleString("en-GB", {day: "numeric", month: "numeric", year: "numeric"});

  // category tags
  const allCategoryTags = document.querySelectorAll(".filtertag.active");
  const tagsPreview = document.querySelector(".related-categories-preview");
  tagsPreview.innerHTML = ""; // remove previous tags
  for (var i = 0; i < allCategoryTags.length; i++) {
    // show preview tags
    let previewTag = "<span class=\"btn btn-primary filtertag\">"+allCategoryTags[i].innerHTML+"</span>"
    tagsPreview.innerHTML += previewTag;
  }
  console.log(allCategoryTags);
}

//==End POST JOB validation==


//forgot password validation
const forgotPassForm = document.querySelector('#forgot-pass-form');
//const forgotModal1 = new bootstrap.Modal(document.querySelector('#forgot-pass'));
//const forgotModal2 = new bootstrap.Modal(document.querySelector('#forgot-pass-success'));

// forgot password validation
function validateEmail() {
  if (!forgotPassForm.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
  }
  else {
    // validated
    console.log("email validated");
    return true;
    //forgotModal1.hide();
    //forgotModal2.show();
  }
  forgotPassForm.classList.add('was-validated');
}

//disable forms

  document.getElementById('Set-budget-radio').onchange = function() {
    document.getElementById('Set-budget-Text').disabled = !this.checked;
    document.getElementById('Set-hourly-text').disabled = this.checked;
    document.getElementById('Set-hourly-text').value = "";
    document.getElementById('duration-date').required =  this.checked;
    document.getElementById('Set-hourly-text').required =  !this.checked;
  }
    document.getElementById('Set-hourly-radio').onchange = function() {
    document.getElementById('Set-hourly-text').disabled = !this.checked;
    document.getElementById('Set-budget-Text').disabled = this.checked
    document.getElementById('Set-budget-Text').value = "";
    document.getElementById('duration-date').required =  !this.checked;
    document.getElementById('Set-hourly-text').required =  this.checked;
    }
    document.getElementById('remote-radio').onchange = function() {
    document.getElementById('job-location-text').disabled = this.checked
    
    document.getElementById('job-location-text').value = "";
    }
    document.getElementById('duration-radio').onchange = function() {
    document.getElementById('duration-date').disabled = !this.checked;
    document.getElementById('completion-date').disabled = this.checked
    document.getElementById('completion-date').value = "";
    document.getElementById('duration-date').required =  this.checked;
    document.getElementById('completion-date').required =  !this.checked;
    }
    document.getElementById('completion-radio').onchange = function() {
    document.getElementById('completion-date').disabled = !this.checked;
    document.getElementById('duration-date').disabled = this.checked
    document.getElementById('duration-date').value = "";
    document.getElementById('duration-date').required =  !this.checked;
    document.getElementById('completion-date').required =  this.checked;
 
    }
    
   
    window.onload = function(){

      var d = new Date();
    
      // Build ISO 8601 format date string
      var s = d.getFullYear() + '-' + 
              ('0' + (d.getMonth()+1)).slice(-2) + '-' +
              ('0' + d.getDate()).slice(-2);
    
      // Set the value of the value and min attributes
      var node = document.getElementById('completion-date');
      var node1 = document.getElementById('deadline-date');
      if (node) {
        node.setAttribute('min', s);
        node.setAttribute('value', s);
      }
      if (node1) {
        node1.setAttribute('min', s);
        node1.setAttribute('value', s);
      }
      
    }
  
    

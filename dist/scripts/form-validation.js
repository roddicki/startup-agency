// login validation
  /*const loginModal = new bootstrap.Modal(document.querySelector('#signInModal'));
  const loginForm = document.querySelector('.login');
  const loginFormSubmit = document.querySelector('#login-submit');

  loginFormSubmit.addEventListener('click', function (e) {
    validateLoginForm(e);
  }, false)*/

  const loginModal = new bootstrap.Modal(document.querySelector('#signInModal'));

  function validateLoginForm(loginForm) {
    if (!loginForm.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      console.log("modal 1 was-NOT-validated");
      return false;
    }
    else {
      console.log("modal 1 was-validated");  
      loginModal.hide();
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
    console.log("modal 1 submit clicked");
    if (!regForm1.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      console.log("modal 1 was-NOT-validated");
    }
    else {
      console.log("modal 1 was-validated");
      regModal1.hide();
      regModal2.show();
    }
    regForm1.classList.add('was-validated');
  }, false)



  //step 2 registration validation registration details
  const regForm2 = document.querySelector('.reg-form2');
  const regForm2Submit = document.querySelector('#submit-reg2');

  // Loop over inputs and prevent submission
  regForm2Submit.addEventListener('click', function (event) {
    console.log("modal 2 submit clicked");
    // check passwords match 
    if (document.querySelector("#password").value == document.querySelector("#passwordConfirmation").value) {
      document.querySelector("#passwordConfirmation").setCustomValidity("");
    }
    else {
      document.querySelector("#passwordConfirmation").setCustomValidity("Duplicate passwords do not match");
    }
    // other validation
    if (regForm2.checkValidity() == false ) {
      event.preventDefault();
      event.stopPropagation();
      console.log("modal 12was-NOT-validated");
    }
    else {
      console.log("modal 2 was-validated");
    }
    regForm2.classList.add('was-validated');
  }, false)

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
document.getElementById("eye").addEventListener("click", function () {
    const eye = document.getElementById("eye");
    if (eye.classList.contains("fa-eye")) {
      showPass(eye, "password");
    } else {
      hidePass(eye, "password");
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

//==POST JOB==
//step 1 validation

  // Fetch the forms we want to apply custom Bootstrap validation styles to
  const myForm = document.querySelector('.post-job-form0');

  const modal1 = document.querySelector('#submit1');
  // const forenameInput = document.querySelector('#validationCustom01');
  const modalStep1 = new bootstrap.Modal(document.querySelector('#step1'));
  const modalStep2 = new bootstrap.Modal(document.querySelector('#step2'));

  // Loop over them and prevent submission
  modal1.addEventListener('click', function (event) {
    console.log("modal 1 submit clicked");
    if (!myForm.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      console.log("modal 1 was-NOT-validated");
    }
    else {
      console.log("modal 1 was-validated");
      modalStep1.hide();
      modalStep2.show();
    }
    myForm.classList.add('was-validated');
  }, false)


  //step 2 validation
  
  // Fetch the forms we want to apply custom Bootstrap validation styles to
  const myForm1 = document.querySelector('.post-job-form1');

  const modal2 = document.querySelector('#submit2'); // preview
  const modalStep3 = new bootstrap.Modal(document.querySelector('#step3'));

  // Loop over them and prevent submission
  modal2.addEventListener('click', function (event) {
    console.log("preview job clicked");
    if (!myForm1.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      console.log("modal 2 was-NOT-validated");
    }
    else {
      console.log("modal 2 was-validated");
      modalStep2.hide();
      modalStep3.show();
      // populate preview modal
      createJobPreview();
    }
    myForm1.classList.add('was-validated');
  }, false)

  // Help form - 
 // NOTE:validation now in app.js to work with send email functions
//Help form - validation now in app.js to work with send email functions
  // Fetch the forms we want to apply custom Bootstrap validation styles to
  /* const helpForm = document.querySelector('.post-job-form2');

  const modalHelpButton = document.querySelector('#submit3');
  const modalHelp = new bootstrap.Modal(document.querySelector('#help'));

  // Loop over them and prevent submission
  modalHelpButton.addEventListener('click', function (event) {
    console.log("modal help submit clicked");
    if (!helpForm.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      console.log("modal help was-NOT-validated");
    }
    else {
      console.log("modal help was-validated");
      modalHelp.hide();
      // modalStep3.show();
      //createSentEmailDoc("rod@roddickinson.net", "me@myemail.com", "Here is a message");
    }
    helpForm.classList.add('was-validated');
  }, false) */


  // show job preview on preview modal
  function createJobPreview() {
    console.log("job preview");
    // first modal
    const form0 = document.querySelector('.post-job-form0');
    //console.log(form0.firstname.value, form0.lastname.value, form0.email.value, form0.phone.value);
    // second modal
    const form1 = document.querySelector('.post-job-form1');
    //console.log(form1.title.value, form1.company.value, form1.budgetRadio.checked, form1.budget.value, form1.hourlyRadio.checked, form1.rate.value, form1.applicationDeadline.value, form1.location.value, form1.remoteRadio.checked, form1.completionRadio.value,  form1.completionDate.value, form1.durationRadio.checked, form1.duration.value, form1.jobBrief.value);

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

    // tags
    let tags = []; // send to db
    const allTags = document.querySelectorAll(".filtertag.active");
    const tagsPreview = document.querySelector(".related-categories-preview");
    tagsPreview.innerHTML = ""; // remove previous tags
    for (var i = 0; i < allTags.length; i++) {
      // save tags
      tags.push(allTags[i].innerHTML);
      // show preview tags
      let previewTag = "<span class=\"btn btn-primary filtertag\">"+allTags[i].innerHTML+"</span>"
      //tagsPreview.appendChild(allTags[i]);
      tagsPreview.innerHTML += previewTag;
    }
    console.log(tags);
  }

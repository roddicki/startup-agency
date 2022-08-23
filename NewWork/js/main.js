class MyHeader extends HTMLElement {
    connectedCallback(){
        this.innerHTML = 
        `
            <div class="container"> 
            <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
            <a href="#" class="col-md-3" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="header-left" src="assets/img/646_220px.png" width="200" height="100%">
            </a>
            <a href="/" class="d-flex align-items-center mb-0 mb-md-0 me-md-2 text-dark text-decoration-none">
            
            </a>
        
            <ul class="nav nav-pills">
                <li class="nav-item"><a href="#" class="nav-link active" aria-current="page">Portfolios</a></li>
                <li class="nav-item"><a href="#" class="nav-link">Job Board</a></li>
                <li class="nav-item"><a href="#" class="nav-link">About Stiwdio</a></li>
                <li class="nav-item"><a href="#" class="nav-link">How it works</a></li>
                <li class="nav-item"><a href="#" class="nav-link">Contact</a></li>
            </ul>
            <div class="dropdown text-end">
                <a href="#" class="d-block link-dark text-decoration-none dropdown-toggle header-content" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="https://github.com/mdo.png" alt="mdo" width="32" height="32" class="rounded-circle">
                
                </a>
                <ul class="dropdown-menu text-small " aria-labelledby="dropdownUser1">
                <li><a class="dropdown-item" href="#">DashBaord</a></li>
                <li><a class="dropdown-item" href="#">Portfolio</a></li>
                <li><a class="dropdown-item" href="#">Edit Profile</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#">Sign out</a></li>
                </ul>
            </header>
        </div>
        `
    }
}

class MyFooter extends HTMLElement {
    connectedCallback(){
        this.innerHTML = 
        `
        <footer class="text-center text-lg-start text-muted">


        <!-- Section: Links  -->
        <section class="border-bottom">
          <div class="container text-center text-md-start mt-5">
            <!-- Grid row -->
            <div class="row mt-3">
              <!-- Grid column -->
              <div class="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                <!-- Content -->
                <h6 class="text-uppercase fw-bold mb-4">
                  <img class="header-left" src="assets/img/646_220px.png" width="200" height="100%">
                </h6>
                <p>
                 +44 29 2047 05353
                </p>
                <p>stiwdio@southwales.ac.uk</p>
              </div>
              <!-- Grid column -->
      
              
              <!-- Grid column -->
              <div class="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
                <!-- Links -->
                <h6 class="text-uppercase fw-bold mb-4">
                  NAVIGATION
                </h6>
                <p>
                  <a href="#!" class="text-reset">Portfolio</a>
                </p>
                <p>
                  <a href="#!" class="text-reset">Job Board</a>
                </p>
                <p>
                  <a href="#!" class="text-reset">About Stiwdio</a>
                </p>
                <p>
                  <a href="#!" class="text-reset">How it works</a>
                </p>
                <p>
                  <a href="#!" class="text-reset">Contact</a>
                </p>
              </div>
              <!-- Grid column -->
      
              <!-- Grid column -->
              <div class="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
                <!-- Links -->
                <h6 class="text-uppercase fw-bold mb-4">
                  QUICK LINKS
                </h6>
                <p>
                  <a href="#!" class="text-reset">Become a member</a>
                </p>
                <p>
                  <a href="#!" class="text-reset">Post job</a>
                </p>
              </div>
              <!-- Grid column -->
      
              <!-- Grid column -->
              <div class="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
                <!-- Links -->
                <h6 class="text-uppercase fw-bold mb-4">
                  OTHER
                </h6>
                <p>
                  <a href="#!" class="text-reset">Terms & Conditions</a>
                </p>
                <p>
                  <a href="#!" class="text-reset">Privacy Notice</a>
                </p>
                <p>
                  <a href="#!" class="text-reset">USW website</a>
                </p>
              </div>
              <!-- Grid column -->
      
              <!-- Grid column -->
              <div class="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
                <!-- Links -->
                <h6 class="text-uppercase fw-bold mb-4">FIND US HERE</h6>
                <p><i class="fas fa-home me-3"></i>University of South Wales</p>
                <p>
                  <i class="fas fa-envelope me-3"></i>
                  (ATRiuM Building)
                </p>
                <p><i class="fas fa-phone me-3"></i>86-88 Adam Street</p>
                <p><i class="fas fa-print me-3"></i>Cardiff</p>
                <p><i class="fas fa-print me-3"></i>CF24 2FN</p>
              </div>
              <!-- Grid column -->
            </div>
            <!-- Grid row -->
          </div>
        </section>
        <!-- Section: Links  -->
      
        <!-- Copyright -->
        <div class="container text-left p-4">Copyright ©  2021:
          <a class="text-reset fw-bold" href="">stiwdio agency</a>
        </div>
        <!-- Copyright -->
      </footer>
      <!-- Footer -->
        `
    }
}

customElements.define('my-header', MyHeader)
customElements.define('my-footer', MyFooter)

let items = document.querySelectorAll('.carousel .carousel-item')

items.forEach((el) => {
    const minPerSlide = 4
    let next = el.nextElementSibling
    for (var i=1; i<minPerSlide; i++) {
        if (!next) {
            // wrap carousel by using first child
        	next = items[0]
      	}
        let cloneChild = next.cloneNode(true)
        el.appendChild(cloneChild.children[0])
        next = next.nextElementSibling
    }
})
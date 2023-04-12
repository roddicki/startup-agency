// set active nav link

export function setActiveNav() {
	// get url
	const url = window.location.href
	// get all links
	const navLinks = document.querySelectorAll('.nav-link');
	for (var i = 0; i < navLinks.length; i++) {
		// current url contains data-page set active
		if (url.includes(navLinks[i].dataset.page)) {
			console.log("current page is", navLinks[i].dataset.page);
			// add active class
			navLinks[i].classList.add('active');
		}
	}
}


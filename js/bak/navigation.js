/* ======================================
NAVIGATION.JS
====================================== */

/**

* Header Element
  */
  const header = document.querySelector(".header");

/**

* Navigation Links
  */
  const navLinks = document.querySelectorAll(".nav-links a");

/**

* Sections
  */
  const sections = document.querySelectorAll("section");

/**

* Mobile Menu
  */
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-links");

/* ======================================
Header Blur On Scroll
====================================== */

/**

* Toggle header background
* when page is scrolled
  */
  function updateHeader() {
  if (window.scrollY > 100) {
  header.classList.add("scrolled");
  } else {
  header.classList.remove("scrolled");
  }
  }

window.addEventListener("scroll", updateHeader);

/* ======================================
Active Navigation
====================================== */

/**

* Highlight current section
  */
  function updateActiveSection() {

let current = "";

sections.forEach(section => {

```
const sectionTop =
  section.offsetTop - 150;

const sectionHeight =
  section.offsetHeight;

if (
  window.scrollY >= sectionTop &&
  window.scrollY <
  sectionTop + sectionHeight
) {
  current = section.id;
}
```

});

navLinks.forEach(link => {

```
link.classList.remove("active");

if (
  link.getAttribute("href") ===
  `#${current}`
) {
  link.classList.add("active");
}
```

});

}

window.addEventListener(
"scroll",
updateActiveSection
);

/* ======================================
Mobile Menu
====================================== */

/**

* Toggle mobile menu
  */
  function toggleMenu() {

menuToggle.classList.toggle(
"active"
);

navMenu.classList.toggle(
"active"
);

}

menuToggle?.addEventListener(
"click",
toggleMenu
);

/* ======================================
Close Menu On Click
====================================== */

navLinks.forEach(link => {

link.addEventListener(
"click",
() => {

```
  menuToggle?.classList.remove(
    "active"
  );

  navMenu?.classList.remove(
    "active"
  );

}
```

);

});

/* ======================================
Initial State
====================================== */

updateHeader();
updateActiveSection();

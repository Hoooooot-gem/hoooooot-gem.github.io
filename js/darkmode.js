/* ======================================
DARKMODE.JS
====================================== */

/**

* Theme Toggle Button
  */
  const themeToggle =
  document.querySelector(
  ".theme-toggle"
  );

/**

* Theme Storage Key
  */
  const THEME_KEY = "hoooooot-theme";

/* ======================================
Apply Theme
====================================== */

/**

* Apply theme to document
*
* @param {string} theme
  */
  function applyTheme(theme) {

document.documentElement.setAttribute(
"data-theme",
theme
);

updateThemeButton(theme);

}

/* ======================================
Update Button Text
====================================== */

/**

* Update theme button label
*
* @param {string} theme
  */
  function updateThemeButton(theme) {

if (!themeToggle) return;

themeToggle.textContent =
theme === "dark"
? "Light"
: "Dark";

}

/* ======================================
Save Theme
====================================== */

/**

* Save theme to LocalStorage
*
* @param {string} theme
  */
  function saveTheme(theme) {

localStorage.setItem(
THEME_KEY,
theme
);

}

/* ======================================
Load Theme
====================================== */

/**

* Load theme from LocalStorage
  */
  function loadTheme() {

const savedTheme =
localStorage.getItem(
THEME_KEY
);

if (savedTheme) {
applyTheme(savedTheme);
return;
}

applyTheme("light");

}

/* ======================================
Toggle Theme
====================================== */

/**

* Switch between
* light and dark mode
  */
  function toggleTheme() {

const currentTheme =
document.documentElement.getAttribute(
"data-theme"
);

const newTheme =
currentTheme === "dark"
? "light"
: "dark";

applyTheme(newTheme);
saveTheme(newTheme);

}

/* ======================================
Event
====================================== */

themeToggle?.addEventListener(
"click",
toggleTheme
);

/* ======================================
Init
====================================== */

loadTheme();

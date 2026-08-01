/* ======================================
OBSERVER.JS
====================================== */

/**

* Reveal Elements
  */
  const revealElements =
  document.querySelectorAll(".reveal");

/**

* Intersection Observer
  */
  const observer =
  new IntersectionObserver(

  entries => {

  entries.forEach(entry => {

  ```
   if (
     entry.isIntersecting
   ) {

     entry.target.classList.add(
       "visible"
     );

     observer.unobserve(
       entry.target
     );

   }
  ```

  });

  },

  {
  threshold: 0.15
  }

);

/**

* Observe All Elements
  */
  revealElements.forEach(element => {
  observer.observe(element);
  });

/**
 * PULSE - Unified Seamless Navigation & Page Transitions Engine
 * Intercepts internal links, coordinates animations, and preserves user state.
 */
window.PULSE = window.PULSE || {};

(function () {
  const storage = window.PULSE.storage;

  document.addEventListener('DOMContentLoaded', () => {
    const contentWrapper = document.querySelector('.content-wrapper');
    const loadingScreen = document.getElementById('loading-screen');

    // 1. Smooth Page Entry Transition (if not showing full initial loading screen)
    if (contentWrapper) {
      if (!loadingScreen) {
        // Trigger page-enter transition smoothly
        setTimeout(() => {
          contentWrapper.classList.add('loaded');
        }, 50);
      }
    }

    // 2. Intercept local anchor link clicks for smooth fade-out page exits
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip internal hashes, external URLs, non-html endpoints, or special protocols
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        href.startsWith('javascript:')
      ) {
        return;
      }

      // Intercept local html route navigation
      e.preventDefault();

      if (contentWrapper) {
        contentWrapper.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        contentWrapper.style.transform = 'scale(0.98)';
        contentWrapper.classList.remove('loaded');
      }

      setTimeout(() => {
        window.location.href = href;
      }, 350);
    });

    // 3. Keep navbar links in sync and highlight active route
    highlightActiveNavbarLink();
  });

  function highlightActiveNavbarLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      const cleanHref = href.replace(/^\.\//, '');
      
      if (cleanHref === 'index.html' || cleanHref === '/' || cleanHref === '') {
        if (currentPath === '/' || currentPath.endsWith('index.html') || currentPath.endsWith('/')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      } else {
        if (currentPath.endsWith(cleanHref)) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }
})();

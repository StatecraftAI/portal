(function() {
  'use strict';
  
  // Email validation regex (more comprehensive)
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Rate limiting
  let lastSubmissionTime = 0;
  const RATE_LIMIT_MS = 5000; // 5 seconds between submissions
  
  // DOM elements
  const form = document.querySelector('.signup-form');
  const emailInput = document.getElementById('email');
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;
  const thankYouMessage = document.getElementById('thank-you');
  
  // Create error message element
  const errorMessage = document.createElement('p');
  errorMessage.className = 'error-message';
  errorMessage.setAttribute('role', 'alert');
  errorMessage.setAttribute('aria-live', 'polite');
  
  // Create spinner element
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  spinner.setAttribute('aria-label', 'Loading');
  
  if (form && emailInput && submitButton && thankYouMessage) {
    // Insert error message and spinner after the form
    form.parentNode.insertBefore(errorMessage, form.nextSibling);
    form.parentNode.insertBefore(spinner, errorMessage.nextSibling);
    
    // Enhanced email validation
    function validateEmail(email) {
      if (!email || email.trim().length === 0) {
        return 'Email address is required.';
      }
      
      if (email.length > 254) {
        return 'Email address is too long.';
      }
      
      if (!EMAIL_REGEX.test(email)) {
        return 'Please enter a valid email address.';
      }
      
      return null;
    }
    
    // Sanitize input to prevent XSS
    function sanitizeInput(input) {
      return input.trim().replace(/[<>]/g, '');
    }
    
    // Show error message
    function showError(message) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
      thankYouMessage.style.display = 'none';
      spinner.style.display = 'none';
    }
    
    // Show success message
    function showSuccess() {
      thankYouMessage.style.display = 'block';
      errorMessage.style.display = 'none';
      spinner.style.display = 'none';
      
      // Auto-hide success message after 5 seconds
      setTimeout(function() {
        thankYouMessage.style.display = 'none';
      }, 5000);
    }
    
    // Show loading state
    function showLoading() {
      spinner.style.display = 'block';
      submitButton.disabled = true;
      submitButton.textContent = 'Please wait...';
      errorMessage.style.display = 'none';
      thankYouMessage.style.display = 'none';
    }
    
    // Hide loading state
    function hideLoading() {
      spinner.style.display = 'none';
      submitButton.disabled = false;
      submitButton.textContent = 'Notify Me';
    }
    
    // Rate limiting check
    function isRateLimited() {
      const now = Date.now();
      if (now - lastSubmissionTime < RATE_LIMIT_MS) {
        return true;
      }
      lastSubmissionTime = now;
      return false;
    }
    
    // Real-time email validation
    emailInput.addEventListener('input', function() {
      const email = sanitizeInput(emailInput.value);
      const validationError = validateEmail(email);
      
      if (validationError && email.length > 0) {
        emailInput.setAttribute('aria-invalid', 'true');
        emailInput.setAttribute('aria-describedby', 'email-error');
      } else {
        emailInput.setAttribute('aria-invalid', 'false');
        emailInput.removeAttribute('aria-describedby');
      }
    });
    
    // Form submission handler
    function handleSubmit(event) {
      // Rate limiting
      if (isRateLimited()) {
        event.preventDefault();
        showError('Please wait a moment before submitting again.');
        return false;
      }
      
      const email = sanitizeInput(emailInput.value);
      const validationError = validateEmail(email);
      
      if (validationError) {
        event.preventDefault();
        showError(validationError);
        emailInput.focus();
        return false;
      }
      
      // Show loading state
      showLoading();
      
      // Store in localStorage for analytics (optional)
      try {
        const submissions = JSON.parse(localStorage.getItem('email_submissions') || '[]');
        submissions.push({
          email: email,
          timestamp: new Date().toISOString()
        });
        // Keep only last 10 submissions
        localStorage.setItem('email_submissions', JSON.stringify(submissions.slice(-10)));
      } catch (storageError) {
        console.warn('Could not save to localStorage:', storageError);
      }
      
      // Let the form submit naturally to FormSubmit.co
      // The browser will handle the actual submission
      console.log('Email being submitted to FormSubmit:', email);
      
      // Note: hideLoading() will be called when the page redirects or reloads
      return true;
    }
    
    // Attach event listeners
    form.addEventListener('submit', handleSubmit);
    
    // Keyboard accessibility
    emailInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmit(event);
      }
    });
    
    // Focus management
    emailInput.addEventListener('focus', function() {
      errorMessage.style.display = 'none';
    });
    
  } else {
    console.error('Required form elements not found');
  }
  
  // Check for success parameter in URL (from FormSubmit redirect)
  function checkForSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      showSuccess();
      // Clean up the URL
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }
  
  // Initialize success check
  checkForSuccess();
  
  // Global error handler
  window.addEventListener('error', function(event) {
    console.error('JavaScript error:', event.error);
  });
  
  // Expose notify function for backward compatibility
  window.notify = function() {
    if (form) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    }
  };
})(); 
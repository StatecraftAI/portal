(function() {
  'use strict';
  
  // Security hardening measures
  
  // 1. Disable right-click context menu (optional - can be controversial)
  // Uncomment if needed for additional protection
  /*
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
  */
  
  // 2. Disable text selection on sensitive elements (optional)
  // This is already handled in CSS with user-select: none if needed
  
  // 3. Disable drag and drop to prevent potential security issues
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });
  
  document.addEventListener('drop', function(e) {
    e.preventDefault();
  });
  
  // 4. Console warning for developers
  if (typeof console !== 'undefined' && console.log) {
    console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cThis is a browser feature intended for developers. If someone told you to copy-paste something here, it is a scam and will give them access to your information.', 'color: red; font-size: 16px;');
  }
  
  // 5. Basic bot detection
  let mouseMovements = 0;
  let keystrokes = 0;
  
  document.addEventListener('mousemove', function() {
    mouseMovements++;
  });
  
  document.addEventListener('keydown', function() {
    keystrokes++;
  });
  
  // 6. Detect if running in iframe (clickjacking protection)
  if (window.top !== window.self) {
    console.warn('Page loaded in iframe - potential clickjacking attempt');
    // Optionally redirect or show warning
    // window.top.location = window.self.location;
  }
  
  // 7. Feature detection and graceful degradation
  function checkBrowserSupport() {
    const features = {
      canvas: !!document.createElement('canvas').getContext,
      localStorage: typeof Storage !== 'undefined',
      addEventListener: !!document.addEventListener,
      querySelector: !!document.querySelector
    };
    
    const unsupportedFeatures = Object.keys(features).filter(key => !features[key]);
    
    if (unsupportedFeatures.length > 0) {
      console.warn('Unsupported browser features:', unsupportedFeatures);
      // Could show a browser upgrade message here
    }
    
    return unsupportedFeatures.length === 0;
  }
  
  // 8. Initialize security measures
  function initSecurity() {
    checkBrowserSupport();
    
    // Add security-related meta tags if not present
    if (!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')) {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'X-Content-Type-Options');
      meta.setAttribute('content', 'nosniff');
      document.head.appendChild(meta);
    }
  }
  
  // 9. Rate limiting for form submissions (additional layer)
  window.SecurityUtils = {
    rateLimiter: {
      attempts: {},
      isLimited: function(key, maxAttempts, timeWindow) {
        const now = Date.now();
        const attempts = this.attempts[key] || [];
        
        // Clean old attempts
        const validAttempts = attempts.filter(time => now - time < timeWindow);
        this.attempts[key] = validAttempts;
        
        if (validAttempts.length >= maxAttempts) {
          return true;
        }
        
        this.attempts[key].push(now);
        return false;
      }
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSecurity);
  } else {
    initSecurity();
  }
  
})(); 
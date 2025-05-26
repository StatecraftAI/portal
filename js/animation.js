(function() {
  'use strict';
  
  const canvas = document.getElementById("bg-animation");
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }
  
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error('Canvas context not available');
    return;
  }
  
  let w, h, nodes = [];
  let animationId;
  let isVisible = true;
  
  // Performance optimization: reduce animation when tab is not visible
  document.addEventListener('visibilitychange', function() {
    isVisible = !document.hidden;
  });

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  
  // Debounced resize handler for better performance
  let resizeTimeout;
  window.addEventListener("resize", function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      resize();
      createNodes();
    }, 100);
  });
  
  resize();

  function Node(x, y, vx, vy, hue) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.r = 2.7 + Math.random() * 2.3;
    this.baseR = this.r;
    this.hue = hue;
    this.pulse = 0;
  }
  
  function createNodes() {
    nodes = [];
    // Adaptive node count based on screen size and device capabilities
    const devicePixelRatio = window.devicePixelRatio || 1;
    const baseNodeCount = Math.floor((w * h) / 20000) + 36;
    const N = Math.min(baseNodeCount / devicePixelRatio, 150); // Cap for performance
    
    for (let i = 0; i < N; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = (Math.random() * Math.min(w, h)) / 1.5;
      const x = w / 2 + Math.cos(angle) * radius;
      const y = h / 2 + Math.sin(angle) * radius;
      const vx = (Math.random() - 0.5) * 0.16;
      const vy = (Math.random() - 0.5) * 0.26;
      const hue = 200 + Math.random() * 10;
      nodes.push(new Node(x, y, vx, vy, hue));
    }
  }
  
  createNodes();

  function draw() {
    try {
      // Create gradient background
      const grad = ctx.createRadialGradient(
        w / 2, h / 2, w * 0.1,
        w / 2, h / 2, w * 0.7
      );
      grad.addColorStop(0, "#16242a66");
      grad.addColorStop(1, "#0e0e0e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Update node pulses
      nodes.forEach(function(node) {
        if (node.pulse > 0) {
          node.r = node.baseR + Math.sin(node.pulse / 8) * 2.5;
          node.pulse--;
        } else if (Math.random() < 0.0007) {
          node.pulse = 50 + Math.floor(Math.random() * 50);
        } else {
          node.r = node.baseR;
        }
      });

      // Draw connections between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 130) {
            ctx.save();
            ctx.globalAlpha = 0.25 * (1 - dist / 130);
            ctx.strokeStyle = `hsl(${(a.hue + b.hue) / 2},80%,65%)`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineWidth = 1 + (0.6 * Math.max(a.r, b.r)) / 6;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Draw nodes
      nodes.forEach(function(node) {
        ctx.save();
        ctx.globalAlpha = 0.33 + (node.pulse > 0 ? 0.13 : 0);
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${node.hue},100%,26%)`;
        ctx.shadowColor = `hsl(${node.hue},90%,78%)`;
        ctx.shadowBlur = 6 + node.r * 2;
        ctx.fill();
        ctx.restore();
      });
    } catch (error) {
      console.error('Error in draw function:', error);
    }
  }

  function animate() {
    // Only animate if page is visible for performance
    if (isVisible) {
      // Update node positions
      nodes.forEach(function(node) {
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off edges
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;
      });
      
      draw();
    }
    
    animationId = requestAnimationFrame(animate);
  }
  
  // Start animation
  animate();
  
  // Cleanup function for potential memory leaks
  window.addEventListener('beforeunload', function() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });
})(); 
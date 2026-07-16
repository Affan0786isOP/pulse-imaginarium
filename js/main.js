/**
 * PULSE - Precision User Latency & Stimulus Evaluator
 * Master Script - Production Engine
 * Developer: Affan Ahmad Khan (Class XI, DWPS Noida Extension)
 */

// Local aliases to the global PULSE subsystem
(function () {
  const storage = window.PULSE.storage;
  const startVisualTest = (container, onComplete) => window.PULSE.startVisualTest(container, onComplete);
  const startColorTest = (container, onComplete) => window.PULSE.startColorTest(container, onComplete);
  const startDirectionTest = (container, onComplete) => window.PULSE.startDirectionTest(container, onComplete);
  const startMemoryTest = (container, onComplete) => window.PULSE.startMemoryTest(container, onComplete);
  const renderLeaderboard = (assessmentId) => window.PULSE.renderLeaderboard(assessmentId);
  const clearScores = () => window.PULSE.clearScores();

  document.addEventListener('DOMContentLoaded', () => {
  // --- Initialize All Core Subsystems ---
  initLoadingScreen();
  initNavbarScroll();
  initNeuralCanvas();
  initScienceInteractive();
  initAssessmentFlow();
});

// ==========================================
// 1. Navigation Scroll Effect
// ==========================================
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('header, section');

  if (!navbar) return;

  window.addEventListener('scroll', () => {
    // Scroll background effect
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll active link highlight
    let currentId = '';
    const scrollPos = window.scrollY + 120; // offset for nav height

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id') || '';
      }
    });

    if (currentId) {
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentId)) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });

  // Smooth scroll listener override for active class
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

// ==========================================
// 2. High-Performance Neural Canvas Background
// ==========================================
function initNeuralCanvas() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'neural-net';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const maxParticles = Math.min(80, Math.floor((width * height) / 18000));
  const maxDistance = 140;
  const mouse = { x: null, y: null, radius: 180 };

  // Track Mouse Move
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Debounced Resize Observer for Fluid Scaling
  let resizeTimeout;
  const resizeObserver = new ResizeObserver((entries) => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, 150);
  });
  resizeObserver.observe(document.body);

  // Particle Class
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce on screen margins
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse grav-pull interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= dx * force * 0.02;
          this.y -= dy * force * 0.02;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.fill();
    }
  }

  // Populate particles
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }

  // Connect particles with lines representing synapses
  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          // Fade intensity as distance increases
          const alpha = (1 - dist / maxDistance) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          
          // Gradient between cyan and purple
          ctx.strokeStyle = `rgba(157, 78, 221, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw lines to mouse pointer
      if (mouse.x !== null && mouse.y !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const alpha = (1 - dist / mouse.radius) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    connectParticles();
    requestAnimationFrame(animate);
  }

  animate();
}

// ==========================================
// 3. Interactive Science Sandbox Subsystem
// ==========================================
function initScienceInteractive() {
  // --- Sandbox Tabs controller ---
  const tabButtons = document.querySelectorAll('.science-tab-btn');
  const tabContents = document.querySelectorAll('.science-tab-content');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');

      tabButtons.forEach((b) => b.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(`tab-${tabTarget}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // --- Sub-Simulator 1: Nerve Myelination Speed conduction ---
  let isMyelinated = false;
  const toggleMyelinBtn = document.getElementById('toggle-myelin-btn');
  const speedLabel = document.getElementById('myelin-speed');
  const modeLabel = document.getElementById('myelin-mode-label');
  const conductionDesc = document.getElementById('myelin-desc');
  const sheaths = document.querySelectorAll('.myelin-sheath');
  const triggerMyelinBtn = document.getElementById('trigger-myelin-sim');
  const signalDot = document.getElementById('myelin-signal-dot');
  const nodesOfRanvier = document.querySelectorAll('.node-of-ranvier');

  if (toggleMyelinBtn) {
    toggleMyelinBtn.addEventListener('click', () => {
      isMyelinated = !isMyelinated;

      if (isMyelinated) {
        toggleMyelinBtn.classList.add('active');
        toggleMyelinBtn.textContent = 'Myelination: ON';
        speedLabel.textContent = '120';
        modeLabel.textContent = 'Saltatory (Rapid Leaps)';
        conductionDesc.textContent = 'Myelin sheaths electrically insulate segments of the axon, forcing the electrical signal to vault instantly from node to node at extraordinary velocity.';
        sheaths.forEach((s) => s.classList.add('active'));
      } else {
        toggleMyelinBtn.classList.remove('active');
        toggleMyelinBtn.textContent = 'Myelination: OFF';
        speedLabel.textContent = '1.5';
        modeLabel.textContent = 'Continuous (Slow Crawl)';
        conductionDesc.textContent = 'Unmyelinated axon relies on contiguous channel activation down the entire cell membrane, which drastically increases conduction latency.';
        sheaths.forEach((s) => s.classList.remove('active'));
      }
    });
  }

  if (triggerMyelinBtn && signalDot) {
    let isAnimating = false;
    triggerMyelinBtn.addEventListener('click', () => {
      if (isAnimating) return;
      isAnimating = true;
      triggerMyelinBtn.disabled = true;
      triggerMyelinBtn.style.opacity = '0.5';

      // Reset
      signalDot.style.display = 'block';
      signalDot.style.left = '2rem';
      nodesOfRanvier.forEach(n => n.classList.remove('highlight'));

      const startTime = performance.now();
      const animationDuration = isMyelinated ? 400 : 3200; // fast leap vs slow crawl

      function step(timestamp) {
        const progress = Math.min((timestamp - startTime) / animationDuration, 1);
        
        if (isMyelinated) {
          // Saltatory (jumping) visual progression
          const jumpCount = sheaths.length + 1;
          const currentSegment = Math.floor(progress * jumpCount);
          const percentLeft = (progress * 100);
          signalDot.style.left = `calc(2rem + ${percentLeft}% - ${percentLeft * 0.04}rem)`;

          // Highlight respective Nodes of Ranvier sequentially
          nodesOfRanvier.forEach((node, idx) => {
            if (idx <= currentSegment && idx < nodesOfRanvier.length) {
              node.classList.add('highlight');
            }
          });
        } else {
          // Continuous smooth slow propagation visual
          const percentLeft = (progress * 100);
          signalDot.style.left = `calc(2rem + ${percentLeft}% - ${percentLeft * 0.04}rem)`;
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // Finish animation
          if (isMyelinated) {
            nodesOfRanvier.forEach(n => n.classList.add('highlight'));
          }
          setTimeout(() => {
            signalDot.style.display = 'none';
            triggerMyelinBtn.disabled = false;
            triggerMyelinBtn.style.opacity = '1';
            isAnimating = false;
          }, 400);
        }
      }

      requestAnimationFrame(step);
    });
  }

  // --- Sub-Simulator 2: Synaptic Delay Cleft Delay ---
  const triggerSynapticBtn = document.getElementById('trigger-synaptic-sim');
  const vesicles = document.querySelectorAll('.vesicle');
  const neurotransmitterDotsContainer = document.querySelector('.synapse-gap-area');
  const receptorGates = document.querySelectorAll('.receptor-gate');
  const delayValueOutput = document.getElementById('synaptic-delay-val');

  if (triggerSynapticBtn) {
    let isFiring = false;
    triggerSynapticBtn.addEventListener('click', () => {
      if (isFiring) return;
      isFiring = true;
      triggerSynapticBtn.disabled = true;
      triggerSynapticBtn.style.opacity = '0.5';

      // Reset Receptors and Outputs
      receptorGates.forEach(r => r.classList.remove('received'));
      delayValueOutput.textContent = 'Calculating...';

      // Phase 1: Vesicles Merge (0.4s)
      vesicles.forEach(v => v.classList.add('releasing'));

      setTimeout(() => {
        // Phase 2: Neurotransmitters fire across cleft (0.8s)
        const totalDots = 10;
        const firedDots = [];

        for (let i = 0; i < totalDots; i++) {
          const dot = document.createElement('div');
          dot.className = 'neurotransmitter-dot firing';
          // Scatter vertical coordinates randomly inside synaptic cleft
          dot.style.top = `${20 + Math.random() * 60}%`;
          // Stagger starting delays for natural mist look
          dot.style.animationDelay = `${Math.random() * 0.25}s`;
          neurotransmitterDotsContainer.appendChild(dot);
          firedDots.push(dot);
        }

        // Phase 3: Post-Synaptic Activation & Latency Evaluation (0.8s after launching dots)
        setTimeout(() => {
          // Sequentially light up post synaptic receptors
          receptorGates.forEach((gate, index) => {
            setTimeout(() => {
              gate.classList.add('received');
            }, index * 100);
          });

          // Compute a hyper-realistic synaptic transmission latency
          const realisticDelayMs = (0.5 + Math.random() * 0.95).toFixed(2);
          delayValueOutput.textContent = `${realisticDelayMs} ms`;

          // Clean up fired neurotransmitter elements from DOM
          setTimeout(() => {
            firedDots.forEach(dot => dot.remove());
            vesicles.forEach(v => v.classList.remove('releasing'));
            triggerSynapticBtn.disabled = false;
            triggerSynapticBtn.style.opacity = '1';
            isFiring = false;
          }, 800);

        }, 500);

      }, 400);
    });
  }
}

// ==========================================
// 4. Interactive Assessment & Profile Calibration Flow
// ==========================================
function initAssessmentFlow() {
  const regModal = document.getElementById('registration-modal');
  const regForm = document.getElementById('registration-form');
  const regNameInput = document.getElementById('reg-name');
  const regAgeInput = document.getElementById('reg-age');

  // Pre-fill inputs if profile is already calibrated
  const savedName = storage.getItem('pulse_user_name');
  const savedAge = storage.getItem('pulse_user_age');
  if (regNameInput && savedName) regNameInput.value = savedName;
  if (regAgeInput && savedAge) regAgeInput.value = savedAge;

  const workspace = document.getElementById('assessment-workspace');
  const workspaceContainer = document.getElementById('assessment-container');
  const workspaceTitle = document.getElementById('workspace-module-title');
  const workspaceUser = document.getElementById('workspace-user-display');
  const workspaceCloseBtn = document.getElementById('btn-workspace-back');

  let currentActiveTab = 'visual';

  // --- Profile Calibration (Registration) Subsystem ---
  function isCalibrated() {
    const name = storage.getItem('pulse_user_name');
    const age = storage.getItem('pulse_user_age');
    return (name && age);
  }

  function triggerCalibration() {
    if (regModal) {
      regModal.classList.add('active');
    }
  }

  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = regNameInput.value.trim();
      const age = parseInt(regAgeInput.value.trim(), 10);

      if (name && age) {
        storage.setItem('pulse_user_name', name);
        storage.setItem('pulse_user_age', age.toString());
        
        if (regModal) {
          regModal.classList.remove('active');
        }
        
        // If there was a pending assessment, navigate to it!
        const pending = storage.getItem('pulse_pending_assessment');
        if (pending) {
          storage.removeItem('pulse_pending_assessment');
          const contentWrapper = document.querySelector('.content-wrapper');
          if (contentWrapper) {
            contentWrapper.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
            contentWrapper.style.transform = 'scale(0.98)';
            contentWrapper.classList.remove('loaded');
          }
          setTimeout(() => {
            window.location.href = `${pending}.html`;
          }, 350);
        } else {
          // Refresh leaderboard to ensure proper names if table is updated
          renderLeaderboard(currentActiveTab);
        }
      }
    });
  }

  // --- Workspace Lifecycle ---
  function closeWorkspace() {
    if (workspace) {
      workspace.classList.remove('active');
    }
    if (workspaceContainer) {
      workspaceContainer.innerHTML = '';
    }
    // Refresh currently viewed leaderboard standing
    renderLeaderboard(currentActiveTab);
  }

  if (workspaceCloseBtn) {
    workspaceCloseBtn.addEventListener('click', closeWorkspace);
  }

  function openWorkspace(title, testLauncher, assessmentId) {
    if (!isCalibrated()) {
      storage.setItem('pulse_pending_assessment', assessmentId);
      triggerCalibration();
      return;
    }

    // Since we are multi-page, navigate directly to the dedicated assessment page
    const contentWrapper = document.querySelector('.content-wrapper');
    if (contentWrapper) {
      contentWrapper.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      contentWrapper.style.transform = 'scale(0.98)';
      contentWrapper.classList.remove('loaded');
    }
    setTimeout(() => {
      window.location.href = `${assessmentId}.html`;
    }, 350);
  }
  window.PULSE.openWorkspace = openWorkspace;

  // --- Wire Up Assessment Suite Cards ---
  const cards = [
    { id: 'lab-visual', title: 'Retinal Latency Evaluation', launch: startVisualTest },
    { id: 'lab-color', title: 'Cognitive Inhibition Evaluation', launch: startColorTest },
    { id: 'lab-direction', title: 'Spatial-Motor Calibration', launch: startDirectionTest },
    { id: 'lab-memory', title: 'Spatial Working Memory Grid', launch: startMemoryTest }
  ];

  cards.forEach(card => {
    const el = document.getElementById(card.id);
    if (el) {
      const assessmentId = card.id.replace('lab-', '');
      el.addEventListener('click', () => {
        openWorkspace(card.title, card.launch, assessmentId);
      });
    }
  });

  // --- Leaderboards Controller Subsystem ---
  // Setup tabs
  const lbTabs = document.querySelectorAll('.leaderboard-tab-btn');
  lbTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-leaderboard');
      if (target) {
        currentActiveTab = target;
        // Save to storage so it stays selected if they refresh or navigate
        storage.setItem('pulse_active_leaderboard', target);
        renderLeaderboard(target);
      }
    });
  });

  // Initial leaderboards render (restore saved active tab if it exists)
  const savedActiveTab = storage.getItem('pulse_active_leaderboard');
  if (savedActiveTab && ['visual', 'color', 'direction', 'memory'].includes(savedActiveTab)) {
    currentActiveTab = savedActiveTab;
  }
  renderLeaderboard(currentActiveTab);
}

// ==========================================
// 8. Scientific Operating System Loader
// ==========================================
function initLoadingScreen() {
  const loader = document.getElementById('loading-screen');
  const progressBar = document.getElementById('loader-progress-bar');
  const percentageText = document.getElementById('loader-percentage');
  const statusText = document.getElementById('loader-status-text');
  const contentWrapper = document.querySelector('.content-wrapper');

  if (!loader) return;

  // Track active loading state
  document.body.classList.add('loading-active');

  const messages = [
    { threshold: 0, text: "Initializing PULSE..." },
    { threshold: 15, text: "Loading Neural Interface..." },
    { threshold: 35, text: "Calibrating Visual Cortex..." },
    { threshold: 55, text: "Synchronizing Cognitive Modules..." },
    { threshold: 75, text: "Preparing Assessment Environment..." },
    { threshold: 90, text: "Optimizing Response Engine..." },
    { threshold: 100, text: "System Ready." }
  ];

  let currentMsgIndex = 0;
  let isMessageChanging = false;

  // Set initial text
  if (statusText) statusText.textContent = messages[0].text;

  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = prefersReducedMotion ? 1500 : 3500; // Faster boot if reduced motion is preferred
  const startTime = performance.now();

  function updateStatusMessage(progress) {
    if (isMessageChanging) return;

    // Find the message that corresponds to the current progress threshold
    let targetMsgIndex = 0;
    for (let i = 0; i < messages.length; i++) {
      if (progress >= messages[i].threshold) {
        targetMsgIndex = i;
      }
    }

    if (targetMsgIndex !== currentMsgIndex) {
      isMessageChanging = true;
      const nextText = messages[targetMsgIndex].text;

      if (statusText) {
        statusText.classList.add('fade-out');
        setTimeout(() => {
          statusText.textContent = nextText;
          statusText.classList.remove('fade-out');
          statusText.classList.add('fade-in');
          currentMsgIndex = targetMsgIndex;
          
          setTimeout(() => {
            statusText.classList.remove('fade-in');
            isMessageChanging = false;
          }, 150);
        }, 150);
      } else {
        currentMsgIndex = targetMsgIndex;
        isMessageChanging = false;
      }
    }
  }

  function animate(now) {
    const elapsed = now - startTime;
    let progress = Math.min(elapsed / duration, 1);

    // Easing for scientific, natural feel
    // Starts fast, slows down during cognitive calibration, then snaps to complete
    let easedProgress = progress;
    if (progress < 0.3) {
      easedProgress = progress * 1.1;
    } else if (progress < 0.8) {
      easedProgress = 0.33 + (progress - 0.3) * 0.75;
    } else {
      easedProgress = 0.7 + (progress - 0.8) * 1.5;
    }
    easedProgress = Math.min(Math.max(easedProgress, 0), 1);

    const percent = Math.floor(easedProgress * 100);

    if (progressBar) progressBar.style.width = `${percent}%`;
    if (percentageText) percentageText.textContent = `${String(percent).padStart(2, '0')}%`;

    updateStatusMessage(percent);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Snap progress bars to 100% just in case
      if (progressBar) progressBar.style.width = '100%';
      if (percentageText) percentageText.textContent = '100%';
      if (statusText && statusText.textContent !== "System Ready.") {
        statusText.textContent = "System Ready.";
      }

      // Pause for ~500ms when SYSTEM READY is reached
      setTimeout(() => {
        // Remove active loading from body to trigger ambient elements fade-in
        document.body.classList.remove('loading-active');

        // Cinematic dissolve transition of loader
        loader.classList.add('dissolve');

        // Trigger staggered homepage element entry
        if (contentWrapper) {
          contentWrapper.classList.add('loaded');
        }

        // Entirely destroy loader element after transition finishes to preserve memory
        setTimeout(() => {
          if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
          }
        }, 1200);
      }, 500);
    }
  }

  requestAnimationFrame(animate);
}

})();

// ==========================================



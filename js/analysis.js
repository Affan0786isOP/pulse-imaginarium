/**
 * PULSE - Performance Analysis & Scientific Reporting Engine (Redesigned)
 * Generates custom scientific cognitive reports upon assessment completion.
 */

window.PULSE = window.PULSE || {};

(function () {
  const STORAGE_KEY = 'pulse_assessment_records_v1';
  let currentRetryAssessmentId = 'visual';

  const ASSESSMENT_CONFIGS = {
    visual: {
      title: "Visual Latency Evaluation",
      measured: [
        {
          title: "Visual Stimulus Detection",
          desc: "Photoreceptor excitation inside the retina converts luminous photon triggers into electrical neurological impulses."
        },
        {
          title: "Neural Signal Transmission",
          desc: "Spinal cortic afferent pathways propagate action potentials along myelinated nerve axons to the primary visual cortex (V1)."
        },
        {
          title: "Brain Processing Speed",
          desc: "The occipital lobe decodes spatial inputs, prompting motor-planning networks in the frontal lobe to coordinate the physical response."
        },
        {
          title: "Motor Response Execution",
          desc: "Efferent signals activate skeletal muscle fibers, signaling peripheral fingers to execute clicking actions."
        },
        {
          title: "Hand-Eye Coordination",
          desc: "Integrates incoming spatial visual streams with targeted motor outputs to form a continuous neural feedback loop."
        }
      ],
      recommendations: [
        "Sleep 8–9 hours regularly to sustain cellular axon conduction speeds.",
        "Reduce screen fatigue to prevent retinal receptor adaptation and latency drift.",
        "Train hand-eye coordination to decrease cortical visual integration overhead.",
        "Practice reaction-based activities to reinforce myelinated spinal reflex paths."
      ],
      facts: [
        "The average human visual reaction speed is approximately 200–250 milliseconds.",
        "Professional esports players often achieve reaction speeds of 150–180ms through intensive synapse conditioning.",
        "Auditory reaction speeds are generally 30–40ms faster than visual speeds due to shorter primary neural routing pathways."
      ],
      getRating: (score, secondary) => {
        if (score < 200) {
          return {
            badge: "Superior",
            class: "superior",
            desc: "You demonstrated exceptionally fast visual processing and near-instant spinal reflex transmission. Elite-level cortical feedback detected."
          };
        } else if (score <= 280) {
          return {
            badge: "Steady Average",
            class: "average",
            desc: "Your visual reflexes fall within the optimal healthy human spectrum. Regular hydration and active breaks will help stabilize this baseline."
          };
        } else {
          return {
            badge: "Needs Conditioning",
            class: "needs-work",
            desc: "Reaction speeds can fluctuate due to fatigue, insufficient sleep, or prolonged screen exposure. Consistent recovery protocols are highly recommended."
          };
        }
      }
    },
    color: {
      title: "Cognitive Inhibition Evaluation",
      measured: [
        {
          title: "Selective Attention Filters",
          desc: "Isolates the targeted text color while actively suppressing automatic pre-reflective reading reflexes."
        },
        {
          title: "Cognitive Interference (Stroop Effect)",
          desc: "The brain processes semantic word values faster than physical color wavelengths, creating intense neural competition."
        },
        {
          title: "Processing Accuracy & Drift",
          desc: "Reflects the anterior cingulate cortex's (ACC) ability to detect mistakes and modulate executive focus."
        }
      ],
      recommendations: [
        "Stay hydrated to support optimal metabolic neurotransmitter balance and alleviate brain fog.",
        "Take regular study breaks to replenish prefrontal lobe glucose levels and attention reserves.",
        "Manage stress to prevent cortisol surges from degrading selective executive concentration.",
        "Reduce screen fatigue to stabilize visual pattern filters and reduce decision latency."
      ],
      facts: [
        "The Stroop Effect shows that naming a conflicting word color takes up to double the time of naming a simple neutral color block.",
        "Incongruent color processing triggers rapid activity in the anterior cingulate cortex to resolve cognitive conflict.",
        "Bilingual individuals typically perform much better on Stroop tests due to enhanced executive inhibitory controls."
      ],
      getRating: (score, secondary) => {
        if (score >= 90 && secondary < 700) {
          return {
            badge: "Excellent Performance",
            class: "superior",
            desc: "Outstanding selective attention and rapid inhibition capabilities. Your prefrontal cortex resolved conflicting Stroop stimuli with supreme accuracy and speed."
          };
        } else if (score >= 75) {
          return {
            badge: "Average Performance",
            class: "average",
            desc: "Your cognitive inhibition is fully functional and typical of a healthy, focused profile. Consistent practice will help lower decision latencies."
          };
        } else {
          return {
            badge: "Needs Improvement",
            class: "needs-work",
            desc: "Your accuracy or decision speed has been impacted. Executive attention thrives on regular sleep and scheduled pauses. High screen fatigue may be present."
          };
        }
      }
    },
    direction: {
      title: "Spatial-Motor Calibration",
      measured: [
        {
          title: "Rapid Spatial-Motor Mapping",
          desc: "The parietal lobe identifies directional symbols and translates them into spatial coordinates."
        },
        {
          title: "Motor Planning and Execution",
          desc: "The premotor and primary motor cortices prepare and execute coordinated muscle keystrokes."
        },
        {
          title: "Decision Speed & Confidence",
          desc: "Measures the time required to resolve spatial orientation under progressive decision load."
        }
      ],
      recommendations: [
        "Maintain good posture to optimize spinal cord motor conduction path alignments.",
        "Exercise consistently to improve cerebellar coordination and muscle recruitment loops.",
        "Train hand-eye coordination to sharpen spatial symbol translation speeds.",
        "Sleep 8–9 hours regularly to consolidate neural motor sequence pathways."
      ],
      facts: [
        "Motor planning and spatial execution rely heavily on the cerebellum, which manages voluntary muscle coordination.",
        "Spatial decisions require rapid, bi-directional communication between your parietal lobes and motor cortices.",
        "Mental fatigue slows motor planning speed significantly more than it slows pure spinal reflex actions."
      ],
      getRating: (score, secondary) => {
        if (score >= 90 && secondary < 500) {
          return {
            badge: "Excellent Performance",
            class: "superior",
            desc: "Elite motor-coordination and rapid spatial-to-motor translation. Your cerebellum demonstrated superior precision and motor planning efficiency."
          };
        } else if (score >= 75) {
          return {
            badge: "Average Performance",
            class: "average",
            desc: "Your spatial-motor system is well-aligned and operates at healthy levels. Fine-tuning muscle memories through consistent practice can boost response speed."
          };
        } else {
          return {
            badge: "Needs Improvement",
            class: "needs-work",
            desc: "Your coordinate accuracy or execution speed is currently variable. Regular physical stretching, exercise, and hydration can quickly restore cerebellum readiness."
          };
        }
      }
    },
    memory: {
      title: "Spatial Working Memory Grid",
      measured: [
        {
          title: "Prefrontal Working Memory Cache",
          desc: "A temporary neural blackboard holding geometric coordinates active inside the prefrontal cortex."
        },
        {
          title: "Visual-Spatial Pattern Recognition",
          desc: "The temporal lobe groups active squares into cohesive spatial shapes for streamlined retrieval."
        },
        {
          title: "Information Retention Limits",
          desc: "Tests the capacity limit of spatial short-term working memory buffers before overload."
        },
        {
          title: "Active Spatial Recall Loop",
          desc: "Retrieves stored pattern structures and maps them back to active clicking sequences."
        }
      ],
      recommendations: [
        "Eat a balanced diet high in choline to fuel acetylcholine pathways critical for memory consolidation.",
        "Sleep 8–9 hours regularly to permit the hippocampus to index and store working patterns.",
        "Take regular study breaks to avoid working memory clutter and cognitive interference.",
        "Stay hydrated to support temporal and prefrontal blood flow for sustained patterns."
      ],
      facts: [
        "The average human working memory capacity is limited to holding about 4 to 7 chunks of spatial data concurrently.",
        "Consistent spatial grid exercises have been shown to drive neuroplastic gray-matter density changes in the prefrontal cortex.",
        "Short-term working memory is fragile; a distraction of just 3 seconds can erase un-consolidated patterns entirely."
      ],
      getRating: (score, secondary) => {
        if (score >= 7) {
          return {
            badge: "Excellent Performance",
            class: "superior",
            desc: "Outstanding working memory capacity. You recalled high-density spatial grids with ease, demonstrating elite prefrontal synaptogenesis."
          };
        } else if (score >= 4) {
          return {
            badge: "Average Performance",
            class: "average",
            desc: "Solid spatial retention. Your working memory cache is robust and typical of a highly functioning neural profile. Breaks prevent retention interference."
          };
        } else {
          return {
            badge: "Needs Improvement",
            class: "needs-work",
            desc: "Working memory capacities naturally fluctuate. Stress, lack of sleep, or sudden distractions can clear short-term caches quickly. Regular training will boost limits."
          };
        }
      }
    }
  };

  function generateReportId() {
    const chars = '0123456789ABCDEF';
    let id = 'PR-';
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }

  function getLatestRecord(assessmentId) {
    try {
      const stored = window.PULSE.storage.getItem(STORAGE_KEY);
      if (stored) {
        const records = JSON.parse(stored);
        if (Array.isArray(records)) {
          // Find the newest record matching the assessment
          const filtered = records.filter(r => r.assessment === assessmentId);
          if (filtered.length > 0) {
            // Sort by timestamp descending
            filtered.sort((a, b) => b.timestamp - a.timestamp);
            return filtered[0];
          }
        }
      }
    } catch (e) {}
    return null;
  }

  function openPerformanceAnalysis(assessmentId) {
    currentRetryAssessmentId = assessmentId;
    const overlay = document.getElementById('performance-analysis');
    if (!overlay) return;

    // Fetch Subject Profile
    const uName = window.PULSE.storage.getItem('pulse_user_name') || 'UNKNOWN';
    const uAge = window.PULSE.storage.getItem('pulse_user_age') || '0';
    
    // Update IDs and badge displays
    const reportIdEl = document.getElementById('analysis-report-id');
    if (reportIdEl) {
      reportIdEl.textContent = `REPORT ID: ${generateReportId()}`;
    }

    const userDisplayEl = document.getElementById('analysis-user-display');
    if (userDisplayEl) {
      userDisplayEl.textContent = `SUBJECT: ${uName.toUpperCase()} | AGE: ${uAge}`;
    }

    const titleEl = document.getElementById('analysis-title');
    const config = ASSESSMENT_CONFIGS[assessmentId] || ASSESSMENT_CONFIGS.visual;
    
    if (titleEl) {
      titleEl.textContent = `Performance Analysis: ${config.title}`;
    }

    // Retrieve score data
    const record = getLatestRecord(assessmentId) || {
      score: 0,
      scoreFormatted: '--',
      secondary: 0
    };

    // Populate Results Summary Grid
    const resultsGrid = document.getElementById('results-summary-grid');
    if (resultsGrid) {
      resultsGrid.innerHTML = '';
      
      if (assessmentId === 'visual') {
        resultsGrid.innerHTML = `
          <div class="stat-glow-box cyan">
            <span class="stat-label-tech">Average Time</span>
            <div class="stat-val-huge">${record.scoreFormatted}</div>
            <span class="stat-desc-small">Average latency elapsed between luminous prompt and tactile activation.</span>
          </div>
          <div class="stat-glow-box purple">
            <span class="stat-label-tech">Consistency</span>
            <div class="stat-val-huge">±${Number(record.secondary).toFixed(1)} ms</div>
            <span class="stat-desc-small">Standard deviation across cycles. Lower indicates higher temporal stability.</span>
          </div>
          <div class="stat-glow-box blue">
            <span class="stat-label-tech">Accuracy</span>
            <div class="stat-val-huge">100%</div>
            <span class="stat-desc-small">Successful trigger matches completed within calibration guidelines.</span>
          </div>
        `;
      } else if (assessmentId === 'color') {
        resultsGrid.innerHTML = `
          <div class="stat-glow-box cyan">
            <span class="stat-label-tech">Accuracy</span>
            <div class="stat-val-huge">${record.scoreFormatted}</div>
            <span class="stat-desc-small">Ratio of correct semantic color resolutions under conflicting Stroop blocks.</span>
          </div>
          <div class="stat-glow-box purple">
            <span class="stat-label-tech">Average Time</span>
            <div class="stat-val-huge">${Number(record.secondary).toFixed(0)} ms</div>
            <span class="stat-desc-small">Mean speed to process executive choice and suppress verbal interference.</span>
          </div>
          <div class="stat-glow-box blue">
            <span class="stat-label-tech">Consistency</span>
            <div class="stat-val-huge">High</div>
            <span class="stat-desc-small">Steadiness of cognitive suppression mechanisms across the evaluation.</span>
          </div>
        `;
      } else if (assessmentId === 'direction') {
        resultsGrid.innerHTML = `
          <div class="stat-glow-box cyan">
            <span class="stat-label-tech">Accuracy</span>
            <div class="stat-val-huge">${record.scoreFormatted}</div>
            <span class="stat-desc-small">Ratio of matching directional orientation vectors mapped onto motor tracks.</span>
          </div>
          <div class="stat-glow-box purple">
            <span class="stat-label-tech">Average Time</span>
            <div class="stat-val-huge">${Number(record.secondary).toFixed(0)} ms</div>
            <span class="stat-desc-small">Average time to orient spatial coordinate vectors and plan key executions.</span>
          </div>
          <div class="stat-glow-box blue">
            <span class="stat-label-tech">Performance Rating</span>
            <div class="stat-val-huge">Optimal</div>
            <span class="stat-desc-small">Standard cerebellum-to-motor cortex signal consolidation efficiency.</span>
          </div>
        `;
      } else if (assessmentId === 'memory') {
        resultsGrid.innerHTML = `
          <div class="stat-glow-box cyan">
            <span class="stat-label-tech">Memory Level</span>
            <div class="stat-val-huge">${record.scoreFormatted}</div>
            <span class="stat-desc-small">Peak level achieved before visual-spatial working memory capacity threshold.</span>
          </div>
          <div class="stat-glow-box purple">
            <span class="stat-label-tech">Pattern Key Retentions</span>
            <div class="stat-val-huge">${record.secondary} Matches</div>
            <span class="stat-desc-small">Cumulative count of active grid cells correctly mapped and recalled.</span>
          </div>
          <div class="stat-glow-box blue">
            <span class="stat-label-tech">Consistency</span>
            <div class="stat-val-huge">${Number(record.score) >= 7 ? 'Superior' : 'Stable'}</div>
            <span class="stat-desc-small">Success consistency across progressive memory-grid expansions.</span>
          </div>
        `;
      }
    }

    // Populate Rating & Personal Feedback
    const ratingBoxContainer = document.getElementById('rating-box-container');
    if (ratingBoxContainer) {
      const rating = config.getRating(record.score, record.secondary);
      ratingBoxContainer.innerHTML = `
        <div class="rating-box">
          <div class="rating-badge ${rating.class}">${rating.badge}</div>
          <div style="flex: 1; font-size: 0.92rem; line-height: 1.5; color: var(--color-text-primary);">
            ${rating.desc}
          </div>
        </div>
      `;
    }

    // Populate What Was Measured?
    const measuredList = document.getElementById('measured-explanation-list');
    if (measuredList) {
      measuredList.innerHTML = '';
      config.measured.forEach((item, index) => {
        const trClass = (index % 2 === 1) ? 'purple-theme' : '';
        const itemHtml = `
          <div class="measured-item ${trClass}">
            <div class="measured-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </div>
            <div class="measured-content">
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
            </div>
          </div>
        `;
        measuredList.insertAdjacentHTML('beforeend', itemHtml);
      });
    }

    // Populate Recommendations
    const recsList = document.getElementById('recommendations-list');
    if (recsList) {
      recsList.innerHTML = '';
      config.recommendations.forEach(rec => {
        const itemHtml = `
          <div class="rec-card">
            <div class="rec-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="rec-title">${rec}</div>
          </div>
        `;
        recsList.insertAdjacentHTML('beforeend', itemHtml);
      });
    }

    // Populate Fun Facts
    const factsContainer = document.getElementById('fun-facts-container');
    if (factsContainer) {
      factsContainer.innerHTML = '';
      config.facts.forEach(fact => {
        const itemHtml = `
          <div class="trivia-box">
            <div class="trivia-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div class="trivia-text">${fact}</div>
          </div>
        `;
        factsContainer.insertAdjacentHTML('beforeend', itemHtml);
      });
    }

    // Open Overlay
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  window.PULSE.openPerformanceAnalysis = openPerformanceAnalysis;

  function closePerformanceAnalysis() {
    const overlay = document.getElementById('performance-analysis');
    if (overlay) {
      overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  // Set up button handlers on DOM Content Loaded
  document.addEventListener('DOMContentLoaded', () => {
    const btnBackHome = document.getElementById('btn-analysis-back-home');
    const btnViewLeaderboards = document.getElementById('btn-analysis-view-leaderboards');
    const btnRetry = document.getElementById('btn-analysis-retry');

    if (btnBackHome) {
      btnBackHome.addEventListener('click', (e) => {
        e.preventDefault();
        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
          contentWrapper.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
          contentWrapper.style.transform = 'scale(0.98)';
          contentWrapper.classList.remove('loaded');
        }
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 350);
      });
    }

    if (btnViewLeaderboards) {
      btnViewLeaderboards.addEventListener('click', (e) => {
        e.preventDefault();
        // Store current active analysis category so leaderboard can auto-display it
        window.PULSE.storage.setItem('pulse_active_leaderboard', currentRetryAssessmentId);
        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
          contentWrapper.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
          contentWrapper.style.transform = 'scale(0.98)';
          contentWrapper.classList.remove('loaded');
        }
        setTimeout(() => {
          window.location.href = 'leaderboard.html';
        }, 350);
      });
    }

    if (btnRetry) {
      btnRetry.addEventListener('click', (e) => {
        e.preventDefault();
        const targetUrl = `${currentRetryAssessmentId}.html`;
        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
          contentWrapper.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
          contentWrapper.style.transform = 'scale(0.98)';
          contentWrapper.classList.remove('loaded');
        }
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 350);
      });
    }

    // Auto-run report display if on the standalone performance analysis page
    const isStandalonePage = window.location.pathname.endsWith('analysis.html');
    if (isStandalonePage || document.getElementById('performance-analysis')) {
      const activeId = window.PULSE.storage.getItem('pulse_active_analysis') || 'visual';
      openPerformanceAnalysis(activeId);
    }
  });
})();

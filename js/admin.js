/**
 * PULSE - Administrator Control Panel Engine (Redesigned)
 * Central management console for leaderboards, user profiles, and factory settings.
 */

(function () {
  const storage = window.PULSE.storage;
  const STORAGE_KEY = 'pulse_assessment_records_v1';

  document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const loginForm = document.getElementById('admin-login-form');
    const passwordInput = document.getElementById('admin-password');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('btn-logout');

    // Stats Displays
    const statLeaderboardCount = document.getElementById('stat-leaderboard-count');
    const statUserStatus = document.getElementById('stat-user-status');
    const statStorageUsage = document.getElementById('stat-storage-usage');

    // Action Buttons
    const resetLeaderboardsBtn = document.getElementById('btn-reset-leaderboards');
    const clearUsersBtn = document.getElementById('btn-clear-users');
    const factoryResetBtn = document.getElementById('btn-factory-reset');

    // Alert Feedback Notification
    const actionSuccess = document.getElementById('action-success');
    const successText = document.getElementById('success-text');

    // Database Explorer elements
    const dbSearchInput = document.getElementById('db-search');
    const dbFilterSelect = document.getElementById('db-filter-assessment');
    const dbTbody = document.getElementById('db-examiner-tbody');

    // Live Terminal Log elements
    const loginTerminal = document.getElementById('login-terminal-logs');
    const dashTerminal = document.getElementById('dashboard-terminal-logs');

    // --- High-Tech Terminal Logging Helpers ---
    function logToTerminal(terminal, message, type = 'info') {
      if (!terminal) return;
      const typeMap = {
        'info': { class: 't-cyan', prefix: 'SYS_INFO' },
        'warn': { class: 't-purple', prefix: 'SYS_WARN' },
        'ok': { class: 't-green', prefix: 'SYS_OK' },
        'error': { class: 't-red', prefix: 'SYS_ERR' },
        'gray': { class: 't-gray', prefix: 'LOG_STRE' }
      };

      const meta = typeMap[type] || typeMap['info'];
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, fractionDigits: 2 });
      
      const line = document.createElement('div');
      line.className = 'term-line';
      line.innerHTML = `<span class="t-gray">[${timestamp}]</span> <span class="${meta.class}">[${meta.prefix}]</span> ${message}`;
      
      terminal.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
    }

    // Interactive custom authorization sequences
    function triggerBootSequence() {
      logToTerminal(loginTerminal, 'Initializing system handshake...', 'info');
      setTimeout(() => {
        logToTerminal(loginTerminal, 'Node link established over SSL tunnel.', 'ok');
      }, 400);
      setTimeout(() => {
        logToTerminal(loginTerminal, 'Querying localized cryptographic storage...', 'info');
        const count = getRecordCount();
        logToTerminal(loginTerminal, `Registry scan successful. Verified ${count} records.`, 'ok');
      }, 900);
    }

    // --- Custom Confirm Modal Controller ---
    function showCustomConfirm({ title, desc, warning, type = 'red', onConfirm }) {
      const modal = document.getElementById('pulse-custom-modal');
      const titleText = document.getElementById('modal-title-text');
      const descText = document.getElementById('modal-desc-text');
      const warningText = document.getElementById('modal-warning-text');
      const warningPanel = document.getElementById('modal-warning-panel');
      const confirmBtn = document.getElementById('modal-btn-confirm');
      const cancelBtn = document.getElementById('modal-btn-cancel');
      const iconWrap = document.getElementById('modal-header-icon-wrap');
      const modalGlow = document.getElementById('modal-theme-glow');

      titleText.textContent = title;
      descText.textContent = desc;

      if (warning) {
        warningText.textContent = warning;
        warningPanel.style.display = 'flex';
      } else {
        warningPanel.style.display = 'none';
      }

      // Configure color themes
      iconWrap.className = `modal-icon-area ${type}`;
      confirmBtn.className = `btn-modal btn-confirm ${type}`;

      if (type === 'red') {
        iconWrap.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
        warningPanel.className = 'modal-danger-prompt';
        modalGlow.style.background = 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%)';
      } else if (type === 'cyan') {
        iconWrap.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
        warningPanel.className = 'modal-danger-prompt cyan';
        modalGlow.style.background = 'radial-gradient(circle, rgba(0, 242, 254, 0.2) 0%, transparent 70%)';
      } else if (type === 'purple') {
        iconWrap.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        warningPanel.className = 'modal-danger-prompt purple';
        modalGlow.style.background = 'radial-gradient(circle, rgba(157, 78, 221, 0.2) 0%, transparent 70%)';
      }

      modal.classList.add('active');

      const onModalConfirm = () => {
        onConfirm();
        closeModal();
      };

      const closeModal = () => {
        modal.classList.remove('active');
        confirmBtn.removeEventListener('click', onModalConfirm);
        cancelBtn.removeEventListener('click', closeModal);
      };

      confirmBtn.addEventListener('click', onModalConfirm);
      cancelBtn.addEventListener('click', closeModal);
    }

    // --- Authentication Routing Subsystem ---
    function isAuthenticated() {
      return sessionStorage.getItem('pulse_admin_authenticated') === 'true';
    }

    function showDashboard() {
      loginScreen.classList.add('hidden-screen');
      dashboardScreen.classList.remove('hidden-screen');
      
      logToTerminal(dashTerminal, 'Session authorized. Booting HUD Overseer Panel.', 'ok');
      updateMetrics();
      hydrateDatabaseTable();
    }

    function showLogin() {
      dashboardScreen.classList.add('hidden-screen');
      loginScreen.classList.remove('hidden-screen');
      
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
      }
      if (loginError) {
        loginError.style.display = 'none';
      }

      // Start beautiful console boot stream simulation
      if (loginTerminal) {
        loginTerminal.innerHTML = '';
        triggerBootSequence();
      }
    }

    // Initial check
    if (isAuthenticated()) {
      showDashboard();
    } else {
      showLogin();
    }

    // Password Login handler
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPassword = passwordInput.value;

        logToTerminal(loginTerminal, `Validating security authorization payload...`, 'info');

        setTimeout(() => {
          if (enteredPassword === '180611') {
            logToTerminal(loginTerminal, `Credential sequence match. ACCESS GRANTED.`, 'ok');
            setTimeout(() => {
              sessionStorage.setItem('pulse_admin_authenticated', 'true');
              if (loginError) loginError.style.display = 'none';
              showDashboard();
            }, 600);
          } else {
            logToTerminal(loginTerminal, `INVALID PASSCODE ATTEMPT. Denied.`, 'error');
            if (loginError) {
              loginError.style.display = 'flex';
              passwordInput.value = '';
              passwordInput.focus();
            }
          }
        }, 550);
      });
    }

    // Logout Session handler
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('pulse_admin_authenticated');
        hideSuccessMessage();
        showLogin();
      });
    }

    // --- Helper for record counts ---
    function getRecordCount() {
      try {
        const stored = storage.getItem(STORAGE_KEY);
        if (stored) {
          const records = JSON.parse(stored);
          return Array.isArray(records) ? records.length : 0;
        }
      } catch (e) {}
      return 0;
    }

    // --- Metrics Updating Subsystem ---
    function updateMetrics() {
      const recordsCount = getRecordCount();
      if (statLeaderboardCount) {
        statLeaderboardCount.textContent = recordsCount.toString();
      }

      // Active Subject
      const uName = storage.getItem('pulse_user_name');
      const uAge = storage.getItem('pulse_user_age');
      if (statUserStatus) {
        if (uName && uAge) {
          statUserStatus.textContent = `${uName} (Age ${uAge})`;
          statUserStatus.style.color = 'var(--color-cyan)';
        } else {
          statUserStatus.textContent = 'Unregistered';
          statUserStatus.style.color = 'var(--color-text-muted)';
        }
      }

      // Storage estimate
      let totalBytes = 0;
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith('pulse_')) {
          const value = storage.getItem(key) || '';
          totalBytes += (key.length + value.length) * 2;
        }
      }

      if (statStorageUsage) {
        if (totalBytes === 0) {
          statStorageUsage.textContent = '0.00 KB';
        } else if (totalBytes < 1024) {
          statStorageUsage.textContent = `${totalBytes} B`;
        } else {
          statStorageUsage.textContent = `${(totalBytes / 1024).toFixed(2)} KB`;
        }
      }
    }

    // --- Database Explorer (Auditing & Deletion) ---
    function getAllRecords() {
      try {
        const stored = storage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed) ? parsed : [];
        }
      } catch (e) {}
      return [];
    }

    function formatAssessmentName(id) {
      const mapping = {
        'visual': 'Visual Reflex',
        'color': 'Stroop Color',
        'direction': 'Directional Shift',
        'memory': 'Matrix Memory'
      };
      return mapping[id] || id.toUpperCase();
    }

    function escapeHtml(str) {
      if (typeof str !== 'string') return '';
      return str.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
    }

    function hydrateDatabaseTable() {
      if (!dbTbody) return;

      const queryText = dbSearchInput ? dbSearchInput.value.toLowerCase().trim() : '';
      const filterAssessment = dbFilterSelect ? dbFilterSelect.value : 'all';

      const records = getAllRecords();
      
      // Filter records
      const filtered = records.filter(rec => {
        const matchesSearch = rec.name && rec.name.toLowerCase().includes(queryText);
        const matchesFilter = filterAssessment === 'all' || rec.assessment === filterAssessment;
        return matchesSearch && matchesFilter;
      });

      dbTbody.innerHTML = '';

      if (filtered.length === 0) {
        dbTbody.innerHTML = `<tr><td colspan="5" class="table-empty">No records match current query parameters.</td></tr>`;
        return;
      }

      // Render records
      filtered.forEach(rec => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
          <td style="font-weight: 600; color: #ffffff;">${escapeHtml(rec.name)}</td>
          <td style="font-family: var(--font-mono); font-size: 0.8rem;">${rec.age}</td>
          <td>
            <span class="tech-tag" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);">
              ${formatAssessmentName(rec.assessment)}
            </span>
          </td>
          <td class="align-right text-cyan" style="font-family: var(--font-mono); font-weight: bold;">${rec.scoreFormatted}</td>
          <td class="align-right" style="padding-right: 1rem;">
            <button class="btn-inline-delete" data-id="${rec.id}" title="Purge Record">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </td>
        `;

        dbTbody.appendChild(tr);
      });

      // Bind inline delete button listeners
      dbTbody.querySelectorAll('.btn-inline-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const recordId = btn.getAttribute('data-id');
          const recordsList = getAllRecords();
          const target = recordsList.find(r => r.id === recordId);

          if (!target) return;

          showCustomConfirm({
            title: 'Purge Specific Record?',
            desc: `Are you sure you want to permanently erase the score ledger entry for Subject "${target.name}"?`,
            warning: 'This specific score data point will be unlinked from leaderboard standings.',
            type: 'cyan',
            onConfirm: () => {
              const updated = recordsList.filter(r => r.id !== recordId);
              storage.setItem(STORAGE_KEY, JSON.stringify(updated));
              
              updateMetrics();
              hydrateDatabaseTable();
              
              logToTerminal(dashTerminal, `Score ledger item [id:${recordId}] deleted successfully.`, 'ok');
              triggerSuccessMessage('Ledger record erased successfully.');
            }
          });
        });
      });
    }

    // Bind Filter inputs
    if (dbSearchInput) {
      dbSearchInput.addEventListener('input', () => {
        hydrateDatabaseTable();
        logToTerminal(dashTerminal, `Filtering registry items on search pattern "${dbSearchInput.value}"`, 'gray');
      });
    }

    if (dbFilterSelect) {
      dbFilterSelect.addEventListener('change', () => {
        hydrateDatabaseTable();
        logToTerminal(dashTerminal, `Filtering registry items on assessment ID "${dbFilterSelect.value}"`, 'gray');
      });
    }

    // --- Feedback Notifications ---
    let feedbackTimeout = null;
    function triggerSuccessMessage(message) {
      if (actionSuccess && successText) {
        successText.textContent = message;
        actionSuccess.style.display = 'flex';
        
        if (feedbackTimeout) clearTimeout(feedbackTimeout);
        feedbackTimeout = setTimeout(() => {
          hideSuccessMessage();
        }, 4500);
      }
    }

    function hideSuccessMessage() {
      if (actionSuccess) {
        actionSuccess.style.display = 'none';
      }
    }

    // --- System Action Protocols ---

    // 1. Leaderboard Clear Protocol
    if (resetLeaderboardsBtn) {
      resetLeaderboardsBtn.addEventListener('click', () => {
        showCustomConfirm({
          title: 'WIPE LEADERS LEDGER?',
          desc: 'Are you absolutely sure you want to erase all historical standings, records, and dates?',
          warning: 'All scoreboard entries will be wiped. Subject registrations will remain intact.',
          type: 'cyan',
          onConfirm: () => {
            storage.removeItem(STORAGE_KEY);
            
            updateMetrics();
            hydrateDatabaseTable();
            
            logToTerminal(dashTerminal, 'Standing tables ledger wiped successfully.', 'ok');
            triggerSuccessMessage('Leaderboard standings successfully purged.');
          }
        });
      });
    }

    // 2. Profile Registrations Clear Protocol
    if (clearUsersBtn) {
      clearUsersBtn.addEventListener('click', () => {
        showCustomConfirm({
          title: 'DE-REGISTER PROFILES?',
          desc: 'Are you sure you want to clear active subject calibrations?',
          warning: 'Active subject name and age variables will be wiped. Previous scores are preserved.',
          type: 'purple',
          onConfirm: () => {
            storage.removeItem('pulse_user_name');
            storage.removeItem('pulse_user_age');
            
            updateMetrics();
            hydrateDatabaseTable();
            
            logToTerminal(dashTerminal, 'User profile records de-registered successfully.', 'ok');
            triggerSuccessMessage('Active registered subject profile cleared.');
          }
        });
      });
    }

    // 3. Complete Factory Reset Protocol
    if (factoryResetBtn) {
      factoryResetBtn.addEventListener('click', () => {
        showCustomConfirm({
          title: 'EXECUTE TERMINAL PURGE?',
          desc: 'This is a high-clearance override to factory reset the client node completely.',
          warning: 'This permanently wipes all local scoreboard records, subjects, logs, and cached statistics.',
          type: 'red',
          onConfirm: () => {
            const keysToDelete = [];
            for (let i = 0; i < storage.length; i++) {
              const key = storage.key(i);
              if (key && key.startsWith('pulse_')) {
                keysToDelete.push(key);
              }
            }

            keysToDelete.forEach(key => {
              storage.removeItem(key);
            });

            updateMetrics();
            hydrateDatabaseTable();
            
            logToTerminal(dashTerminal, 'Node cache wiped. Factory reset protocol complete.', 'ok');
            triggerSuccessMessage('Factory Reset Complete. All node caches cleared.');
          }
        });
      });
    }
  });
})();

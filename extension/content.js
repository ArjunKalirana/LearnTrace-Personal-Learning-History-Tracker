(function() {
  const DEBUG = true;
  function logDebug(msg) {
    if (DEBUG) console.log(`%c[LearnTrace Debug] ${msg}`, 'color: #3b82f6; font-weight: bold;');
  }

  // Always log at least once to verify injection
  logDebug(`Content script injected successfully into: ${window.location.hostname}`);

  async function checkAndFire(payload) {
    const { consentGiven, enabledPlatforms = [], trackingPaused } = await chrome.storage.local.get(['consentGiven', 'enabledPlatforms', 'trackingPaused']);
    
    if (!consentGiven) {
      logDebug('Tracking blocked: No user consent.');
      return;
    }
    if (trackingPaused) {
      logDebug('Tracking blocked: Tracking is currently paused.');
      return;
    }
    if (!enabledPlatforms.includes(payload.platform)) {
      logDebug(`Tracking blocked: ${payload.platform} is not enabled in settings.`);
      return;
    }

    const firedUrls = JSON.parse(sessionStorage.getItem('lt_fired_urls') || '[]');
    if (firedUrls.includes(window.location.href)) {
      logDebug('Tracking skipped: Already fired for this URL in this session.');
      return;
    }

    firedUrls.push(window.location.href);
    sessionStorage.setItem('lt_fired_urls', JSON.stringify(firedUrls));

    logDebug(`🚀 Firing detection for: ${payload.title} on ${payload.platform}`);
    chrome.runtime.sendMessage({
      type: 'LEARNING_DETECTED',
      payload: { ...payload, completionDate: new Date().toISOString(), autoTracked: true }
    });
  }

  function init() {
    logDebug(`Initializing LearnTrace for: ${window.location.hostname}`);
    
    // --- UDEMY ---
    if (window.location.href.includes('udemy.com')) {
      const observer = new MutationObserver(() => {
        try {
          const certBtn = document.querySelector('.certificate-button, [class*="certificate"]');
          if (certBtn) {
            const title = document.querySelector('.clp-lead__title, h1[data-purpose="lead-title"]')?.textContent;
            logDebug('Udemy Certificate Button Detected.');
            checkAndFire({ title: title?.trim(), platform: 'Udemy', domain: 'Online Learning' });
            observer.disconnect();
          }
        } catch (e) {}
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // --- COURSERA ---
    if (window.location.href.includes('coursera.org')) {
      if (window.location.pathname.includes('/certificate') || document.body.innerText.includes('Course Certificate')) {
          logDebug('Coursera Certificate Content Detected.');
          const title = document.querySelector('meta[property="og:title"]')?.content || document.title;
          checkAndFire({ title: title.split('|')[0].trim(), platform: 'Coursera', domain: 'Online Learning' });
      }
    }

    // --- YOUTUBE ---
    if (window.location.href.includes('youtube.com/watch')) {
      logDebug('YouTube Video Page Loaded. Monitoring playback...');
      const video = document.querySelector('video');
      if (video) {
        let thresholdReached = false;
        video.addEventListener('timeupdate', () => {
          if (!thresholdReached && video.currentTime > 180) { // 3 minutes
            thresholdReached = true;
            try {
              const ytTitle = document.querySelector('#container > h1 > yt-formatted-string')?.textContent || document.title.replace(' - YouTube', '');
              logDebug(`YouTube threshold reached for: ${ytTitle}`);
              checkAndFire({ 
                title: ytTitle?.trim(), 
                platform: 'YouTube', 
                domain: 'Video Learning', 
                hoursSpent: 0.5 
              });
            } catch (e) {
                logDebug(`YouTube capture error: ${e.message}`);
            }
          }
        });
      }
    }

    // --- GITHUB ---
    if (window.location.host === 'github.com') {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length === 2) {
          const title = document.querySelector('[itemprop="name"] a')?.textContent;
          const lang = document.querySelector('.Layout-sidebar .Progress-item')?.getAttribute('aria-label') || 'Code';
          logDebug(`GitHub Repository Detected: ${title}`);
          checkAndFire({ title: `${title?.trim()} (${lang})`, platform: 'GitHub', domain: 'Programming' });
      }
    }

    // --- MEDIUM ---
    if (window.location.host.includes('medium.com')) {
      window.addEventListener('scroll', () => {
          const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
          if (scrollPercent > 0.85) {
              try {
                  const title = document.querySelector('h1')?.textContent || document.title;
                  logDebug(`Medium Article Read Reached 85%: ${title}`);
                  checkAndFire({ title: title?.trim(), platform: 'Medium', domain: 'Reading' });
              } catch (e) {}
          }
      }, { passive: true });
    }
  }

  // Handle YouTube (SPA) navigation
  window.addEventListener('yt-navigate-finish', init);
  
  // Initial run
  init();

})();

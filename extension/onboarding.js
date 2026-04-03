document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const checks = document.querySelectorAll('.platform-check');

    function updateBtn() {
        const anyChecked = Array.from(checks).some(c => c.checked);
        startBtn.disabled = !anyChecked;
    }

    checks.forEach(c => c.addEventListener('change', updateBtn));

    startBtn.addEventListener('click', async () => {
        const enabledPlatforms = Array.from(checks)
            .filter(c => c.checked)
            .map(c => c.value);
        
        await chrome.storage.local.set({ 
            consentGiven: true, 
            enabledPlatforms: enabledPlatforms,
            trackingPaused: false 
        });

        window.close();
    });
});

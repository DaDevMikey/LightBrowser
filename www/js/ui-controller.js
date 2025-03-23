import { config } from './config.js';

// DOM elements cache
const elementCache = {};

// Get DOM element - caching for performance
export function getElement(id) {
    if (!elementCache[id]) {
        elementCache[id] = document.getElementById(id);
    }
    return elementCache[id];
}

// Dark mode control
export function toggleDarkMode(enable) {
    const darkModeToggle = getElement('dark-mode-toggle');
    
    if (enable !== undefined) {
        darkModeToggle.checked = enable;
    }
    
    if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('dark_mode', 'true');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('dark_mode', 'false');
    }
}

// Save panel visibility state
export function savePanelState(panel, isVisible) {
    panel.classList.toggle('hidden', !isVisible);
    panel.classList.toggle('visible', isVisible);
}

// Hide all panels
export function hideAllPanels() {
    const panels = document.querySelectorAll('.panel, #menu-panel');
    panels.forEach(panel => {
        panel.classList.remove('visible');
        panel.classList.add('hidden');
    });
}

// Show a specific panel
export function showPanel(panel) {
    hideAllPanels();
    panel.classList.remove('hidden');
    panel.classList.add('visible');
}

// Toggle panel visibility
export function togglePanel(panel) {
    if (panel.classList.contains('hidden')) {
        hideAllPanels();
        panel.classList.remove('hidden');
        panel.classList.add('visible');
    } else {
        panel.classList.remove('visible');
        panel.classList.add('hidden');
    }
}

// Show loading indicator
export function showLoadingIndicator() {
    getElement('loading-indicator').classList.add('active');
}

// Hide loading indicator
export function hideLoadingIndicator() {
    getElement('loading-indicator').classList.remove('active');
}

// Initialize UI settings
export function initUI() {
    // Initialize dark mode
    const darkModeSetting = localStorage.getItem('dark_mode');
    if (darkModeSetting === 'true') {
        toggleDarkMode(true);
    } else {
        getElement('dark-mode-toggle').checked = false;
    }
    
    // Initialize tabs container visibility
    const multiTabsEnabled = localStorage.getItem('multi_tab_mode') === 'true';
    getElement('multi-tab-toggle').checked = multiTabsEnabled;
    getElement('tabs-container').classList.toggle('hidden', !multiTabsEnabled);
    
    // Make sure panels are properly hidden on initialization
    hideAllPanels();
}

// Handle error display
export function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.bottom = '10px';
    errorDiv.style.left = '10px';
    errorDiv.style.right = '10px';
    errorDiv.style.padding = '10px';
    errorDiv.style.backgroundColor = '#f44336';
    errorDiv.style.color = 'white';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Update URL bar with current URL
export function updateUrlBar(url) {
    getElement('url-bar').value = url;
}

export function initEventDelegation() {
    // Event delegation for better performance on low-end devices
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        // Handle panel closing when clicking outside
        if (!target.closest('.panel') && 
            !target.closest('#menu-btn') && 
            getElement('menu-panel').classList.contains('visible')) {
            hideAllPanels();
        }
    });
}
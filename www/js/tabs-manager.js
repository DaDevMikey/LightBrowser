import { getElement, showLoadingIndicator, hideLoadingIndicator, updateUrlBar } from './ui-controller.js';
import { config } from './config.js';

// Tabs data
let tabs = [];
let activeTabId = null;
let nextTabId = 1;

// Initialize tabs
export function initTabs() {
    // Setup event handlers
    getElement('new-tab-btn').addEventListener('click', createNewTab);
    getElement('multi-tab-toggle').addEventListener('change', toggleMultiTabMode);
    
    // Initialize multi-tab mode if enabled
    const multiTabsEnabled = localStorage.getItem('multi_tab_mode') === 'true';
    if (multiTabsEnabled) {
        // Create first tab if none exists
        if (tabs.length === 0) {
            createNewTab();
        }
    }
}

// Create a new tab
export function createNewTab() {
    const multiTabsEnabled = getElement('multi-tab-toggle').checked;
    if (!multiTabsEnabled) return;
    
    // Check if max tabs reached
    if (tabs.length >= config.multiTab.maxTabs) {
        alert(`Maximum of ${config.multiTab.maxTabs} tabs allowed`);
        return;
    }
    
    const tabId = nextTabId++;
    const newTab = {
        id: tabId,
        title: 'New Tab',
        url: "about:blank",
        isHomepageActive: true
    };
    
    tabs.push(newTab);
    renderTabs();
    switchToTab(tabId);
}

// Switch to a specific tab
export function switchToTab(tabId) {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    
    activeTabId = tabId;
    renderTabs();
    
    // Update browser frame or homepage
    if (tab.isHomepageActive) {
        showHomepage();
    } else {
        loadURL(tab.url);
    }
}

// Close a tab
export function closeTab(tabId) {
    const index = tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;
    
    tabs.splice(index, 1);
    
    // If we closed the active tab, switch to another one
    if (activeTabId === tabId) {
        if (tabs.length > 0) {
            // Switch to the tab to the left, or the first one
            const newIndex = Math.max(0, index - 1);
            switchToTab(tabs[newIndex].id);
        } else {
            // No tabs left, create a new one
            createNewTab();
        }
    }
    
    renderTabs();
}

// Toggle multi-tab mode
export function toggleMultiTabMode() {
    const enabled = getElement('multi-tab-toggle').checked;
    localStorage.setItem('multi_tab_mode', enabled);
    
    getElement('tabs-container').classList.toggle('hidden', !enabled);
    
    if (enabled && tabs.length === 0) {
        createNewTab();
    }
}

// Render tabs in the UI
function renderTabs() {
    const tabsList = getElement('tabs-list');
    tabsList.innerHTML = '';
    
    tabs.forEach(tab => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab' + (tab.id === activeTabId ? ' active' : '');
        tabElement.dataset.tabId = tab.id;
        
        tabElement.innerHTML = `
            <div class="tab-title">${tab.title}</div>
            <div class="tab-close">×</div>
        `;
        
        tabElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-close')) {
                closeTab(tab.id);
            } else {
                switchToTab(tab.id);
            }
        });
        
        tabsList.appendChild(tabElement);
    });
}

// Update current tab state
export function updateCurrentTab(props) {
    if (!activeTabId) return;
    
    const tabIndex = tabs.findIndex(t => t.id === activeTabId);
    if (tabIndex === -1) return;
    
    tabs[tabIndex] = { ...tabs[tabIndex], ...props };
    renderTabs();
}

// Handle homepage showing
export function showHomepage() {
    getElement('browser-frame').classList.remove('active');
    getElement('homepage').classList.add('active');
    updateUrlBar('home');
    updateCurrentTab({ url: 'home', isHomepageActive: true, title: 'Home' });
}

// Load URL in current tab
export function loadURL(url) {
    // Check if it's a special URL
    if (url === 'home') {
        showHomepage();
        return;
    }
    
    showLoadingIndicator();
    
    getElement('homepage').classList.remove('active');
    const browserFrame = getElement('browser-frame');
    browserFrame.classList.add('active');
    
    try {
        // Handle proxy for sites that block iframes
        if (config.proxySettings.useProxy && url !== 'about:blank') {
            // Get the current active tab to check if we need to resolve a relative URL
            const activeTab = getActiveTab();
            
            // Handle relative URLs by resolving against current URL
            if ((url.startsWith('/') || !url.includes('://')) && activeTab && !activeTab.isHomepageActive) {
                try {
                    // Extract origin from current URL
                    const currentUrl = activeTab.url;
                    let origin = '';
                    let base = '';
                    
                    if (currentUrl.startsWith('http')) {
                        // Extract origin from full URL
                        const urlObj = new URL(currentUrl);
                        origin = urlObj.origin;
                        base = origin + urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1);
                    } else if (currentUrl.includes('allorigins.win')) {
                        // Extract original URL from proxy URL and get its origin
                        const encodedUrl = currentUrl.split('url=')[1];
                        if (encodedUrl) {
                            const decodedUrl = decodeURIComponent(encodedUrl);
                            const urlObj = new URL(decodedUrl);
                            origin = urlObj.origin;
                            base = origin + urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1);
                        }
                    }
                    
                    // Combine origin with relative path
                    if (url.startsWith('/')) {
                        url = origin + url;
                    } else if (!url.includes('://')) {
                        url = base + url;
                    }
                } catch (e) {
                    console.error('Error resolving relative URL:', e);
                }
            }
            
            browserFrame.src = config.proxySettings.proxyUrl + encodeURIComponent(url);
        } else {
            browserFrame.src = url;
        }
        
        updateUrlBar(url);
        updateCurrentTab({ 
            url, 
            isHomepageActive: false, 
            title: url.substring(0, 30) // Set a temporary title based on URL
        });
    } catch (error) {
        console.error('Error loading URL:', error);
        hideLoadingIndicator();
        alert('Failed to load URL: ' + error.message);
    }
}

// Get active tab info
export function getActiveTab() {
    return tabs.find(t => t.id === activeTabId);
}
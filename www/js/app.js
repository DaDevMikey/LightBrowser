import { config } from './config.js';
import { 
    getElement, 
    toggleDarkMode, 
    hideAllPanels, 
    showLoadingIndicator, 
    hideLoadingIndicator, 
    initUI,
    showError,
    initEventDelegation,
    showPanel
} from './ui-controller.js';
import {
    initTabs,
    createNewTab,
    showHomepage,
    loadURL,
    updateCurrentTab,
    getActiveTab
} from './tabs-manager.js';

const urlBar = getElement('url-bar');
const goBtn = getElement('go-btn');
const backBtn = getElement('back-btn');
const forwardBtn = getElement('forward-btn');
const refreshBtn = getElement('refresh-btn');
const homeBtn = getElement('home-btn');
const menuBtn = getElement('menu-btn');
const browserFrame = getElement('browser-frame');
const searchBox = getElement('search-box');
const searchBtn = getElement('search-btn');
const menuPanel = getElement('menu-panel');
const bookmarksPanel = getElement('bookmarks-panel');
const settingsPanel = getElement('settings-panel');
const aboutPanel = getElement('about-panel');

let bookmarks = [];
let history = [];
let browserHistory = []; 
let historyIndex = -1; 

function initBrowser() {
    loadBookmarks();
    populateQuickLinks();
    initUI();
    initTabs();
    setupEventListeners();
    initEventDelegation();
    
    // Load saved settings
    loadSavedSettings();
    
    // Show first-time warning
    const firstTime = localStorage.getItem('first_time_warning') !== 'shown';
    if (firstTime) {
        showFirstTimeWarning();
        localStorage.setItem('first_time_warning', 'shown');
    }
}

function loadBookmarks() {
    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) {
        bookmarks = JSON.parse(savedBookmarks);
    } else {
        bookmarks = config.defaultBookmarks;
        saveBookmarks();
    }
}

function saveBookmarks() {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

function populateQuickLinks() {
    const quickLinks = getElement('quick-links');
    quickLinks.innerHTML = '';
    bookmarks.forEach(bookmark => {
        const link = document.createElement('div');
        link.className = 'quick-link';
        link.innerHTML = `
            <div class="quick-link-icon">${bookmark.icon}</div>
            <div class="quick-link-title">${bookmark.title}</div>
        `;
        link.addEventListener('click', () => {
            loadURL(bookmark.url);
        });
        quickLinks.appendChild(link);
    });
}

function populateBookmarksList() {
    const bookmarksList = getElement('bookmarks-list');
    bookmarksList.innerHTML = '';
    bookmarks.forEach((bookmark, index) => {
        const item = document.createElement('div');
        item.className = 'bookmark-item';
        item.innerHTML = `
            <div class="bookmark-icon">${bookmark.icon}</div>
            <div class="bookmark-title">${bookmark.title}</div>
            <button class="bookmark-delete" data-index="${index}">
                <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M6,19c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2V7H6V19z M19,4h-3.5l-1-1h-5l-1,1H5v2h14V4z"/>
                </svg>
            </button>
        `;
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.bookmark-delete')) {
                loadURL(bookmark.url);
                hideAllPanels();
            }
        });
        bookmarksList.appendChild(item);
    });
    
    const deleteButtons = bookmarksList.querySelectorAll('.bookmark-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(button.getAttribute('data-index'));
            bookmarks.splice(index, 1);
            saveBookmarks();
            populateBookmarksList();
            populateQuickLinks();
        });
    });
}

function setupEventListeners() {
    urlBar.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            navigateToUrl();
        }
    });
    
    goBtn.addEventListener('click', navigateToUrl);
    
    backBtn.addEventListener('click', () => {
        if (browserHistory.length && historyIndex > 0) {
            historyIndex--;
            loadURL(browserHistory[historyIndex]);
        }
    });
    
    forwardBtn.addEventListener('click', () => {
        if (browserHistory.length && historyIndex < browserHistory.length - 1) {
            historyIndex++;
            loadURL(browserHistory[historyIndex]);
        }
    });
    
    refreshBtn.addEventListener('click', () => {
        const activeTab = getActiveTab();
        if (activeTab && activeTab.isHomepageActive) {
            showHomepage();
        } else if (activeTab) {
            const currentSrc = activeTab.url;
            browserFrame.src = 'about:blank';
            setTimeout(() => {
                loadURL(currentSrc);
            }, 50);
        }
    });
    
    homeBtn.addEventListener('click', () => {
        showHomepage();
    });
    
    searchBox.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchBox.value);
        }
    });
    
    searchBtn.addEventListener('click', () => {
        performSearch(searchBox.value);
    });
    
    menuBtn.addEventListener('click', () => {
        if (menuPanel.classList.contains('visible')) {
            hideAllPanels();
        } else {
            showPanel(menuPanel);
        }
    });
    
    getElement('bookmarks-btn').addEventListener('click', () => {
        populateBookmarksList();
        hideAllPanels();
        showPanel(bookmarksPanel);
    });
    
    getElement('settings-btn').addEventListener('click', () => {
        hideAllPanels();
        showPanel(settingsPanel);
    });
    
    getElement('about-btn').addEventListener('click', () => {
        hideAllPanels();
        showPanel(aboutPanel);
    });
    
    getElement('dark-mode-toggle').addEventListener('change', () => {
        toggleDarkMode();
    });
    
    getElement('js-enabled').addEventListener('change', (e) => {
        localStorage.setItem('js_enabled', e.target.checked);
    });
    
    getElement('images-enabled').addEventListener('change', (e) => {
        localStorage.setItem('images_enabled', e.target.checked);
    });
    
    getElement('text-size').addEventListener('change', (e) => {
        localStorage.setItem('text_size', e.target.value);
        applyTextSize(e.target.value);
    });
    
    getElement('search-engine').addEventListener('change', (e) => {
        localStorage.setItem('search_engine', e.target.value);
    });
    
    getElement('clear-cache').addEventListener('click', () => {
        if (confirm('Clear all browser cache?')) {
            localStorage.removeItem('browsing_history');
            history = [];
            alert('Cache cleared successfully');
        }
    });
    
    getElement('clear-history').addEventListener('click', () => {
        if (confirm('Clear all browsing history?')) {
            localStorage.removeItem('browsing_history');
            browserHistory = [];
            historyIndex = -1;
            history = [];
            alert('History cleared successfully');
        }
    });
    
    getElement('data-saver-btn').addEventListener('click', () => {
        const dataSaverEnabled = localStorage.getItem('data_saver') === 'true';
        localStorage.setItem('data_saver', (!dataSaverEnabled).toString());
        updateDataSaverStatus(!dataSaverEnabled);
    });
    
    getElement('clear-data-btn').addEventListener('click', () => {
        if (confirm('Clear all browsing data?')) {
            localStorage.clear();
            alert('All browsing data cleared. The app will now refresh.');
            location.reload();
        }
    });
    
    document.querySelectorAll('.close-panel').forEach(btn => {
        btn.addEventListener('click', () => {
            hideAllPanels();
        });
    });
    
    browserFrame.addEventListener('load', handleFrameLoad);
    
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    }, false);
}

function navigateToUrl() {
    const input = urlBar.value.trim();
    if (input) {
        loadURL(formatUrl(input));
    }
}

function formatUrl(url) {
    if (url === 'home') {
        return 'home';
    }
    
    if (!url.includes('.') || url.includes(' ')) {
        return getSearchUrl(url);
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    
    return url;
}

function getSearchUrl(query) {
    const searchEngine = getElement('search-engine').value;
    return config.searchEngines[searchEngine] + encodeURIComponent(query);
}

function performSearch(query) {
    if (query.trim()) {
        loadURL(getSearchUrl(query));
    }
}

function handleFrameLoad() {
    hideLoadingIndicator();
    updateNavigationButtons();
    
    const activeTab = getActiveTab();
    if (!activeTab) return;
    
    if (activeTab.url !== 'home' && activeTab.url !== 'about:blank') {
        if (historyIndex < browserHistory.length - 1) {
            browserHistory = browserHistory.slice(0, historyIndex + 1);
        }
        
        const currentUrl = activeTab.url;
        if (!browserHistory[historyIndex] || browserHistory[historyIndex] !== currentUrl) {
            browserHistory.push(currentUrl);
            historyIndex = browserHistory.length - 1;
            addToHistory(currentUrl);
        }
        
        try {
            if (browserFrame.contentDocument) {
                const title = browserFrame.contentDocument.title || currentUrl;
                updateCurrentTab({ title: title.substring(0, 20) || 'Untitled' });
            }
        } catch (e) {
            const urlParts = currentUrl.split('/');
            let domain = urlParts[2] || currentUrl;
            updateCurrentTab({ title: domain.substring(0, 20) || 'Untitled' });
        }
    }
}

function updateNavigationButtons() {
    const activeTab = getActiveTab();
    if (!activeTab) return;
    
    if (activeTab.isHomepageActive) {
        backBtn.disabled = true;
        forwardBtn.disabled = true;
    } else {
        backBtn.disabled = historyIndex <= 0;
        forwardBtn.disabled = historyIndex >= browserHistory.length - 1;
    }
}

function addToHistory(url) {
    if (url !== 'home' && url !== 'about:blank') {
        const timestamp = new Date().getTime();
        history.unshift({ url, timestamp });
        
        if (history.length > 100) {
            history = history.slice(0, 100);
        }
        
        localStorage.setItem('browsing_history', JSON.stringify(history));
    }
}

function loadSavedSettings() {
    // Load search engine preference
    const savedSearchEngine = localStorage.getItem('search_engine');
    if (savedSearchEngine) {
        getElement('search-engine').value = savedSearchEngine;
    }
    
    // Load JavaScript setting
    const jsEnabled = localStorage.getItem('js_enabled') !== 'false';
    getElement('js-enabled').checked = jsEnabled;
    
    // Load images setting
    const imagesEnabled = localStorage.getItem('images_enabled') !== 'false';
    getElement('images-enabled').checked = imagesEnabled;
    
    // Load text size
    const textSize = localStorage.getItem('text_size') || 'medium';
    getElement('text-size').value = textSize;
    applyTextSize(textSize);
    
    // Update data saver status
    const dataSaverEnabled = localStorage.getItem('data_saver') === 'true';
    updateDataSaverStatus(dataSaverEnabled);
}

function applyTextSize(size) {
    let fontSizePercent = '100%';
    if (size === 'small') fontSizePercent = '90%';
    if (size === 'large') fontSizePercent = '115%';
    document.documentElement.style.fontSize = fontSizePercent;
}

function updateDataSaverStatus(enabled) {
    getElement('data-saver-status').textContent = `Data Saver: ${enabled ? 'On' : 'Off'}`;
}

function showFirstTimeWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.style.position = 'fixed';
    warningDiv.style.top = '50%';
    warningDiv.style.left = '50%';
    warningDiv.style.transform = 'translate(-50%, -50%)';
    warningDiv.style.width = '85%';
    warningDiv.style.padding = '20px';
    warningDiv.style.backgroundColor = '#fff';
    warningDiv.style.color = '#333';
    warningDiv.style.borderRadius = '12px';
    warningDiv.style.zIndex = '10000';
    warningDiv.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    warningDiv.style.textAlign = 'center';
    
    warningDiv.innerHTML = `
        <h3 style="margin-bottom: 15px; color: #e74c3c;">⚠️ Warning</h3>
        <p style="margin-bottom: 15px; line-height: 1.4;">This browser is designed for basic browsing on low-end devices. Many modern websites are not supported and may not function correctly.</p>
        <button id="warning-ok" style="background: #4285f4; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold;">I Understand</button>
    `;
    
    document.body.appendChild(warningDiv);
    
    document.getElementById('warning-ok').addEventListener('click', () => {
        warningDiv.remove();
    });
}

document.addEventListener('DOMContentLoaded', initBrowser);

document.addEventListener('backbutton', (e) => {
    e.preventDefault();
    
    const anyPanelOpen = !menuPanel.classList.contains('hidden') || 
                         !bookmarksPanel.classList.contains('hidden') || 
                         !settingsPanel.classList.contains('hidden') || 
                         !aboutPanel.classList.contains('hidden');
    
    if (anyPanelOpen) {
        hideAllPanels();
    } else {
        const activeTab = getActiveTab();
        if (activeTab && !activeTab.isHomepageActive) {
            if (historyIndex > 0) {
                historyIndex--;
                loadURL(browserHistory[historyIndex]);
            } else {
                showHomepage();
            }
        } else {
            if (confirm('Exit LightBrowser?')) {
            }
        }
    }
}, false);
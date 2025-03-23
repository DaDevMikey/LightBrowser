// Configuration options for LightBrowser
export const config = {
    // Default homepage URL
    homepage: "about:blank",
    
    // Default search engine (google, duckduckgo, bing)
    defaultSearchEngine: "google",
    
    // Search engine URLs
    searchEngines: {
        google: "https://www.google.com/search?q=",
        duckduckgo: "https://duckduckgo.com/?q=",
        bing: "https://www.bing.com/search?q="
    },
    
    // Default bookmarks
    defaultBookmarks: [
        { title: "Google", url: "https://www.google.com", icon: "G" },
        { title: "YouTube", url: "https://m.youtube.com", icon: "Y" },
        { title: "Wikipedia", url: "https://en.m.wikipedia.org", icon: "W" },
        { title: "Facebook", url: "https://m.facebook.com", icon: "F" },
        { title: "Twitter", url: "https://mobile.twitter.com", icon: "T" },
        { title: "Amazon", url: "https://www.amazon.com", icon: "A" }
    ],
    
    // Data saver settings
    dataSaver: {
        enabled: false,
        disableImages: true,
        disableJS: false,
        compressionLevel: "high"
    },
    
    // Cache settings
    cache: {
        maxSize: 10 * 1024 * 1024, // 10 MB
        expiryTime: 24 * 60 * 60 * 1000 // 24 hours
    },
    
    // Performance settings for low-end devices
    performance: {
        useSimpleAnimations: true,
        limitTabCount: 3,
        aggressiveMemoryManagement: true
    },
    
    // URL handling settings
    urlHandling: {
        useProxyForBlockedSites: false,
        proxyUrl: "https://cors-anywhere.herokuapp.com/",
        forceHttps: true
    },
    
    // New settings
    darkMode: {
        enabled: false,
        autoSwitch: false,
        scheduleStart: "20:00",
        scheduleEnd: "06:00"
    },
    
    multiTab: {
        enabled: false,
        maxTabs: 5
    },
    
    // For handling websites that block iframes
    proxySettings: {
        useProxy: true,
        proxyUrl: "https://api.allorigins.win/raw?url="
    }
};
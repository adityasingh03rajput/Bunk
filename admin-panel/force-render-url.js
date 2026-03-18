// Force admin panel to use Render server
// This script clears localStorage and sets Render URL

console.log('🔧 Forcing admin panel to use Render server...');

// Clear any existing server URL
localStorage.removeItem('serverUrl');
console.log('🗑️ Cleared existing server URL from localStorage');

// Set Render URL
const RENDER_URL = 'https://letsbunk-uw7g.onrender.com';
localStorage.setItem('serverUrl', RENDER_URL);
console.log('✅ Set server URL to:', RENDER_URL);

// Verify
const currentUrl = localStorage.getItem('serverUrl');
console.log('🔍 Current server URL:', currentUrl);

console.log('🔄 Please refresh the page for changes to take effect.');

// Auto-reload after 2 seconds
setTimeout(() => {
    console.log('🔄 Auto-reloading page...');
    location.reload();
}, 2000);
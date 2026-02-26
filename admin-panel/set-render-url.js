// Quick script to set Render URL in admin panel localStorage
// Run this in the browser console when admin panel is open

const RENDER_URL = 'http://192.168.55.31:3000';

console.log('🔧 Setting server URL to:', RENDER_URL);
localStorage.setItem('serverUrl', RENDER_URL);
console.log('✅ Server URL saved!');
console.log('🔄 Please refresh the page for changes to take effect.');

// Optionally reload the page
if (confirm('Server URL updated! Reload page now?')) {
    location.reload();
}

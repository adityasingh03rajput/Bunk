const fs = require('fs');
const xml = fs.readFileSync('d:/bunk bssid/screen.xml', 'utf8');

// Extract all nodes with text
const matches = [...xml.matchAll(/text="([^"]+)"[^>]*bounds="(\[[0-9,\]\[]+)"/g)];

// Show all text elements to understand the full screen
console.log('=== ALL TEXT ELEMENTS ===');
matches.forEach(m => {
  console.log('text: ' + JSON.stringify(m[1]) + ' | bounds: ' + m[2]);
});

// Find the '8' specifically
console.log('\n=== ELEMENT WITH TEXT "8" ===');
const eights = matches.filter(m => m[1] === '8');
eights.forEach(m => console.log('text: ' + JSON.stringify(m[1]) + ' | bounds: ' + m[2]));

// Find the small '1' badge on the 8 cell
console.log('\n=== ELEMENT WITH TEXT "1" ===');
const ones = matches.filter(m => m[1] === '1');
ones.forEach(m => console.log('text: ' + JSON.stringify(m[1]) + ' | bounds: ' + m[2]));

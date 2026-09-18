const fs = require('fs');
const path = require('path');
const dir = './src/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace Hex Codes with Tokens
  content = content.replace(/#102A3A/gi, 'var(--color-text-heading)');
  content = content.replace(/#9EADB5/gi, 'var(--color-text-muted)');
  content = content.replace(/#C9D2D7/gi, 'var(--color-text-on-dark-secondary)');
  content = content.replace(/#FAF6F0/gi, 'var(--color-page-background)');
  content = content.replace(/#243746/gi, 'var(--color-surface-dark-raised)');
  // Keep #25D366 because it's WhatsApp color
  // content = content.replace(/#25D366/gi, 'var(--color-success)'); 
  content = content.replace(/#E2E6E8/gi, 'var(--color-border-default)');
  content = content.replace(/#66727A/gi, 'var(--color-text-secondary)');
  content = content.replace(/#E5E8EA/gi, 'var(--color-border-subtle)');
  content = content.replace(/#E7EAEC/gi, 'var(--color-border-default)');
  content = content.replace(/#FFFFFF/gi, 'var(--color-surface-primary)');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});

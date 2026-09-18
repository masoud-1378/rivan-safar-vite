const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const utilities = `
@utility btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-control);
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
}
@utility btn:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}
@utility btn:disabled {
  background-color: var(--color-disabled-background);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

@utility btn-large {
  height: 56px;
  padding-inline: 24px;
}
@utility btn-medium {
  height: 48px;
  padding-inline: 20px;
}
@utility btn-small {
  height: 40px;
  padding-inline: 16px;
}

@utility btn-primary {
  background-color: var(--color-brand-orange);
  color: var(--color-text-on-brand);
  border: none;
}
@utility btn-primary:hover:not(:disabled) {
  background-color: var(--color-brand-orange-hover);
}
@utility btn-primary:active:not(:disabled) {
  background-color: var(--color-brand-orange-active);
}

@utility btn-secondary {
  background-color: var(--color-brand-navy);
  color: #FFFFFF;
  border: none;
}
@utility btn-secondary:hover:not(:disabled) {
  background-color: var(--color-brand-navy-hover);
}

@utility btn-outline {
  background-color: transparent;
  color: var(--color-brand-navy);
  border: 1px solid var(--color-border-default);
}
@utility btn-outline:hover:not(:disabled) {
  background-color: var(--color-brand-orange-soft);
  border-color: var(--color-brand-orange);
  color: var(--color-brand-orange);
}

@utility text-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-brand-orange);
  font-weight: 600;
  transition: color 0.2s ease;
}
@utility text-link:hover {
  color: var(--color-brand-orange-hover);
}
@utility text-link:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
  border-radius: 4px;
}

@utility icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-control);
  transition: all 0.2s ease;
  cursor: pointer;
  flex-shrink: 0;
}
@utility icon-btn:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

@utility icon-btn-large {
  width: 48px;
  height: 48px;
}
@utility icon-btn-medium {
  width: 44px;
  height: 44px;
}
@utility icon-btn-small {
  width: 40px;
  height: 40px;
}
`;

css += utilities;
fs.writeFileSync('src/index.css', css, 'utf8');

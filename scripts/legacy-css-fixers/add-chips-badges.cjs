const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const newCSS = `
/* --- Badge System --- */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 28px;
  padding-inline: 12px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  background-color: var(--color-surface-secondary);
  color: var(--color-brand-navy);
}
.badge-brand {
  background-color: var(--color-brand-orange-soft);
  color: var(--color-brand-orange);
}
.badge-info {
  background-color: var(--color-brand-navy-soft);
  color: var(--color-brand-navy);
}

/* --- Status System --- */
.status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 28px;
  padding-inline: 12px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.status-success {
  background-color: var(--color-success-soft);
  color: var(--color-success);
}
.status-warning {
  background-color: var(--color-warning-soft);
  color: var(--color-warning);
}
.status-unavailable {
  background-color: var(--color-surface-secondary);
  color: var(--color-text-muted);
}
.status-info {
  background-color: var(--color-info-soft);
  color: var(--color-info);
}

/* --- Duration Chip --- */
.chip-duration {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding-inline: 12px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  background-color: rgba(255,255,255,0.92);
  color: var(--color-brand-navy);
  border: 1px solid rgba(255,255,255,0.5);
  backdrop-filter: blur(4px);
}

/* --- Interactive Chip System --- */
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: var(--radius-pill);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  color: var(--color-brand-navy);
}
.chip:hover:not(:disabled) {
  border-color: var(--color-border-brand);
  background-color: var(--color-brand-orange-soft);
}
.chip-selected {
  background-color: var(--color-brand-orange-soft);
  border-color: var(--color-brand-orange);
  color: var(--color-brand-orange);
}
.chip:disabled {
  background-color: var(--color-disabled-background);
  color: var(--color-text-muted);
  border-color: var(--color-border-subtle);
  cursor: not-allowed;
}
.chip:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}
.chip-small {
  height: 32px;
  padding-inline: 10px;
  font-size: 12px;
}
.chip-standard {
  height: 40px;
  padding-inline: 14px;
}
`;

fs.writeFileSync('src/index.css', css + newCSS, 'utf8');

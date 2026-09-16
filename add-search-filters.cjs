const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const searchCSS = `
/* --- Search & Dropdown System --- */
.search-hero {
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  position: relative;
  z-index: 20;
}

.search-compact {
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-control);
  box-shadow: var(--shadow-subtle);
  display: flex;
  align-items: center;
  position: relative;
  z-index: 20;
  height: 48px;
}

.search-divider {
  width: 1px;
  height: 32px;
  background-color: var(--color-border-subtle);
  margin-inline: 8px;
}

.dropdown-panel {
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-control);
  box-shadow: var(--shadow-floating);
  padding: 8px;
  z-index: 100;
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  overflow: hidden;
}

.dropdown-option {
  min-height: 44px;
  padding-inline: 12px;
  border-radius: var(--radius-small);
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 100%;
  text-align: right;
  cursor: pointer;
  background-color: transparent;
  border: none;
}

.dropdown-option:hover, .dropdown-option:focus-visible {
  background-color: var(--color-brand-orange-soft);
  color: var(--color-brand-orange);
  outline: none;
}

.dropdown-option-group {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 600;
  padding-inline: 12px;
  padding-block: 8px;
  margin-top: 4px;
}

.filter-sidebar {
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-card);
  padding: 20px;
}

.filter-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding-block: 12px;
  font-weight: 600;
  color: var(--color-text-heading);
}

.filter-panel-mobile {
  background-color: var(--color-surface-primary);
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.filter-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--color-border-default);
}

.filter-panel-body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.filter-panel-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border-default);
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: var(--color-surface-primary);
  position: sticky;
  bottom: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 64px 24px;
  background-color: var(--color-surface-primary);
  border: 1px dashed var(--color-border-default);
  border-radius: var(--radius-card);
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  background-color: var(--color-surface-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-heading);
  margin-bottom: 8px;
}

.empty-state-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
  max-width: 320px;
}
`;

fs.writeFileSync('src/index.css', css + searchCSS, 'utf8');

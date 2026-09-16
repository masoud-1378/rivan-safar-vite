const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const formsCSS = `
/* --- Form System --- */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.form-label {
  color: var(--color-text-primary);
  font-weight: 500;
  font-size: 14px;
}

.form-label-required::after {
  content: "*";
  color: var(--color-danger);
  margin-right: 4px;
}

.form-input {
  height: 48px;
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-control);
  padding-inline: 16px;
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 400;
  width: 100%;
  transition: all 0.2s ease;
}

.form-input-large {
  height: 56px;
}

.form-input::placeholder {
  color: var(--color-text-muted);
}

.form-input:hover:not(:disabled) {
  border-color: #B0B9BE;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-brand-orange);
  box-shadow: var(--shadow-focus);
}

.form-input:disabled {
  background-color: var(--color-disabled-background);
  color: var(--color-text-muted);
  cursor: not-allowed;
  border-color: var(--color-border-subtle);
}

.form-input-error {
  border-color: var(--color-danger);
}
.form-input-error:focus {
  box-shadow: 0 0 0 3px rgba(217, 61, 61, 0.16);
}

.form-input-success {
  border-color: var(--color-success);
}
.form-input-success:focus {
  box-shadow: 0 0 0 3px rgba(22, 167, 101, 0.16);
}

.form-textarea {
  min-height: 120px;
  padding-block: 16px;
  resize: vertical;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%2366727A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: left 12px center;
  background-repeat: no-repeat;
  background-size: 20px;
  padding-left: 40px;
}

.form-checkbox {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background-color: var(--color-surface-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  flex-shrink: 0;
}

.form-checkbox:hover:not(:disabled) {
  border-color: var(--color-border-brand);
}

.form-checkbox:checked {
  background-color: var(--color-brand-orange);
  border-color: var(--color-brand-orange);
}

.form-checkbox:checked::after {
  content: "";
  position: absolute;
  width: 5px;
  height: 10px;
  border: solid var(--color-brand-navy);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  top: 3px;
}

.form-checkbox:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.form-checkbox:disabled {
  background-color: var(--color-disabled-background);
  border-color: var(--color-border-subtle);
  cursor: not-allowed;
}
.form-checkbox:disabled:checked::after {
  border-color: var(--color-text-muted);
}

.form-radio {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 1px solid var(--color-border-default);
  border-radius: 50%;
  background-color: var(--color-surface-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  flex-shrink: 0;
}
.form-radio:hover:not(:disabled) {
  border-color: var(--color-border-brand);
}
.form-radio:checked {
  border-color: var(--color-brand-orange);
}
.form-radio:checked::after {
  content: "";
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--color-brand-orange);
}
.form-radio:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}
.form-radio:disabled {
  background-color: var(--color-disabled-background);
  border-color: var(--color-border-subtle);
  cursor: not-allowed;
}
.form-radio:disabled:checked::after {
  background-color: var(--color-text-muted);
}

.form-switch {
  appearance: none;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background-color: var(--color-border-default);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.form-switch::after {
  content: "";
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #FFF;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-subtle);
}
.form-switch:checked {
  background-color: var(--color-brand-orange);
}
.form-switch:checked::after {
  transform: translateX(-20px);
}
.form-switch:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}
.form-switch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-control-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  min-height: 44px;
}

.form-helper-text {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.form-error-text {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-danger);
  display: flex;
  align-items: center;
  gap: 4px;
}
.form-success-text {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-success);
  display: flex;
  align-items: center;
  gap: 4px;
}
`;

fs.writeFileSync('src/index.css', css + formsCSS, 'utf8');

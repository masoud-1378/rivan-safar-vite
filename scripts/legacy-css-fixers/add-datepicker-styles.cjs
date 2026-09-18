const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const datePickerCSS = `
/* --- Date Picker & Passenger Selector System --- */
.date-picker-panel {
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-floating);
  padding: 16px;
  width: 320px;
}

.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-weight: 600;
  color: var(--color-text-heading);
}

.date-picker-day {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-primary);
  transition: all 0.2s ease;
}

.date-picker-day:hover:not(:disabled) {
  background-color: var(--color-surface-secondary);
}

.date-picker-day.today {
  border: 1px solid var(--color-brand-orange);
  color: var(--color-brand-orange);
  font-weight: 600;
}

.date-picker-day.selected {
  background-color: var(--color-brand-orange);
  color: #FFFFFF;
  font-weight: 700;
}

.date-picker-day.in-range {
  background-color: var(--color-brand-orange-soft);
  border-radius: 0;
}

.date-picker-day:disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.5;
}

/* Passenger Selector */
.passenger-selector-panel {
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-floating);
  padding: 16px;
  width: 280px;
}

.passenger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 12px;
}
.passenger-row:not(:last-child) {
  border-bottom: 1px solid var(--color-border-subtle);
}

.passenger-counter {
  display: flex;
  align-items: center;
  gap: 12px;
}

.passenger-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background-color: var(--color-surface-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.passenger-btn:hover:not(:disabled) {
  border-color: var(--color-brand-orange);
  color: var(--color-brand-orange);
}

.passenger-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.passenger-val {
  font-weight: 600;
  color: var(--color-text-heading);
  min-width: 20px;
  text-align: center;
}
`;

fs.writeFileSync('src/index.css', css + datePickerCSS, 'utf8');

const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const cardsCSS = `
/* --- Card System - 6B --- */

/* Card / Tour */
.card-tour {
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.card-tour:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-floating);
}

.card-tour-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  flex-shrink: 0;
}

.card-tour-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-tour:hover .card-tour-image {
  transform: scale(1.02);
}

.card-tour.sold-out .card-tour-image {
  opacity: 0.7;
  filter: grayscale(80%);
}

.card-tour-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-tour-title {
  color: var(--color-text-heading);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  margin-bottom: 8px;
  transition: color 0.2s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tour:hover .card-tour-title {
  color: var(--color-brand-orange);
}

.card-tour-meta {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  column-gap: 8px;
  row-gap: 4px;
}

.card-tour-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.card-tour-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 639px) {
  .card-tour-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .card-tour-footer .btn {
    width: 100%;
  }
}

.card-tour-price-label {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.card-tour-price-value {
  color: var(--color-brand-orange);
  font-size: 18px;
  font-weight: 800;
  margin-inline: 4px;
}

.card-tour-arrow {
  transition: transform 0.2s ease;
}

.card-tour:hover .card-tour-arrow {
  transform: translateX(-3px);
}

/* Card / Destination */
.card-destination {
  position: relative;
  background-color: var(--color-surface-primary);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
  cursor: pointer;
  aspect-ratio: 4 / 5;
  width: 100%;
}

.card-destination:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-floating);
}

.card-destination-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease-out;
}

.card-destination:hover .card-destination-image {
  transform: scale(1.03);
}

.card-destination-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(16, 24, 32, 0.95) 0%, rgba(16, 24, 32, 0.4) 50%, transparent 100%);
  z-index: 10;
}

.card-destination-content {
  position: absolute;
  inset: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 20;
  color: #FFFFFF;
}

.card-destination-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-destination-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-destination-footer {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-destination-price-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.card-destination-price-value {
  font-size: 16px;
  font-weight: 800;
  margin-inline: 4px;
}

.card-destination-icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.card-destination:hover .card-destination-icon-btn {
  background-color: rgba(255, 255, 255, 0.2);
}

.card-destination-arrow {
  transition: transform 0.2s ease;
}

.card-destination:hover .card-destination-arrow {
  transform: translateX(-3px);
}
`;

fs.writeFileSync('src/index.css', css + cardsCSS, 'utf8');

const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const cardsCSS = `
/* --- Card System - 6C --- */

/* Card / Need */
.card-need {
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-card);
  padding: 16px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
}
@media (min-width: 768px) {
  .card-need {
    flex-direction: row;
    align-items: center;
    padding: 24px;
  }
}
.card-need:hover {
  transform: translateY(-2px);
  border-color: rgba(230, 81, 0, 0.3); /* brand orange with opacity */
  box-shadow: var(--shadow-subtle);
}

.card-need-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-control);
  background-color: var(--color-brand-orange-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
}
@media (max-width: 767px) {
  .card-need-icon-wrapper {
    width: 40px;
    height: 40px;
  }
}

.card-need-content {
  flex: 1;
  text-align: right;
  margin-top: 12px;
}
@media (min-width: 768px) {
  .card-need-content {
    margin-top: 0;
    margin-right: 16px;
  }
}

.card-need-title {
  color: var(--color-text-heading);
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
  transition: color 0.2s ease;
}
.card-need:hover .card-need-title {
  color: var(--color-brand-orange);
}

.card-need-desc {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.5;
}
@media (max-width: 767px) {
  .card-need-desc {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.card-need-arrow {
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  opacity: 0.5;
}
@media (max-width: 767px) {
  .card-need-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
}
.card-need:hover .card-need-arrow {
  color: var(--color-brand-orange);
  transform: translateX(-4px);
  opacity: 1;
}

/* Card / Article / Featured */
.card-article-featured {
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-card);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: none;
}
.card-article-featured:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-subtle);
}

.card-article-featured-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.card-article-featured:hover .card-article-featured-image {
  transform: scale(1.02);
}

.card-article-featured-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  text-align: right;
  flex: 1;
}

.card-article-category {
  color: var(--color-brand-orange);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.card-article-featured-title {
  font-size: 20px; /* equivalent to h3 */
  font-weight: 800;
  color: var(--color-text-heading);
  margin-bottom: 8px;
  transition: color 0.2s ease;
}
.card-article-featured:hover .card-article-featured-title {
  color: var(--color-brand-orange);
}

.card-article-featured-desc {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-article-meta {
  color: var(--color-text-secondary);
  font-size: 12px;
}

/* Card / Article / Compact */
.card-article-compact {
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-card);
  overflow: hidden;
  display: flex;
  align-items: stretch;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: none;
}
.card-article-compact:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-subtle);
}

.card-article-compact-thumbnail {
  width: 100px;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
  overflow: hidden;
}
@media (min-width: 640px) {
  .card-article-compact-thumbnail {
    width: 120px;
  }
}
.card-article-compact-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.card-article-compact:hover .card-article-compact-thumbnail img {
  transform: scale(1.03);
}

.card-article-compact-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  text-align: right;
}

.card-article-compact-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-heading);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;
}
.card-article-compact:hover .card-article-compact-title {
  color: var(--color-brand-orange);
}

/* Card / Info */
.card-info {
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-card);
  padding: 24px;
  display: flex;
  flex-direction: column;
  text-align: right;
  transition: border-color 0.3s ease;
}
.card-info:hover {
  border-color: rgba(230, 81, 0, 0.2);
}

.card-info-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-control);
  background-color: var(--color-brand-orange-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.card-info-title {
  color: var(--color-text-heading);
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.card-info-desc {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

/* Trust / Info Item (Icon + Text without border) */
.info-item {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.info-item-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-control);
  background-color: var(--color-brand-orange-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--color-brand-orange);
}

.info-item-title {
  color: var(--color-text-heading);
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.info-item-desc {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}
`;

fs.writeFileSync('src/index.css', css + cardsCSS, 'utf8');

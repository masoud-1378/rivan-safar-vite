const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const cardsCSS = `
/* Card / Exhibition */
.card-exhibition {
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-card);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
}
.card-exhibition:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}
.card-exhibition-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  flex-shrink: 0;
}
.card-exhibition-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.card-exhibition:hover .card-exhibition-image {
  transform: scale(1.03);
}
.card-exhibition-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  text-align: right;
}
.card-exhibition-title {
  color: var(--color-text-heading);
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  transition: color 0.2s ease;
}
.card-exhibition:hover .card-exhibition-title {
  color: var(--color-brand-orange);
}
.card-exhibition-meta {
  color: var(--color-text-secondary);
  font-size: 13px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.card-exhibition-footer {
  margin-top: auto;
  padding-top: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.card-exhibition-cta {
  color: var(--color-brand-orange);
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: transform 0.2s ease;
}
.card-exhibition:hover .card-exhibition-cta {
  transform: translateX(-4px);
}
`;

fs.writeFileSync('src/index.css', css + cardsCSS, 'utf8');

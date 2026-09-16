const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const newUtilities = `
@utility text-body-lg {
  font-size: clamp(16px, 1.1vw, 18px);
  line-height: 1.9;
  font-weight: var(--font-weight-regular);
}
@utility text-body {
  font-size: clamp(14px, 1vw, 16px);
  line-height: 1.9;
  font-weight: var(--font-weight-regular);
}
@utility text-body-sm {
  font-size: clamp(13px, 0.9vw, 14px);
  line-height: 1.8;
  font-weight: var(--font-weight-regular);
}
@utility text-caption {
  font-size: 12px;
  line-height: 1.7;
  font-weight: var(--font-weight-medium);
}
@utility text-label {
  font-size: 14px;
  line-height: 1.6;
  font-weight: var(--font-weight-medium);
}
@utility text-card-title {
  font-size: clamp(16px, 1.25vw, 20px);
  line-height: 1.6;
  font-weight: var(--font-weight-bold);
}
@utility text-price {
  font-size: clamp(18px, 1.45vw, 22px);
  line-height: 1.4;
  font-weight: var(--font-weight-extrabold);
}
@utility text-price-lg {
  font-size: clamp(22px, 2vw, 28px);
  line-height: 1.35;
  font-weight: var(--font-weight-extrabold);
}
@utility text-btn {
  font-size: clamp(14px, 1vw, 15px);
  line-height: 1.5;
  font-weight: var(--font-weight-bold);
}
@utility text-nav {
  font-size: 15px;
  line-height: 1.6;
  font-weight: var(--font-weight-semibold);
}
@utility text-badge {
  font-size: 12px;
  line-height: 1.5;
  font-weight: var(--font-weight-semibold);
}
@utility text-chip {
  font-size: 14px;
  line-height: 1.5;
  font-weight: var(--font-weight-semibold);
}
`;

css += newUtilities;

fs.writeFileSync('src/index.css', css, 'utf8');

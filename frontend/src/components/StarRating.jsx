import { useState } from 'react';

export default function StarRating({ value = 0, onChange, size = 'md', readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  const stars = [1, 2, 3, 4, 5];

  return (
    <div
      className={`star-rating star-rating--${size}`}
      onMouseLeave={() => !readOnly && setHovered(0)}
    >
      {stars.map(n => (
        <span
          key={n}
          className={
            'star-rating__star' +
            (n <= (hovered || value) ? ' filled' : '') +
            (n <= hovered ? ' hovered' : '')
          }
          onMouseEnter={() => !readOnly && setHovered(n)}
          onClick={() => !readOnly && onChange && onChange(n)}
          title={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

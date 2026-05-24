import React, { useState } from 'react';

const UserAvatar = ({ username = 'U', avatarUrl, size = 32, className = '' }) => {
  const [hasError, setHasError] = useState(false);

  // Check if it's a default local assets path that doesn't exist
  const isDefaultPath = !avatarUrl || avatarUrl.startsWith('/avatars/');

  if (isDefaultPath || hasError) {
    const firstLetter = username ? username.charAt(0).toUpperCase() : 'U';
    
    // Deterministic premium gradients based on username
    const gradients = [
      'linear-gradient(135deg, #ff8000, #ff4d00)', // ShutterScore Orange
      'linear-gradient(135deg, #00c030, #00a020)', // Letterboxd Green
      'linear-gradient(135deg, #40bcf4, #008cc4)', // Cinematic Blue
      'linear-gradient(135deg, #a855f7, #7e22ce)', // Regal Purple
      'linear-gradient(135deg, #ec4899, #be185d)'  // Pink Glow
    ];

    let hash = 0;
    const nameStr = username || 'U';
    for (let i = 0; i < nameStr.length; i++) {
      hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const gradientIndex = Math.abs(hash) % gradients.length;
    const selectedGradient = gradients[gradientIndex];

    return (
      <div
        className={`user-avatar-fallback ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: selectedGradient,
          color: '#ffffff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: `${size * 0.45}px`,
          textTransform: 'uppercase',
          userSelect: 'none',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0
        }}
      >
        {firstLetter}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={username}
      onError={() => setHasError(true)}
      className={`user-avatar-img ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'inline-block',
        flexShrink: 0
      }}
    />
  );
};

export default UserAvatar;

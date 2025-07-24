import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SoundManager from '../utils/SoundManager';
import './PrizeWheel.css';

const PrizeWheel = ({ restaurants }) => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);
  const spinSoundRef = useRef(null);

  useEffect(() => {
    setSelectedRestaurant(null);
  }, [restaurants]);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ];

  const handleSpin = () => {
    if (isSpinning || restaurants.length === 0) return;

    setIsSpinning(true);
    setSelectedRestaurant(null);

    const segmentAngle = 360 / restaurants.length;
    const spins = 5;
    const randomSpinAngle = Math.random() * 360;
    const finalRotation = rotation + (360 * spins) + randomSpinAngle;

    setRotation(finalRotation);

    SoundManager.playClickSound();
    spinSoundRef.current = SoundManager.playSpinSound();

    setTimeout(() => {
      setIsSpinning(false);
      
      // Calculate which restaurant the arrow points to after spinning
      const normalizedAngle = (finalRotation % 360 + 360) % 360;
      const adjustedAngle = (360 - normalizedAngle) % 360;
      const selectedIndex = Math.floor(adjustedAngle / segmentAngle) % restaurants.length;
      
      setSelectedRestaurant(restaurants[selectedIndex]);
      
      if (spinSoundRef.current) {
        try {
          spinSoundRef.current.stop();
        } catch (e) {
          console.log('Sound stop failed:', e);
        }
      }
      
      SoundManager.playWinSound();
    }, 3000);
  };

  const renderWheelSegments = () => {
    if (restaurants.length === 0) return null;

    const segmentAngle = 360 / restaurants.length;
    const radius = 167;; // (334px / 2)
    const centerX = 167;; // Half of SVG width (334px / 2)
    const centerY = 167;; // Half of SVG height (334px / 2)
    
    return (
      <svg width="334" height="334" style={{ position: 'absolute' }}>
        {restaurants.map((restaurant, index) => {
          const startAngle = (index * segmentAngle - 90) * (Math.PI / 180); // -90 to start from top
          const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
          const color = colors[index % colors.length];
          
          // Calculate path coordinates
          const x1 = centerX + radius * Math.cos(startAngle);
          const y1 = centerY + radius * Math.sin(startAngle);
          const x2 = centerX + radius * Math.cos(endAngle);
          const y2 = centerY + radius * Math.sin(endAngle);
          
          const largeArcFlag = segmentAngle > 180 ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          // Calculate text position
          const midAngle = startAngle + (endAngle - startAngle) / 2;
          const textRadius = radius * 0.7;
          const textX = centerX + textRadius * Math.cos(midAngle);
          const textY = centerY + textRadius * Math.sin(midAngle);
          
          // Adjust max characters based on number of segments
          const maxChars = restaurants.length <= 4 ? 15 : restaurants.length <= 8 ? 12 : 8;
          const truncatedName = truncateText(restaurant.name, maxChars);
          
          return (
            <g key={restaurant.id}>
              <path
                d={pathData}
                fill={color}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="1"
              />
              <text
                x={textX}
                y={textY}
                fill="white"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                <tspan x={textX} dy="-6">{truncatedName}</tspan>
                <tspan x={textX} dy="12" fontSize="10">★ {restaurant.rating}</tspan>
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  if (restaurants.length === 0) {
    return (
      <div className="prize-wheel-container">
        <div className="no-restaurants">
          <p>{t('wheel.noRestaurants')}</p>
          <p>{t('wheel.adjustCriteria')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prize-wheel-container">
      <div className="wheel-wrapper">
        <div
          ref={wheelRef}
          className={`prize-wheel ${isSpinning ? 'spinning' : ''}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
          }}
        >
          {renderWheelSegments()}
        </div>
        
        <div className="wheel-center">
          <button
            className={`spin-button ${isSpinning ? 'spinning' : ''}`}
            onClick={handleSpin}
            disabled={isSpinning}
          >
            {isSpinning ? t('wheel.spinning') : t('wheel.spin')}
          </button>
        </div>
        
        <div className="wheel-pointer"></div>
      </div>

      {selectedRestaurant && (
        <div className="result-card">
          <h2>{t('wheel.resultTitle')}</h2>
          <div className="restaurant-info">
            <h3>{selectedRestaurant.name}</h3>
            <div className="restaurant-details">
              <span className="rating">★ {selectedRestaurant.rating}</span>
              <span className="distance">{selectedRestaurant.formattedDistance}</span>
              <span className="cuisine">
                {selectedRestaurant.cuisineTypes.join(', ')}
              </span>
            </div>
            <p className="address">{selectedRestaurant.address}</p>
            {!selectedRestaurant.isOpen && (
              <p className="closed-warning">{t('wheel.closedWarning')}</p>
            )}
            <div className="action-buttons">
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedRestaurant.location.lat},${selectedRestaurant.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn directions-btn"
              >
                {t('wheel.directions')}
              </a>
              <a 
                href={`https://www.google.com/maps/search/${encodeURIComponent(selectedRestaurant.name + ' ' + selectedRestaurant.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn maps-btn"
              >
                {t('wheel.viewOnMaps')}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrizeWheel;

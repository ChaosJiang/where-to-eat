import React, { useState, useRef, useEffect, useMemo } from 'react';
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
    
    // Cleanup function to stop any ongoing sounds
    return () => {
      if (spinSoundRef.current) {
        try {
          spinSoundRef.current.stop();
        } catch (e) {
          // Sound may already be stopped
        }
      }
    };
  }, [restaurants]);

  useEffect(() => {
    if (selectedRestaurant) {
      setTimeout(() => {
        document.getElementsByClassName('result-card')[0]?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedRestaurant]);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6',
    '#1ABC9C', '#34495E', '#E67E22', '#95A5A6', '#16A085'
  ];

  const handleSpin = () => {
    if (isSpinning || restaurants.length === 0) return;
    // Prevent multiple rapid clicks
    if (Date.now() - (window.lastSpinTime || 0) < 500) return;
    window.lastSpinTime = Date.now();

    setIsSpinning(true);
    setSelectedRestaurant(null);

    const segmentAngle = 360 / restaurants.length;
    const spins = Math.floor(Math.random() * 3) + 4; // 4-6 spins for variety
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

  const wheelSegments = useMemo(() => {
    if (restaurants.length === 0) return null;

    const segmentAngle = 360 / restaurants.length;
    // Make SVG responsive with minimal spacing
    const svgSize = 'calc(100% - 8px)'; // 100% minus 4px border on each side
    const radius = 163; // Increased radius for tighter fit
    const centerX = 167; // Center coordinates stay the same for calculations
    const centerY = 167;
    
    return (
      <svg 
        width={svgSize} 
        height={svgSize} 
        viewBox="0 0 334 334"
        style={{ position: 'absolute', top: '4px', left: '4px' }}
      >
        {restaurants.map((restaurant, index) => {
          const startAngle = (index * segmentAngle - 90) * (Math.PI / 180); // -90 to start from top
          const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
          const color = colors[index % colors.length];
          
          // For single restaurant, create a full circle
          if (restaurants.length === 1) {
            return (
              <g key={restaurant.id}>
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill={color}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="1"
                />
                <text
                  x={centerX}
                  y={centerY - 60}
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}
                >
                  <tspan x={centerX} dy="-8">{truncateText(restaurant.name, 18)}</tspan>
                  <tspan x={centerX} dy="20" fontSize="14">★ {restaurant.rating}</tspan>
                </text>
              </g>
            );
          }
          
          // Calculate path coordinates for multiple restaurants
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
  }, [restaurants]);

  const renderWheelSegments = () => wheelSegments;

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
            aria-label={isSpinning ? t('wheel.spinning') : t('wheel.spin')}
            title={isSpinning ? t('wheel.spinning') : t('wheel.spin')}
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

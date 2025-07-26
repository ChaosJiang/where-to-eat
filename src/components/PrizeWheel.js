import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SoundManager from '../utils/SoundManager';
import './PrizeWheel.css';

const PrizeWheel = ({ restaurants }) => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [highlightedSegment, setHighlightedSegment] = useState(null);
  const wheelRef = useRef(null);
  const spinSoundRef = useRef(null);
  const tickIntervalRef = useRef(null);

  useEffect(() => {
    setSelectedRestaurant(null);
    setHighlightedSegment(null);
    
    // Cleanup function to stop any ongoing sounds and intervals
    return () => {
      if (spinSoundRef.current) {
        try {
          spinSoundRef.current.stop();
        } catch (e) {
          // Sound may already be stopped
        }
      }
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
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

  // Get currency symbol from currency code
  const getCurrencySymbol = (currencyCode) => {
    const currencyMap = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CNY': '¥',
      'KRW': '₩',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'SGD': 'S$',
      'HKD': 'HK$',
      'THB': '฿',
      'INR': '₹',
      'MXN': '$',
      'BRL': 'R$',
      'RUB': '₽',
      'ZAR': 'R',
      'NZD': 'NZ$',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft'
    };
    return currencyMap[currencyCode?.toUpperCase()] || currencyCode || '$';
  };

  const getSegmentColor = (restaurant) => {
    // Use simple alternating colors for visual distinction
    const colors = ['#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
    const index = restaurants.indexOf(restaurant);
    return colors[index % colors.length];
  };

  const handleSpin = () => {
    if (isSpinning || restaurants.length === 0) return;
    // Prevent multiple rapid clicks
    if (Date.now() - (window.lastSpinTime || 0) < 500) return;
    window.lastSpinTime = Date.now();

    setIsSpinning(true);
    setSelectedRestaurant(null);
    setHighlightedSegment(null);

    const segmentAngle = 360 / restaurants.length;
    const spins = Math.floor(Math.random() * 3) + 4; // 4-6 spins for variety
    const randomSpinAngle = Math.random() * 360;
    const finalRotation = rotation + (360 * spins) + randomSpinAngle;

    setRotation(finalRotation);

    SoundManager.playClickSound();
    spinSoundRef.current = SoundManager.playSpinSound();

    // Setup tick sounds during spin
    let currentSegment = -1;
    const tickInterval = setInterval(() => {
      const currentRotation = rotation + ((finalRotation - rotation) * 
        Math.min((Date.now() - window.lastSpinTime) / 3000, 1));
      
      const normalizedAngle = (currentRotation % 360 + 360) % 360;
      const adjustedAngle = (360 - normalizedAngle) % 360;
      const segmentIndex = Math.floor(adjustedAngle / segmentAngle) % restaurants.length;
      
      if (segmentIndex !== currentSegment) {
        currentSegment = segmentIndex;
        setHighlightedSegment(segmentIndex);
        SoundManager.playTickSound();
        
        // Add haptic feedback on mobile
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      }
    }, 50);

    tickIntervalRef.current = tickInterval;

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setHighlightedSegment(null);
      
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
    const svgSize = 'calc(100% - 8px)';
    const radius = 163;
    const centerX = 167;
    const centerY = 167;
    
    return (
      <svg 
        width={svgSize} 
        height={svgSize} 
        viewBox="0 0 334 334"
        style={{ position: 'absolute', top: '4px', left: '4px' }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {restaurants.map((restaurant, index) => {
          const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
          const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
          const color = getSegmentColor(restaurant);
          const isHighlighted = highlightedSegment === index;
          
          // Single restaurant case
          if (restaurants.length === 1) {
            return (
              <g key={restaurant.id}>
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill={color}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="2"
                  filter={isHighlighted ? "url(#glow)" : "none"}
                  style={{
                    filter: isHighlighted ? 'brightness(1.3) drop-shadow(0 0 10px rgba(255,255,255,0.5))' : 'none'
                  }}
                />
                <text
                  x={centerX}
                  y={centerY - 20}
                  fill="white"
                  fontSize="18"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}
                >
                  {truncateText(restaurant.name, 20)}
                </text>
              </g>
            );
          }
          
          // Multiple restaurants
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
          
          // Improved text positioning - always horizontal
          const midAngle = startAngle + (endAngle - startAngle) / 2;
          const textRadius = radius * 0.65;
          const textX = centerX + textRadius * Math.cos(midAngle);
          const textY = centerY + textRadius * Math.sin(midAngle);
          
          // Better text sizing based on segment count
          const fontSize = restaurants.length <= 4 ? 14 : restaurants.length <= 8 ? 12 : 10;
          const maxChars = restaurants.length <= 4 ? 16 : restaurants.length <= 8 ? 14 : 10;
          const truncatedName = truncateText(restaurant.name, maxChars);
          
          return (
            <g key={restaurant.id}>
              <path
                d={pathData}
                fill={color}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="2"
                style={{
                  filter: isHighlighted ? 'brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.6))' : 'none',
                  transition: 'all 0.1s ease'
                }}
              />
              
              {/* Horizontal text - always readable */}
              <text
                x={textX}
                y={textY}
                fill="white"
                fontSize={fontSize}
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ 
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                  letterSpacing: '0.5px'
                }}
              >
                {truncatedName}
              </text>
              
              {/* Cuisine type indicator */}
              {restaurant.cuisineTypes.length > 0 && (
                <circle
                  cx={centerX + (radius * 0.9) * Math.cos(midAngle)}
                  cy={centerY + (radius * 0.9) * Math.sin(midAngle)}
                  r="4"
                  fill="rgba(255, 255, 255, 0.8)"
                  stroke={color}
                  strokeWidth="2"
                />
              )}
            </g>
          );
        })}
      </svg>
    );
  }, [restaurants, highlightedSegment]);

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
              {selectedRestaurant.priceRange && (
                <span className="price-range">
                  {getCurrencySymbol(selectedRestaurant.priceRange.currency)}{selectedRestaurant.priceRange.startPrice}-{getCurrencySymbol(selectedRestaurant.priceRange.currency)}{selectedRestaurant.priceRange.endPrice}
                </span>
              )}
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
              <button 
                onClick={handleSpin}
                className="action-btn spin-again-btn"
                disabled={isSpinning}
              >
                {t('wheel.spinAgain')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrizeWheel;

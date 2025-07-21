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

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ];

  const handleSpin = () => {
    if (isSpinning || restaurants.length === 0) return;

    setIsSpinning(true);
    setSelectedRestaurant(null);

    const randomIndex = Math.floor(Math.random() * restaurants.length);
    const segmentAngle = 360 / restaurants.length;
    const targetAngle = (randomIndex * segmentAngle) + (segmentAngle / 2);
    const spins = 5;
    const finalRotation = rotation + (360 * spins) + (360 - targetAngle);

    setRotation(finalRotation);

    SoundManager.playClickSound();
    spinSoundRef.current = SoundManager.playSpinSound();

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedRestaurant(restaurants[randomIndex]);
      
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
    
    return restaurants.map((restaurant, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = (index + 1) * segmentAngle;
      const color = colors[index % colors.length];
      
      return (
        <div
          key={restaurant.id}
          className="wheel-segment"
          style={{
            '--start-angle': `${startAngle}deg`,
            '--end-angle': `${endAngle}deg`,
            '--color': color,
            transform: `rotate(${startAngle}deg)`,
            zIndex: restaurants.length - index
          }}
        >
          <div className="segment-content">
            <span className="restaurant-name">{restaurant.name}</span>
            <span className="restaurant-rating">★ {restaurant.rating}</span>
          </div>
        </div>
      );
    });
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
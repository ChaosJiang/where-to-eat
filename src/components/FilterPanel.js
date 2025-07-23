import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './FilterPanel.css';

const FilterPanel = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Define fixed cuisine types
  const cuisineTypes = [
    'japanese',
    'chinese', 
    'thai',
    'korean',
    'indian',
    'vietnamese',
    'steak',
    'fast food',
    'italian',
    'mexican',
    'french',
    'sushi',
    'seafood',
    'pizza'
  ];

  const handleRatingChange = (rating) => {
    onFilterChange({ ...filters, minRating: rating });
  };

  const handleDistanceChange = (distance) => {
    onFilterChange({ ...filters, maxDistance: distance });
  };

  const handleCuisineToggle = (cuisine) => {
    // Only allow one cuisine selection at a time
    const updatedCuisines = filters.cuisineTypes.includes(cuisine)
      ? [] // Deselect if already selected
      : [cuisine]; // Replace current selection with new one
    
    onFilterChange({ ...filters, cuisineTypes: updatedCuisines });
  };

  const handleOpenNowToggle = () => {
    onFilterChange({ ...filters, openNow: !filters.openNow });
  };

  const clearAllFilters = () => {
    onFilterChange({
      minRating: 3,
      maxDistance: 1000,
      cuisineTypes: [],
      openNow: true
    });
  };

  const formatDistance = (meters) => {
    if (meters < 1000) return `${meters}m`;
    return `${meters / 1000}km`;
  };

  const hasActiveFilters = filters.minRating > 3 || 
                          filters.maxDistance < 1000 || 
                          filters.cuisineTypes.length > 0 || 
                          filters.openNow !== true;

  return (
    <div className="filter-panel">
      {isExpanded && (
        <div className="filter-content">
          <div className="filter-section">
            <h3>{t('filters.minimumRating')}</h3>
            <div className="rating-filters">
              {[0, 3, 3.5, 4, 4.5].map(rating => (
                <button
                  key={rating}
                  className={`filter-button ${filters.minRating === rating ? 'active' : ''}`}
                  onClick={() => handleRatingChange(rating)}
                >
                  {rating === 0 ? t('filters.any') : `${rating}★+`}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>{t('filters.maximumDistance')}</h3>
            <div className="distance-filters">
              {[500, 1000, 2000, 5000].map(distance => (
                <button
                  key={distance}
                  className={`filter-button ${filters.maxDistance === distance ? 'active' : ''}`}
                  onClick={() => handleDistanceChange(distance)}
                >
                  {formatDistance(distance)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>{t('filters.cuisineTypes')}</h3>
            <div className="cuisine-filters">
              {cuisineTypes.map(cuisine => (
                <button
                  key={cuisine}
                  className={`filter-button cuisine-button ${
                    filters.cuisineTypes.includes(cuisine) ? 'active' : ''
                  }`}
                  onClick={() => handleCuisineToggle(cuisine)}
                >
                  {t(`cuisineTypes.${cuisine}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={filters.openNow}
                onChange={handleOpenNowToggle}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">{t('filters.openNowOnly')}</span>
            </label>
          </div>

          {hasActiveFilters && (
            <div className="filter-section">
              <button 
                className="clear-filters-button"
                onClick={clearAllFilters}
              >
                {t('filters.clearAll')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

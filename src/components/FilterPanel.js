import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './FilterPanel.css';

const FilterPanel = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState({
    rating: true,
    distance: true,
    cuisine: false,
    price: true,
    openNow: true
  });
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  
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

  const handlePriceRangeSelect = (minPrice, maxPrice) => {
    onFilterChange({ ...filters, minPrice, maxPrice });
  };

  // Define common price ranges based on typical Japanese dining costs
  const priceRanges = [
    { min: 0, max: 100000, label: t('priceRanges.all') },
    { min: 1, max: 2000, label: '¥1 - 2,000' },
    { min: 2000, max: 5000, label: '¥2,000 - 5,000' },
    { min: 5000, max: 99999, label: '¥5,000+' },
  ];

  const clearAllFilters = () => {
    onFilterChange({
      minRating: 3.5,
      maxDistance: 1000,
      cuisineTypes: [],
      openNow: true,
      minPrice: 0,
      maxPrice: 100000
    });
  };

  const formatDistance = (meters) => {
    if (meters < 1000) return `${meters}m`;
    return `${meters / 1000}km`;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasActiveFilters = filters.minRating > 3.5 || 
                          filters.maxDistance < 1000 || 
                          filters.cuisineTypes.length > 0 || 
                          filters.openNow !== true ||
                          filters.minPrice > 0 ||
                          filters.maxPrice < 100000;

  const getActiveFiltersArray = () => {
    const activeFilters = [];
    
    if (filters.minRating > 3.5) {
      activeFilters.push(`Rating ≥ ${filters.minRating}★`);
    }
    
    if (filters.maxDistance < 1000) {
      activeFilters.push(`≤ ${formatDistance(filters.maxDistance)}`);
    }
    
    if (filters.cuisineTypes.length > 0) {
      const cuisineLabels = filters.cuisineTypes.map(cuisine => t(`cuisineTypes.${cuisine}`));
      activeFilters.push(cuisineLabels.join(', '));
    }
    
    // Find matching price range
    const matchingPriceRange = priceRanges.find(range => 
      range.min === filters.minPrice && range.max === filters.maxPrice
    );
    if (matchingPriceRange && matchingPriceRange.min > 0 || matchingPriceRange?.max < 100000) {
      activeFilters.push(matchingPriceRange.label);
    }
    
    if (!filters.openNow) {
      activeFilters.push(t('filters.includeClosed'));
    }
    
    return activeFilters;
  };

  const activeFilters = getActiveFiltersArray();

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <button 
        className="mobile-filter-toggle"
        onClick={() => setIsBottomSheetOpen(true)}
      >
        {t('filters.title')} {activeFilters.length > 0 && `(${activeFilters.length})`}
      </button>

      {/* Desktop/Tablet Filter Panel */}
      <div className="filter-panel desktop-filters">
      {/* Active Filters Summary */}
      {activeFilters.length > 0 && (
        <div className="active-filters-summary">
          <div className="active-filters-pill">
            <span className="active-filters-text">
              {activeFilters.join(' • ')}
            </span>
            <button 
              className="clear-all-button"
              onClick={clearAllFilters}
              title={t('filters.clearAll')}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="filter-content">
        {/* Rating Filter Card */}
        <div className="filter-card">
          <div 
            className="filter-card-header" 
            onClick={() => toggleSection('rating')}
          >
            <h3>{t('filters.minimumRating')}</h3>
            <span className={`expand-icon ${expandedSections.rating ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.rating && (
            <div className="filter-card-content">
              <div className="rating-filters">
                {[3.5, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    className={`filter-chip ${filters.minRating === rating ? 'active' : ''}`}
                    onClick={() => handleRatingChange(rating)}
                  >
                    {`${rating}★+`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Distance Filter Card */}
        <div className="filter-card">
          <div 
            className="filter-card-header" 
            onClick={() => toggleSection('distance')}
          >
            <h3>{t('filters.maximumDistance')}</h3>
            <span className={`expand-icon ${expandedSections.distance ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.distance && (
            <div className="filter-card-content">
              <div className="distance-filters">
                {[500, 1000, 2000, 5000].map(distance => (
                  <button
                    key={distance}
                    className={`filter-chip ${filters.maxDistance === distance ? 'active' : ''}`}
                    onClick={() => handleDistanceChange(distance)}
                  >
                    {formatDistance(distance)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cuisine Filter Card */}
        <div className="filter-card">
          <div 
            className="filter-card-header" 
            onClick={() => toggleSection('cuisine')}
          >
            <h3>{t('filters.cuisineTypes')}</h3>
            <span className={`expand-icon ${expandedSections.cuisine ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.cuisine && (
            <div className="filter-card-content">
              <div className="cuisine-filters">
                {cuisineTypes.map(cuisine => (
                  <button
                    key={cuisine}
                    className={`filter-chip cuisine-chip ${
                      filters.cuisineTypes.includes(cuisine) ? 'active' : ''
                    }`}
                    onClick={() => handleCuisineToggle(cuisine)}
                  >
                    {t(`cuisineTypes.${cuisine}`)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price Filter Card */}
        <div className="filter-card">
          <div 
            className="filter-card-header" 
            onClick={() => toggleSection('price')}
          >
            <h3>{t('filters.priceRange')}</h3>
            <span className={`expand-icon ${expandedSections.price ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.price && (
            <div className="filter-card-content">
              <div className="price-range-buttons">
                {priceRanges.map(range => (
                  <button
                    key={`${range.min}-${range.max}`}
                    className={`filter-chip price-chip ${
                      filters.minPrice === range.min && filters.maxPrice === range.max ? 'active' : ''
                    }`}
                    onClick={() => handlePriceRangeSelect(range.min, range.max)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Open Now Filter Card */}
        <div className="filter-card">
          <div 
            className="filter-card-header" 
            onClick={() => toggleSection('openNow')}
          >
            <h3>{t('filters.openNowOnly')}</h3>
            <span className={`expand-icon ${expandedSections.openNow ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.openNow && (
            <div className="filter-card-content">
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
          )}
        </div>
      </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className={`filter-bottom-sheet ${isBottomSheetOpen ? 'open' : ''}`}>
        <div className="bottom-sheet-backdrop" onClick={() => setIsBottomSheetOpen(false)}></div>
        <div className="bottom-sheet-content">
          <div className="bottom-sheet-header">
            <h2>{t('filters.title')}</h2>
            <button 
              className="close-bottom-sheet"
              onClick={() => setIsBottomSheetOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="bottom-sheet-body">
            {/* Active Filters Summary */}
            {activeFilters.length > 0 && (
              <div className="active-filters-summary">
                <div className="active-filters-pill">
                  <span className="active-filters-text">
                    {activeFilters.join(' • ')}
                  </span>
                  <button 
                    className="clear-all-button"
                    onClick={clearAllFilters}
                    title={t('filters.clearAll')}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Duplicate all filter content for mobile */}
            <div className="mobile-filter-content">
              {/* Rating Filter Card */}
              <div className="filter-card">
                <div 
                  className="filter-card-header" 
                  onClick={() => toggleSection('rating')}
                >
                  <h3>{t('filters.minimumRating')}</h3>
                  <span className={`expand-icon ${expandedSections.rating ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
                {expandedSections.rating && (
                  <div className="filter-card-content">
                    <div className="rating-filters">
                      {[3.5, 4, 4.5].map(rating => (
                        <button
                          key={rating}
                          className={`filter-chip ${filters.minRating === rating ? 'active' : ''}`}
                          onClick={() => handleRatingChange(rating)}
                        >
                          {`${rating}★+`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Distance Filter Card */}
              <div className="filter-card">
                <div 
                  className="filter-card-header"
                  onClick={() => toggleSection('distance')}
                >
                  <h3>{t('filters.maximumDistance')}</h3>
                  <span className={`expand-icon ${expandedSections.distance ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
                {expandedSections.distance && (
                  <div className="filter-card-content">
                    <div className="distance-filters">
                      {[500, 1000, 2000, 5000].map(distance => (
                        <button
                          key={distance}
                          className={`filter-chip ${filters.maxDistance === distance ? 'active' : ''}`}
                          onClick={() => handleDistanceChange(distance)}
                        >
                          {distance >= 1000 ? `${distance/1000}km` : `${distance}m`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cuisine Filter Card */}
              <div className="filter-card">
                <div 
                  className="filter-card-header"
                  onClick={() => toggleSection('cuisine')}
                >
                  <h3>{t('filters.cuisineTypes')}</h3>
                  <span className={`expand-icon ${expandedSections.cuisine ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
                {expandedSections.cuisine && (
                  <div className="filter-card-content">
                    <div className="cuisine-filters">
                      {cuisineTypes.map(cuisine => (
                        <button
                          key={cuisine}
                          className={`filter-chip ${filters.cuisineTypes.includes(cuisine) ? 'active' : ''}`}
                          onClick={() => handleCuisineToggle(cuisine)}
                        >
                          {t(`cuisineTypes.${cuisine}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Open Now Filter Card */}
              <div className="filter-card">
                <div 
                  className="filter-card-header"
                  onClick={() => toggleSection('openNow')}
                >
                  <h3>{t('filters.openNowOnly')}</h3>
                  <span className={`expand-icon ${expandedSections.openNow ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
                {expandedSections.openNow && (
                  <div className="filter-card-content">
                    <div className="open-now-filters">
                      <button
                        className={`filter-chip ${filters.openNow ? 'active' : ''}`}
                        onClick={() => handleOpenNowToggle()}
                      >
                        {filters.openNow ? t('filters.openNowOnly') : t('filters.includeClosed')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;

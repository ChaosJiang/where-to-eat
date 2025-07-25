import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import LocationService from './services/LocationService';
import RestaurantService from './services/RestaurantService';
import PrizeWheel from './components/PrizeWheel';
import FilterPanel from './components/FilterPanel';
import LanguageSelector from './components/LanguageSelector';
import ErrorFallback from './components/ErrorFallback';
import './i18n';
import './App.css';

function App() {
  const { t, i18n } = useTranslation();
  const [location, setLocation] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minRating: 3.5,
    maxDistance: 1000,
    cuisineTypes: [],
    openNow: true,
    minPrice: 0,
    maxPrice: 100000
  });

  useEffect(() => {
    initializeApp();
  }, []);

  // Refresh restaurant data when language, cuisine filters, or search radius change
  useEffect(() => {
    if (location) {
      fetchRestaurants(location, filters.cuisineTypes);
    }
  }, [i18n.language, location, filters.cuisineTypes, filters.maxDistance]);

  useEffect(() => {
    if (restaurants.length > 0) {
      applyFilters();
    }
  }, [restaurants, filters.minRating, filters.openNow, filters.minPrice, filters.maxPrice]);

  const fetchRestaurants = async (userLocation, cuisineFilters = []) => {
    try {
      const nearbyRestaurants = await RestaurantService.searchNearby(
        userLocation, 
        filters.maxDistance, 
        i18n.language,
        cuisineFilters
      );
      setRestaurants(nearbyRestaurants);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    }
  };

  const initializeApp = async () => {
    try {
      setLoading(true);
      const userLocation = await LocationService.getCurrentLocation(t);
      setLocation(userLocation);
      
      await fetchRestaurants(userLocation, filters.cuisineTypes);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filtered = restaurants.filter(restaurant => {
      const ratingMatch = restaurant.rating >= filters.minRating;
      // Cuisine filtering is now done at API level, so we don't need to filter here
      const openMatch = !filters.openNow || restaurant.isOpen;
      
      // Price range filtering: check if restaurant's price range overlaps with filter range
      let priceMatch = true;
      if (restaurant.priceRange) {
        const restaurantMinPrice = restaurant.priceRange.startPrice;
        const restaurantMaxPrice = restaurant.priceRange.endPrice;
        // Check if the restaurant's price range is in the filter range
        priceMatch = restaurantMinPrice >= filters.minPrice && restaurantMaxPrice <= filters.maxPrice;
      } else if (filters.minPrice > 0 || filters.maxPrice < 100000) {
        // If no price data and user has set price filters, exclude this restaurant
        priceMatch = false;
      }

      return ratingMatch && openMatch && priceMatch;
    });
    
    setFilteredRestaurants(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="app-container loading">
        <div className="spinner"></div>
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container error">
        <h2>{t('app.error')}</h2>
        <p>{error}</p>
        <button onClick={initializeApp} className="retry-button">
          {t('app.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        setError(null);
        setRestaurants([]);
        setFilteredRestaurants([]);
        initializeApp();
      }}
    >
      <div className="app-container">
        <div className="app-top-bar">
          <LanguageSelector />
        </div>
        <header className="app-header">
          <h1>{t('app.title')}</h1>
          <p>{t('app.subtitle')}</p>
        </header>

        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <FilterPanel 
            filters={filters} 
            onFilterChange={handleFilterChange}
            restaurants={restaurants}
          />
        </ErrorBoundary>

        <div className="sticky-wheel-container">
          <div className="restaurant-count">
            {t('app.restaurantsFound', { count: filteredRestaurants.length })}
          </div>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <PrizeWheel restaurants={filteredRestaurants} />
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;

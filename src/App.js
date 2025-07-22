import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LocationService from './services/LocationService';
import RestaurantService from './services/RestaurantService';
import PrizeWheel from './components/PrizeWheel';
import FilterPanel from './components/FilterPanel';
import LanguageSelector from './components/LanguageSelector';
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
    minRating: 3,
    maxDistance: 1000,
    cuisineTypes: [],
    openNow: true
  });

  useEffect(() => {
    initializeApp();
  }, []);

  // Refresh restaurant data when language or cuisine filters change
  useEffect(() => {
    if (location) {
      fetchRestaurants(location, filters.cuisineTypes);
    }
  }, [i18n.language, location, filters.cuisineTypes]);

  useEffect(() => {
    if (restaurants.length > 0) {
      applyFilters();
    }
  }, [restaurants, filters.minRating, filters.maxDistance, filters.openNow]);

  const fetchRestaurants = async (userLocation, cuisineFilters = []) => {
    try {
      const nearbyRestaurants = await RestaurantService.searchNearby(
        userLocation, 
        5000, 
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
      const distanceMatch = restaurant.distance <= filters.maxDistance;
      // Cuisine filtering is now done at API level, so we don't need to filter here
      const openMatch = !filters.openNow || restaurant.isOpen;
      
      return ratingMatch && distanceMatch && openMatch;
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
    <div className="app-container">
      <header className="app-header">
        <LanguageSelector />
        <h1>{t('app.title')}</h1>
        <p>{t('app.subtitle')}</p>
      </header>

      <FilterPanel 
        filters={filters} 
        onFilterChange={handleFilterChange}
        restaurants={restaurants}
      />

      <div className="restaurant-count">
        {t('app.restaurantsFound', { count: filteredRestaurants.length })}
      </div>

      <PrizeWheel restaurants={filteredRestaurants} />
    </div>
  );
}

export default App;

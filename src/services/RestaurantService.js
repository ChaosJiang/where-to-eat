import LocationService from './LocationService';

class RestaurantService {
  static GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  static isGoogleMapsLoaded = false;
  static placesService = null;
  static loadingPromise = null;

  static async loadGoogleMaps() {
    if (!this.GOOGLE_MAPS_API_KEY) {
      console.log('No Google Maps API key found, using mock data');
      return false;
    }

    // Return existing promise if already loading
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Check if already loaded
    if (this.isGoogleMapsLoaded && window.google && window.google.maps && window.google.maps.places) {
      return true;
    }

    // Check if Google Maps is already available
    if (window.google && window.google.maps && window.google.maps.places) {
      this.isGoogleMapsLoaded = true;
      return true;
    }

    console.log('Loading Google Maps API with key:', this.GOOGLE_MAPS_API_KEY.substring(0, 10) + '...');

    // Create loading promise
    this.loadingPromise = new Promise((resolve) => {
      // Check if script is already loading
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        const checkLoaded = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            this.isGoogleMapsLoaded = true;
            this.loadingPromise = null;
            resolve(true);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // Create unique callback name to avoid conflicts
      const callbackName = 'initGoogleMaps_' + Date.now();
      
      window[callbackName] = () => {
        this.isGoogleMapsLoaded = true;
        this.loadingPromise = null;
        console.log('Google Maps API loaded successfully');
        delete window[callbackName]; // Clean up callback
        resolve(true);
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.GOOGLE_MAPS_API_KEY}&libraries=places&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      script.id = 'google-maps-script';
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        this.loadingPromise = null;
        delete window[callbackName]; // Clean up callback
        resolve(false);
      };

      document.head.appendChild(script);
    });

    return this.loadingPromise;
  }

  static getGoogleMapsLanguage(i18nLanguage) {
    // Map i18n language codes to Google Maps supported language codes
    const languageMap = {
      'en': 'en',
      'ja': 'ja',
      'zh': 'zh-CN'  // Google Maps uses zh-CN for Simplified Chinese
    };
    return languageMap[i18nLanguage] || 'en';
  }

  static mapCuisineTypesToGooglePlacesTypes(cuisineTypes) {
    // Map UI cuisine filter names to Google Places API types
    const cuisineToTypeMap = {
      'american': ['restaurant'],
      'chinese': ['restaurant'],
      'indian': ['restaurant'],
      'italian': ['restaurant'],
      'japanese': ['restaurant'],
      'korean': ['restaurant'],
      'mexican': ['restaurant'],
      'thai': ['restaurant'],
      'french': ['restaurant'],
      'greek': ['restaurant'],
      'mediterranean': ['restaurant'],
      'middle eastern': ['restaurant'],
      'spanish': ['restaurant'],
      'vietnamese': ['restaurant'],
      'turkish': ['restaurant'],
      'seafood': ['restaurant'],
      'steak': ['restaurant'],
      'sushi': ['restaurant'],
      'pizza': ['restaurant'],
      'hamburger': ['restaurant'],
      'sandwich': ['restaurant'],
      'breakfast': ['restaurant'],
      'brunch': ['restaurant'],
      'lunch': ['restaurant'],
      'dinner': ['restaurant'],
      'fast food': ['restaurant'],
      'fine dining': ['restaurant'],
      'family': ['restaurant'],
      'casual dining': ['restaurant'],
      'bakery': ['bakery'],
      'cafe': ['cafe'],
      'bar': ['bar'],
      'food': ['restaurant', 'cafe', 'bakery']
    };

    if (!cuisineTypes || cuisineTypes.length === 0) {
      // If no specific cuisine types selected, search all food establishment types
      return ['restaurant', 'cafe', 'bakery', 'meal_delivery', 'meal_takeaway'];
    }

    const placesTypes = new Set();
    cuisineTypes.forEach(cuisine => {
      const types = cuisineToTypeMap[cuisine.toLowerCase()];
      if (types) {
        types.forEach(type => placesTypes.add(type));
      }
    });

    // If no matching types found, default to restaurant
    return placesTypes.size > 0 ? Array.from(placesTypes) : ['restaurant'];
  }

  static async searchNearby(location, radius = 5000, language = 'en', cuisineTypes = []) {
    const isLoaded = await this.loadGoogleMaps();
    
    if (!isLoaded) {
      return this.getMockRestaurants(location);
    }

    return new Promise((resolve) => {
      try {
        const map = new window.google.maps.Map(document.createElement('div'));
        const service = new window.google.maps.places.PlacesService(map);
        
        const googleMapsLanguage = this.getGoogleMapsLanguage(language);
        const searchTypes = this.mapCuisineTypesToGooglePlacesTypes(cuisineTypes);
        
        const allResults = [];
        let completedSearches = 0;
        
        const handleSearchComplete = () => {
          completedSearches++;
          if (completedSearches === searchTypes.length) {
            // Remove duplicates based on place_id
            const uniqueResults = [];
            const seenIds = new Set();
            
            allResults.forEach(place => {
              if (!seenIds.has(place.place_id)) {
                seenIds.add(place.place_id);
                uniqueResults.push(place);
              }
            });
            
            const formattedResults = uniqueResults.map(place => this.formatRestaurantData(place, location));
            resolve(formattedResults);
          }
        };
        
        searchTypes.forEach(type => {
          const request = {
            location: new window.google.maps.LatLng(location.latitude, location.longitude),
            radius: radius,
            type: type,
            language: googleMapsLanguage
          };

          service.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              allResults.push(...results);
            } else if (status !== window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              console.error(`Places API error for type ${type}:`, status);
            }
            handleSearchComplete();
          });
        });
      } catch (error) {
        console.error('Error with Google Maps Places API:', error);
        resolve(this.getMockRestaurants(location));
      }
    });
  }

  static extractCuisineTypes(types) {
    // Define food/cuisine related types that should be included
    const foodTypes = [
      'bakery', 'bar', 'cafe', 'meal_delivery', 'meal_takeaway', 
      'night_club', 'restaurant', 'food'
    ];
    
    // Define actual cuisine types we want to show
    const cuisineTypes = [
      'american_restaurant', 'chinese_restaurant', 'indian_restaurant', 
      'italian_restaurant', 'japanese_restaurant', 'korean_restaurant',
      'mexican_restaurant', 'thai_restaurant', 'french_restaurant',
      'greek_restaurant', 'mediterranean_restaurant', 'middle_eastern_restaurant',
      'spanish_restaurant', 'vietnamese_restaurant', 'turkish_restaurant',
      'seafood_restaurant', 'steak_house', 'sushi_restaurant',
      'pizza_restaurant', 'hamburger_restaurant', 'sandwich_shop',
      'breakfast_restaurant', 'brunch_restaurant', 'lunch_restaurant',
      'dinner_restaurant', 'fast_food_restaurant', 'fine_dining_restaurant',
      'family_restaurant', 'casual_dining_restaurant'
    ];

    // Filter and format cuisine types
    const filtered = types.filter(type => {
      // Include specific cuisine types
      if (cuisineTypes.includes(type)) return true;
      
      // Include general food types but exclude non-food places
      if (foodTypes.includes(type)) return true;
      
      // Exclude common non-food establishment types
      const excludeTypes = [
        'establishment', 'point_of_interest', 'store', 'shopping_mall',
        'movie_theater', 'gas_station', 'bank', 'atm', 'pharmacy',
        'hospital', 'school', 'gym', 'beauty_salon', 'car_dealer',
        'real_estate_agency', 'lawyer', 'dentist', 'doctor',
        'veterinary_care', 'pet_store', 'book_store', 'clothing_store',
        'electronics_store', 'furniture_store', 'hardware_store',
        'jewelry_store', 'shoe_store', 'supermarket', 'convenience_store',
        'florist', 'home_goods_store', 'liquor_store', 'bicycle_store',
        'car_rental', 'car_repair', 'car_wash', 'parking', 'lodging',
        'travel_agency', 'tourist_attraction', 'amusement_park',
        'aquarium', 'art_gallery', 'casino', 'church', 'city_hall',
        'courthouse', 'embassy', 'fire_station', 'hindu_temple',
        'library', 'local_government_office', 'mosque', 'museum',
        'park', 'place_of_worship', 'police', 'post_office',
        'rv_park', 'school', 'stadium', 'storage', 'subway_station',
        'synagogue', 'taxi_stand', 'train_station', 'transit_station',
        'university', 'zoo', 'administrative_area_level_1',
        'administrative_area_level_2', 'administrative_area_level_3',
        'country', 'locality', 'postal_code', 'route', 'street_address',
        'sublocality', 'sublocality_level_1', 'premise', 'subpremise',
        'natural_feature', 'neighborhood', 'political'
      ];
      
      return !excludeTypes.includes(type);
    });

    return filtered.map(type => {
      // Clean up the type name for display
      return type
        .replace(/_restaurant$/, '')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    });
  }

  static formatRestaurantData(place, userLocation) {
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    
    const distance = LocationService.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      lat,
      lng
    );

    return {
      id: place.place_id,
      name: place.name,
      rating: place.rating || 0,
      distance: distance,
      formattedDistance: LocationService.formatDistance(distance),
      address: place.vicinity,
      priceLevel: place.price_level || 0,
      cuisineTypes: this.extractCuisineTypes(place.types),
      isOpen: place.opening_hours ? place.opening_hours.open_now : true,
      photoUrl: place.photos && place.photos.length > 0 
        ? place.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 })
        : null,
      location: {
        lat: lat,
        lng: lng
      }
    };
  }

  static getMockRestaurants(location) {
    const mockRestaurants = [
      {
        id: 'mock-1',
        name: 'Pizza Palace',
        rating: 4.5,
        distance: 800,
        formattedDistance: '800m',
        address: '123 Main St',
        priceLevel: 2,
        cuisineTypes: ['pizza', 'italian'],
        isOpen: true,
        photoUrl: null,
        location: { lat: location.latitude + 0.007, lng: location.longitude + 0.007 }
      },
      {
        id: 'mock-2',
        name: 'Sushi Zen',
        rating: 4.8,
        distance: 1200,
        formattedDistance: '1.2km',
        address: '456 Oak Ave',
        priceLevel: 3,
        cuisineTypes: ['sushi', 'japanese'],
        isOpen: true,
        photoUrl: null,
        location: { lat: location.latitude - 0.009, lng: location.longitude + 0.011 }
      },
      {
        id: 'mock-3',
        name: 'Burger Barn',
        rating: 4.2,
        distance: 600,
        formattedDistance: '600m',
        address: '789 Elm St',
        priceLevel: 1,
        cuisineTypes: ['burger', 'american'],
        isOpen: true,
        photoUrl: null,
        location: { lat: location.latitude + 0.005, lng: location.longitude - 0.008 }
      },
      {
        id: 'mock-4',
        name: 'Taco Fiesta',
        rating: 4.3,
        distance: 1500,
        formattedDistance: '1.5km',
        address: '321 Pine St',
        priceLevel: 2,
        cuisineTypes: ['mexican', 'tacos'],
        isOpen: true,
        photoUrl: null,
        location: { lat: location.latitude - 0.012, lng: location.longitude - 0.015 }
      },
      {
        id: 'mock-5',
        name: 'Pasta Corner',
        rating: 4.1,
        distance: 900,
        formattedDistance: '900m',
        address: '654 Maple Ave',
        priceLevel: 2,
        cuisineTypes: ['pasta', 'italian'],
        isOpen: false,
        photoUrl: null,
        location: { lat: location.latitude + 0.008, lng: location.longitude + 0.006 }
      },
      {
        id: 'mock-6',
        name: 'Golden Dragon',
        rating: 4.6,
        distance: 2000,
        formattedDistance: '2.0km',
        address: '987 Cedar St',
        priceLevel: 2,
        cuisineTypes: ['chinese', 'asian'],
        isOpen: true,
        photoUrl: null,
        location: { lat: location.latitude - 0.016, lng: location.longitude + 0.018 }
      },
      {
        id: 'mock-7',
        name: 'Healthy Bites',
        rating: 4.4,
        distance: 1100,
        formattedDistance: '1.1km',
        address: '159 Birch Rd',
        priceLevel: 3,
        cuisineTypes: ['healthy', 'salad'],
        isOpen: true,
        photoUrl: null,
        location: { lat: location.latitude + 0.009, lng: location.longitude - 0.012 }
      },
      {
        id: 'mock-8',
        name: 'BBQ Smokehouse',
        rating: 4.7,
        distance: 1800,
        formattedDistance: '1.8km',
        address: '753 Willow St',
        priceLevel: 3,
        cuisineTypes: ['bbq', 'american'],
        isOpen: true,
        photoUrl: null,
        location: { lat: location.latitude - 0.014, lng: location.longitude - 0.016 }
      }
    ];

    return mockRestaurants;
  }

  static getCuisineTypes(restaurants) {
    const cuisineSet = new Set();
    restaurants.forEach(restaurant => {
      restaurant.cuisineTypes.forEach(cuisine => cuisineSet.add(cuisine));
    });
    return Array.from(cuisineSet).sort();
  }
}

export default RestaurantService;
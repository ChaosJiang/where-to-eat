import LocationService from './LocationService';

class RestaurantService {
  static GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;


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
      'american': ['american_restaurant'],
      'chinese': ['chinese_restaurant'],
      'indian': ['indian_restaurant'],
      'italian': ['italian_restaurant'],
      'japanese': ['japanese_restaurant'],
      'korean': ['korean_restaurant'],
      'mexican': ['mexican_restaurant'],
      'thai': ['thai_restaurant'],
      'french': ['french_restaurant'],
      'greek': ['greek_restaurant'],
      'mediterranean': ['mediterranean_restaurant'],
      'middle eastern': ['middle_eastern_restaurant'],
      'vietnamese': ['vietnamese_restaurant'],
      'turkish': ['turkish_restaurant'],
      'seafood': ['seafood_restaurant'],
      'steak': ['steak_house'],
      'sushi': ['sushi_restaurant'],
      'pizza': ['pizza_restaurant'],
      'hamburger': ['hamburger_restaurant'],
      'fast food': ['fast_food_restaurant'],
      'bakery': ['bakery'],
      'cafe': ['cafe'],
      'bar': ['bar'],
      'food': ['restaurant']
    };

    if (!cuisineTypes || cuisineTypes.length === 0) {
      // If no specific cuisine types selected, search all food establishment types
      return ['restaurant', 'meal_delivery', 'meal_takeaway'];
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
    // Check if API key is available
    if (!this.GOOGLE_MAPS_API_KEY) {
      console.log('No Google Maps API key found, using mock data');
      return this.getMockRestaurants(location);
    }

    try {
      const googleMapsLanguage = this.getGoogleMapsLanguage(language);
      const searchTypes = this.mapCuisineTypesToGooglePlacesTypes(cuisineTypes);
      
      // Prepare request body for new Nearby Search API
      const requestBody = {
        includedTypes: searchTypes,
        locationRestriction: {
          circle: {
            center: {
              latitude: location.latitude,
              longitude: location.longitude
            },
            radius: radius
          }
        },
        languageCode: googleMapsLanguage,
        maxResultCount: 20,
        rankPreference: "DISTANCE"
      };

      // Make request to new Nearby Search API
      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.types,places.currentOpeningHours'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.places || data.places.length === 0) {
        console.log('No places found, using mock data');
        return this.getMockRestaurants(location);
      }

      // Format results for our app
      const formattedResults = data.places.map(place => this.formatNewApiRestaurantData(place, location));
      return formattedResults;
      
    } catch (error) {
      console.error('Error with new Places API:', error);
      return this.getMockRestaurants(location);
    }
  }

  static extractCuisineTypes(types) {
    // Define food/cuisine related types that should be included
    const foodTypes = [
      'cafe', 'meal_delivery', 'meal_takeaway', 'restaurant', 'food'
    ];
    
    // Define actual cuisine types we want to show
    const cuisineTypes = [
      'chinese_restaurant', 'indian_restaurant', 
      'italian_restaurant', 'japanese_restaurant', 'korean_restaurant',
      'mexican_restaurant', 'thai_restaurant', 'french_restaurant',
      'vietnamese_restaurant', 'turkish_restaurant',
      'seafood_restaurant', 'steak_house', 'sushi_restaurant',
      'fast_food_restaurant', 'family_restaurant',
    ];

    // Filter and format cuisine types
    const filtered = types.filter(type => {
      // Include specific cuisine types
      if (cuisineTypes.includes(type)) return true;
      
      // Include general food types but exclude non-food places
      if (foodTypes.includes(type)) return true;
      
      // Exclude common non-food establishment types and unwanted cuisine types
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
        'natural_feature', 'neighborhood', 'political',
        // Exclude unwanted cuisine/establishment types
        'bakery', 'bar', 'night_club', 'donut_shop', 'health'
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

  static formatNewApiRestaurantData(place, userLocation) {
    const lat = place.location.latitude;
    const lng = place.location.longitude;
    
    const distance = LocationService.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      lat,
      lng
    );

    return {
      id: place.id,
      name: place.displayName?.text || 'Unknown Restaurant',
      rating: place.rating || 0,
      distance: distance,
      formattedDistance: LocationService.formatDistance(distance),
      address: place.formattedAddress || '',
      priceLevel: place.priceLevel || 0,
      cuisineTypes: this.extractCuisineTypes(place.types || []),
      isOpen: place.currentOpeningHours ? place.currentOpeningHours.openNow : true,
      photoUrl: place.photos && place.photos.length > 0 
        ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxWidthPx=400&maxHeightPx=300&key=${this.GOOGLE_MAPS_API_KEY}`
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

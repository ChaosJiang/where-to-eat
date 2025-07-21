class LocationService {
  static async getCurrentLocation(t = null) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const message = t ? t('location.notSupported') : 'Geolocation is not supported by this browser';
        reject(new Error(message));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location';
          
          if (t) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = t('location.accessDenied');
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = t('location.unavailable');
                break;
              case error.TIMEOUT:
                errorMessage = t('location.timeout');
                break;
              default:
                errorMessage = t('location.unknownError');
                break;
            }
          } else {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied. Please enable location services.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out.';
                break;
              default:
                errorMessage = 'An unknown error occurred while retrieving location.';
                break;
            }
          }
          
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  static formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }
}

export default LocationService;
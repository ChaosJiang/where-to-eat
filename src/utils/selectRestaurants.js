const selectRestaurants = (restaurants, filters) => {
  return restaurants.filter(restaurant => {
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
};

export default selectRestaurants;

import selectRestaurants from './selectRestaurants';

const baseFilters = {
  minRating: 3.5,
  cuisineTypes: [],
  openNow: true,
  minPrice: 0,
  maxPrice: 100000
};

const makeRestaurant = (overrides = {}) => ({
  id: '1',
  name: 'Test Restaurant',
  rating: 4,
  isOpen: true,
  priceRange: null,
  ...overrides
});

describe('selectRestaurants', () => {
  it('returns an empty array when given an empty array', () => {
    expect(selectRestaurants([], baseFilters)).toEqual([]);
  });

  it('excludes restaurants below the minimum rating', () => {
    const restaurants = [makeRestaurant({ rating: 3 })];
    expect(selectRestaurants(restaurants, baseFilters)).toEqual([]);
  });

  it('excludes closed restaurants when openNow is true', () => {
    const restaurants = [makeRestaurant({ isOpen: false })];
    expect(selectRestaurants(restaurants, baseFilters)).toEqual([]);
  });

  it('includes closed restaurants when openNow is false', () => {
    const restaurants = [makeRestaurant({ isOpen: false })];
    const filters = { ...baseFilters, openNow: false };
    expect(selectRestaurants(restaurants, filters)).toEqual(restaurants);
  });

  it('includes a restaurant whose price range is contained within the filter range', () => {
    const restaurants = [makeRestaurant({ priceRange: { startPrice: 20, endPrice: 30 } })];
    const filters = { ...baseFilters, minPrice: 10, maxPrice: 50 };
    expect(selectRestaurants(restaurants, filters)).toEqual(restaurants);
  });

  it('excludes a restaurant whose price range is not contained within the filter range', () => {
    const restaurants = [makeRestaurant({ priceRange: { startPrice: 20, endPrice: 60 } })];
    const filters = { ...baseFilters, minPrice: 10, maxPrice: 50 };
    expect(selectRestaurants(restaurants, filters)).toEqual([]);
  });

  it('excludes a restaurant with no price data when a price filter is active', () => {
    const restaurants = [makeRestaurant({ priceRange: null })];
    const filters = { ...baseFilters, minPrice: 10, maxPrice: 50 };
    expect(selectRestaurants(restaurants, filters)).toEqual([]);
  });

  it('includes a restaurant with no price data when no price filter is active', () => {
    const restaurants = [makeRestaurant({ priceRange: null })];
    expect(selectRestaurants(restaurants, baseFilters)).toEqual(restaurants);
  });
});

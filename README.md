# Where to Eat - Prize Wheel Restaurant Finder

A fun and interactive web/mobile app that helps you decide where to eat by spinning a prize wheel filled with nearby restaurants.

## Features

- **Location-based Restaurant Search**: Uses your current location to find nearby restaurants
- **Interactive Prize Wheel**: Spin the wheel to randomly select a restaurant
- **Advanced Filtering**: Filter restaurants by:
  - Minimum rating (3★, 3.5★, 4★, 4.5★+)
  - Maximum distance (500m, 1km, 2km, 5km)
  - Cuisine types (Italian, Chinese, American, etc.)
  - Open now status
- **Sound Effects**: Engaging audio feedback for wheel interactions
- **Responsive Design**: Works on both desktop and mobile devices
- **Google Maps Integration**: Real restaurant data (with fallback to mock data)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd where-to-eat
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up Google Maps API:
   - Get a Google Maps API key with Places API enabled
   - Create a `.env` file in the root directory:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view the app

### Building for Production

```bash
npm run build
```

## Usage

1. **Allow Location Access**: When prompted, allow the app to access your location
2. **Apply Filters**: Use the filter panel to narrow down restaurant options
3. **Spin the Wheel**: Click the "SPIN" button to randomly select a restaurant
4. **View Results**: See the selected restaurant with details like rating, distance, and cuisine type

## Technical Details

### Technologies Used

- **React**: Frontend framework
- **CSS3**: Styling with animations and responsive design
- **Web Audio API**: Sound effects generation
- **Geolocation API**: Getting user's current location
- **Google Maps Places API**: Restaurant data (optional)

### Project Structure

```
src/
├── components/
│   ├── PrizeWheel.js        # Main wheel component
│   ├── PrizeWheel.css       # Wheel styling
│   ├── FilterPanel.js       # Filter controls
│   └── FilterPanel.css      # Filter styling
├── services/
│   ├── LocationService.js   # Location utilities
│   └── RestaurantService.js # Restaurant data handling
├── utils/
│   └── SoundManager.js      # Sound effects
├── App.js                   # Main application
├── App.css                  # Global styles
└── index.js                 # Application entry point
```

### Key Features Implementation

- **Prize Wheel Animation**: CSS transforms with cubic-bezier easing for smooth spinning
- **Responsive Segments**: Dynamic wheel segments that adapt to the number of restaurants
- **Sound Effects**: Procedurally generated audio using Web Audio API
- **Filter System**: Real-time filtering with multiple criteria
- **Mock Data**: Fallback system when Google Maps API is unavailable

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm install` - Install dependencies

## Architecture Overview

This is a React-based restaurant discovery app with a prize wheel interface. The app uses location services to find nearby restaurants and allows users to filter and randomly select dining options.

### Core Components Structure

- **PrizeWheel** (`src/components/PrizeWheel.js`) - Main interactive wheel component with spinning animation and restaurant selection
- **FilterPanel** (`src/components/FilterPanel.js`) - Restaurant filtering controls (rating, distance, cuisine, open status)
- **LanguageSelector** (`src/components/LanguageSelector.js`) - Multi-language support switcher

### Services Layer

- **RestaurantService** (`src/services/RestaurantService.js`) - Manages Google Places API integration with fallback to mock data
- **LocationService** (`src/services/LocationService.js`) - Handles geolocation and distance calculations

### Key Implementation Details

#### Google Maps Integration
- Uses `REACT_APP_GOOGLE_MAPS_API_KEY` environment variable
- Automatically falls back to mock data if API key is missing
- Uses new Nearby Search API (POST requests to places.googleapis.com/v1/places:searchNearby)
- Supports cuisine filtering through includedTypes parameter
- No longer requires Google Maps JavaScript SDK loading

#### Internationalization (i18n)
- Supports English, Japanese, and Chinese (simplified)
- Translation files in `src/locales/{lang}/translation.json`
- Language preference stored in localStorage
- Restaurant data adapts to selected language for Google API calls

#### State Management
- Uses React hooks for local state
- Main app state includes: location, restaurants, filteredRestaurants, filters, loading, error
- Real-time filtering without re-fetching data
- Language changes trigger restaurant data refresh

#### Audio System
- **SoundManager** (`src/utils/SoundManager.js`) - Procedural audio generation using Web Audio API
- Provides click, spin, and win sound effects

### Environment Configuration

Required environment variables:
- `REACT_APP_GOOGLE_MAPS_API_KEY` (optional) - Google Maps API key with Places API enabled

### Mock Data Fallback

The app includes comprehensive mock restaurant data when Google API is unavailable, ensuring functionality during development without API keys.

## Deployment

### AWS S3 + CloudFront Deployment

Automated deployment via GitHub Actions (`.github/workflows/deploy.yml`):

**Required GitHub Secrets:**
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- `S3_BUCKET_NAME`, `CLOUDFRONT_DISTRIBUTION_ID`
- `REACT_APP_GOOGLE_MAPS_API_KEY` (optional)

**Deployment Features:**
- Triggers on push to main branch
- Optimized caching (static assets: 1 year, HTML: immediate revalidation)
- Automatic CloudFront cache invalidation
- Clean deployments with old file removal

**Manual Deployment:**
```bash
npm run build
aws s3 sync build/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id your-dist-id --paths "/*"
```
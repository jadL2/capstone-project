# Moroccan Crop Management Platform

![Crop Management Platform](./assets/icon.png)

## About

This capstone project is a React Native application designed to help Moroccan farmers optimize crop management through intelligent analysis and monitoring tools. The platform provides crop recommendations based on soil and environmental data, empowering farmers to make informed decisions for sustainable agriculture.

## Repository Info

- **Owner**: jadL2
- **Repository**: capstone-project
- **Language**: TypeScript (100%)
- **Last Updated**: April 25, 2025

## Key Features

### 🌱 Smart Crop Management
- Track multiple crops with detailed information
- Record planting/harvesting dates and monitor growth stages
- Organize crops by fields and cultivation areas

### 🔬 AI-Powered Crop Prediction
- Input soil parameters (N, P, K, pH) and environmental factors
- Receive crop recommendations optimized for local conditions
- Plan crop rotation strategies using data-driven insights

### 📅 Farm Activity Planning
- Schedule watering, fertilizing, and harvesting activities
- Get reminders for upcoming agricultural tasks
- Track completion status of farm activities

### 🇲🇦 Morocco-Specific Features
- Customized for Moroccan agricultural regions (Meknes-Fes, Souss-Massa, Doukkala-Abda)
- Support for local crop varieties like Picholine Marocaine olives
- Climate-appropriate guidance for Mediterranean and arid farming zones

## Technology Stack

- **Frontend**: React Native with TypeScript
- **Navigation**: Expo Router
- **UI Components**: Custom components with Lucide React Native icons
- **State Management**: React Hooks (useState, useEffect)
- **Data Storage**: AsyncStorage for local persistence
- **Styling**: StyleSheet for consistent UI design

## Getting Started

### Prerequisites
- Node.js (v16 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jadL2/capstone-project.git
cd capstone-project

// Install dependencies

npm install

npx expo start

npm install @react-navigation/native expo-router lucide-react-native @react-native-async-storage/async-storage @react-native-picker/picker

Project Structure: 

capstone-project/
├── app/                   # Application screens and routes
│   ├── crop-management.tsx # Crop management screen
│   └── index.tsx          # Home screen
├── assets/                # Icons, images, and other assets
├── constants/             # App constants including Colors.ts
├── components/            # Reusable UI components
└── types/                 # TypeScript type definitions

Crop Prediction System
The application includes a crop recommendation system that analyzes soil parameters:

Nitrogen (N): Affects leaf growth and green vegetation
Phosphorus (P): Influences root development and flowering
Potassium (K): Strengthens immunity and water regulation
pH Level: Determines nutrient availability
Temperature: Affects growth rate and crop viability
Humidity: Impacts plant transpiration and disease susceptibility
Rainfall: Determines irrigation requirements
Based on these inputs, the system recommends suitable crops for Moroccan agricultural conditions.

Screenshots
Screenshots will be added as the UI development progresses

Future Enhancements
Weather data integration via API
User authentication and cloud data storage
Multi-language support (Arabic, French, English)
Offline functionality with data synchronization
IoT sensor integration for automated soil data collection
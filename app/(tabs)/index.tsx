import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Link } from 'expo-router';
import { ChevronRight, Cloud, Sun, Tractor, Scaling as Seedling, ChartBar as BarChart3, FileText, User, Droplets, Wind, CloudRain } from 'lucide-react-native';
import * as Location from 'expo-location';
import { Colors } from '@/constants/Colors';

type WeatherData = {
  temperature: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: Array<{
    day: string;
    temp: number;
    icon: typeof Sun | typeof Cloud | typeof CloudRain;
    description: string;
  }>;
};

// Your provided API key
const OPENWEATHER_API_KEY = '459c16d9a21b5319bf46ca0357c0babb';

export default function HomeScreen() {
  const [greeting, setGreeting] = useState(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  });

  const [weather, setWeather] = useState<WeatherData>({
    temperature: 24,
    condition: 'Loading...',
    location: 'Loading...',
    humidity: 0,
    windSpeed: 0,
    icon: '01d',
    forecast: [
      { day: 'Mon', temp: 26, icon: Sun, description: 'Sunny' },
      { day: 'Tue', temp: 28, icon: Sun, description: 'Sunny' },
      { day: 'Wed', temp: 24, icon: Cloud, description: 'Cloudy' },
    ],
  });

  // Function to determine which icon to display based on OpenWeather icon code
  const getWeatherIcon = (iconCode: string) => {
    const code = iconCode.substring(0, 2);
    switch (code) {
      case '01': // clear sky
        return Sun;
      case '02': // few clouds
      case '03': // scattered clouds
      case '04': // broken clouds
        return Cloud;
      case '09': // shower rain
      case '10': // rain
        return CloudRain;
      default:
        return Cloud;
    }
  };

  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      // Get current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }
      
      const weatherData = await weatherResponse.json();

      // Get city name using reverse geocoding
      const geocodingResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!geocodingResponse.ok) {
        throw new Error(`Geocoding API error: ${geocodingResponse.status}`);
      }
      
      const geocodingData = await geocodingResponse.json();
      const cityName = geocodingData[0]?.name || 'Unknown Location';

      // Get 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }
      
      const forecastData = await forecastResponse.json();

      // Process forecast data to get next 3 days at noon
      const processedForecast = forecastData.list
        .filter((item: any) => new Date(item.dt * 1000).getHours() === 12) // Get only noon forecasts
        .slice(0, 3)
        .map((item: any) => {
          const iconCode = item.weather[0].icon;
          return {
            day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            temp: Math.round(item.main.temp),
            icon: getWeatherIcon(iconCode),
            description: item.weather[0].description,
          };
        });

      // Update weather state with all the new data
      setWeather({
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].main,
        location: cityName,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        icon: weatherData.weather[0].icon,
        forecast: processedForecast,
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              await fetchWeatherData(latitude, longitude);
            },
            (error) => {
              console.log('Error getting location:', error);
              // Fallback to a default location in Morocco if permission denied
              fetchWeatherData(31.7917, -7.0926); // Morocco's approximate center
            }
          );
        }
      } else {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          // Fallback to a default location in Morocco if permission denied
          fetchWeatherData(31.7917, -7.0926); // Morocco's approximate center
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        await fetchWeatherData(location.coords.latitude, location.coords.longitude);
      }
    })();

    // Set up weather refresh interval (every 30 minutes)
    const refreshInterval = setInterval(() => {
      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              await fetchWeatherData(latitude, longitude);
            },
            (error) => {
              console.log('Error getting location:', error);
            }
          );
        }
      } else {
        (async () => {
          let location = await Location.getCurrentPositionAsync({});
          await fetchWeatherData(location.coords.latitude, location.coords.longitude);
        })();
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  // Determine which icon component to use based on the current weather
  const WeatherIcon = getWeatherIcon(weather.icon);

  // Format the last update time
  const lastUpdated = new Date().toLocaleString();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>Jad Laraki</Text>
          </View>
          <View style={styles.avatarPlaceholder}>
            <User size={24} color={Colors.textSecondary} />
          </View>
        </View>

        <View style={styles.weatherCard}>
          <View style={styles.weatherInfo}>
            <View style={styles.weatherMain}>
              <WeatherIcon size={32} color={Colors.text} />
              <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
            </View>
            <Text style={styles.weatherDesc}>{weather.condition}</Text>
            <Text style={styles.weatherLocation}>{weather.location}</Text>
            
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetailItem}>
                <Droplets size={16} color={Colors.textSecondary} />
                <Text style={styles.weatherDetailText}>{weather.humidity}% Humidity</Text>
              </View>
              <View style={styles.weatherDetailItem}>
                <Wind size={16} color={Colors.textSecondary} />
                <Text style={styles.weatherDetailText}>{weather.windSpeed} m/s</Text>
              </View>
            </View>
          </View>
          <View style={styles.weatherForecast}>
            {weather.forecast.map((day, index) => (
              <View key={index} style={styles.forecastItem}>
                <Text style={styles.forecastDay}>{day.day}</Text>
                <day.icon size={20} color={Colors.text} />
                <Text style={styles.forecastTemp}>{day.temp}°</Text>
                <Text style={styles.forecastDesc}>{day.description}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
        </View>

        <Text style={styles.sectionTitle}>Decision Support Tools</Text>

        <View style={styles.toolsGrid}>
          <Link href="/crop-management" asChild>
            <TouchableOpacity style={styles.toolCard}>
              <View style={[styles.toolIcon, { backgroundColor: Colors.primaryLight }]}>
                <Seedling size={24} color={Colors.primary} />
              </View>
              <Text style={styles.toolTitle}>Crop Management</Text>
              <Text style={styles.toolDescription}>Monitor and optimize crop lifecycle</Text>
              <ChevronRight size={20} color={Colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>
          </Link>

          <Link href="/equipment-management" asChild>
            <TouchableOpacity style={styles.toolCard}>
              <View style={[styles.toolIcon, { backgroundColor: Colors.secondaryLight }]}>
                <Tractor size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.toolTitle}>Equipment</Text>
              <Text style={styles.toolDescription}>Track & schedule maintenance</Text>
              <ChevronRight size={20} color={Colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>
          </Link>

          <Link href="/market-analysis" asChild>
            <TouchableOpacity style={styles.toolCard}>
              <View style={[styles.toolIcon, { backgroundColor: Colors.accentLight }]}>
                <BarChart3 size={24} color={Colors.accent} />
              </View>
              <Text style={styles.toolTitle}>Market Analysis</Text>
              <Text style={styles.toolDescription}>Track prices & market trends</Text>
              <ChevronRight size={20} color={Colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>
          </Link>

          <Link href="/business-plan" asChild>
            <TouchableOpacity style={styles.toolCard}>
              <View style={[styles.toolIcon, { backgroundColor: Colors.successLight }]}>
                <FileText size={24} color={Colors.success} />
              </View>
              <Text style={styles.toolTitle}>Business Plan</Text>
              <Text style={styles.toolDescription}>Create & manage plans</Text>
              <ChevronRight size={20} color={Colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>
          </Link>
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>

        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: Colors.primaryLight }]}>
              <Seedling size={20} color={Colors.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Corn field irrigation</Text>
              <Text style={styles.activityTime}>Today, 10:30 AM</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: Colors.secondaryLight }]}>
              <Tractor size={20} color={Colors.secondary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Tractor maintenance scheduled</Text>
              <Text style={styles.activityTime}>Yesterday, 3:15 PM</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: Colors.accentLight }]}>
              <BarChart3 size={20} color={Colors.accent} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Market price alert: Soybeans</Text>
              <Text style={styles.activityTime}>Jun 15, 9:45 AM</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  weatherInfo: {
    marginBottom: 16,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherTemp: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 12,
  },
  weatherDesc: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 4,
  },
  weatherLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  weatherDetails: {
    flexDirection: 'row',
    marginTop: 12,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  weatherDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  weatherForecast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  forecastItem: {
    alignItems: 'center',
    flex: 1,
  },
  forecastDay: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 6,
  },
  forecastDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: '100%',
  },
  lastUpdated: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 12,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  toolCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    margin: 8,
    width: '46%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  chevron: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  activityList: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { ChevronLeft, User, ChevronDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Updated types to match business plan
type Region = 'marrakech-safi' | 'casablanca-settat' | 'rabat-sale-kenitra' | 'fes-meknes' | 'souss-massa' | 'oriental' | 'draa-tafilalet' | 'tangier-tetouan-al-hoceima' | 'beni-mellal-khenifra' | 'guelmim-oued-noun' | 'laayoune-sakia-el-hamra' | 'dakhla-oued-ed-dahab';
type SoilType = 'clay' | 'sandy' | 'loamy' | 'chalky' | 'peaty';
type WaterSource = 'irrigation' | 'rainwater' | 'well' | 'river';

// Define the regions of Morocco with their characteristics
const MOROCCAN_REGIONS = [
  { value: 'marrakech-safi', label: 'Marrakech-Safi', color: '#e57373' },
  { value: 'casablanca-settat', label: 'Casablanca-Settat', color: '#64b5f6' },
  { value: 'rabat-sale-kenitra', label: 'Rabat-Salé-Kénitra', color: '#81c784' },
  { value: 'fes-meknes', label: 'Fès-Meknès', color: '#ffb74d' },
  { value: 'souss-massa', label: 'Souss-Massa', color: '#9575cd' },
  { value: 'oriental', label: 'Oriental', color: '#4db6ac' },
  { value: 'draa-tafilalet', label: 'Drâa-Tafilalet', color: '#dce775' },
  { value: 'tangier-tetouan-al-hoceima', label: 'Tanger-Tétouan-Al Hoceima', color: '#ff8a65' },
  { value: 'beni-mellal-khenifra', label: 'Béni Mellal-Khénifra', color: '#a1887f' },
  { value: 'guelmim-oued-noun', label: 'Guelmim-Oued Noun', color: '#90a4ae' },
  { value: 'laayoune-sakia-el-hamra', label: 'Laâyoune-Sakia El Hamra', color: '#f06292' },
  { value: 'dakhla-oued-ed-dahab', label: 'Dakhla-Oued Ed-Dahab', color: '#7986cb' },
];

const SOIL_TYPES = [
  { value: 'clay', label: 'Clay Soil', color: '#a1887f' },
  { value: 'sandy', label: 'Sandy Soil', color: '#ffb74d' },
  { value: 'loamy', label: 'Loamy Soil', color: '#81c784' },
  { value: 'chalky', label: 'Chalky Soil', color: '#90a4ae' },
  { value: 'peaty', label: 'Peaty Soil', color: '#7986cb' },
];

const WATER_TYPES = [
  { value: 'irrigation', label: 'Irrigation System', color: '#64b5f6' },
  { value: 'rainwater', label: 'Rainwater', color: '#81c784' },
  { value: 'well', label: 'Well Water', color: '#9575cd' },
  { value: 'river', label: 'River Water', color: '#4db6ac' },
];

export default function ProfileScreen() {
  const [selectedRegion, setSelectedRegion] = useState<Region | "">('fes-meknes');
  const [selectedSoilType, setSelectedSoilType] = useState<SoilType | "">('loamy');
  const [selectedWaterSource, setWaterSource] = useState<WaterSource | "">('irrigation');
  const [showPicker, setShowPicker] = useState('');

  // Load saved profile data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const profileData = await AsyncStorage.getItem('userProfile');
        if (profileData) {
          const parsedData = JSON.parse(profileData);
          if (parsedData.region) setSelectedRegion(parsedData.region);
          if (parsedData.soilType) setSelectedSoilType(parsedData.soilType);
          if (parsedData.waterType) setWaterSource(parsedData.waterType);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };
    
    loadProfileData();
  }, []);

  // Save profile data when it changes
  useEffect(() => {
    const saveProfileData = async () => {
      try {
        const profileData = {
          region: selectedRegion,
          soilType: selectedSoilType,
          waterType: selectedWaterSource
        };
        await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      } catch (error) {
        console.error('Error saving profile data:', error);
      }
    };
    
    // Only save if we have values
    if (selectedRegion && selectedSoilType && selectedWaterSource) {
      saveProfileData();
    }
  }, [selectedRegion, selectedSoilType, selectedWaterSource]);

  // Helper function to open the appropriate picker
  const openPicker = (pickerName) => {
    setShowPicker(showPicker === pickerName ? '' : pickerName);
  };

  // Navigate back to dashboard
  const navigateBack = () => {
    try {
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Navigation error:', error);
      router.push('/(tabs)');
    }
  };

  // Get the background color for a selected option
  const getOptionBackgroundColor = (optionType, value) => {
    if (!value) return null;
    
    switch (optionType) {
      case 'region':
        return MOROCCAN_REGIONS.find(r => r.value === value)?.color + '30'; // 30% opacity
      case 'soil':
        return SOIL_TYPES.find(s => s.value === value)?.color + '30';
      case 'water':
        return WATER_TYPES.find(w => w.value === value)?.color + '30';
      default:
        return null;
    }
  };

  // Get the text color for a selected option
  const getOptionTextColor = (optionType, value) => {
    if (!value) return styles.placeholderText.color;
    
    switch (optionType) {
      case 'region':
        return MOROCCAN_REGIONS.find(r => r.value === value)?.color;
      case 'soil':
        return SOIL_TYPES.find(s => s.value === value)?.color;
      case 'water':
        return WATER_TYPES.find(w => w.value === value)?.color;
      default:
        return Colors.text;
    }
  };

  const renderPickerItems = (items) => {
    return items.map((item) => (
      <Picker.Item 
        key={item.value} 
        label={item.label} 
        value={item.value}
        color={item.color || Colors.text}
      />
    ));
  };

  // Render picker based on platform
  const renderSelector = (type, value, setValue, options) => {
    const optionData = {
      region: { data: MOROCCAN_REGIONS, placeholder: 'Select Region' },
      soil: { data: SOIL_TYPES, placeholder: 'Select Soil Type' },
      water: { data: WATER_TYPES, placeholder: 'Select Water Source' }
    };
    
    const { data, placeholder } = optionData[type];
    const label = data.find(item => item.value === value)?.label || placeholder;
    const bgColor = getOptionBackgroundColor(type, value);
    const textColor = getOptionTextColor(type, value);
    
    // Handle the dropdown selection
    const handleChange = (newValue) => {
      setValue(newValue);
      setShowPicker('');
    };
    
    return (
      <>
        {/* Display current selected value */}
        <TouchableOpacity 
          style={{
            ...styles.selectButton, 
            ...(value ? {
              backgroundColor: bgColor,
              borderColor: textColor,
            } : {})
          }}
          onPress={() => openPicker(type)}
        >
          <Text style={{
            ...styles.selectButtonText, 
            ...(value ? {
              color: textColor,
              fontWeight: '600'
            } : styles.placeholderText)
          }}>
            {label}
          </Text>
          <ChevronDown size={20} color={value ? textColor : Colors.textSecondary} />
        </TouchableOpacity>
        
        {/* Show appropriate picker for platform when active */}
        {showPicker === type && (
          Platform.OS === 'web' ? (
            <select 
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              style={{
                ...styles.webSelect,
                ...(value ? {
                  backgroundColor: bgColor,
                  borderColor: textColor,
                  color: textColor,
                  fontWeight: '600'
                } : {})
              }}
              autoFocus
            >
              <option value="">{placeholder}</option>
              {data.map(item => (
                <option 
                  key={item.value} 
                  value={item.value} 
                  style={{color: item.color}}
                >
                  {item.label}
                </option>
              ))}
            </select>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={handleChange}
                style={styles.picker}
                dropdownIconColor={Colors.primary}
              >
                <Picker.Item label={placeholder} value="" color={Colors.textSecondary} />
                {renderPickerItems(data)}
              </Picker>
            </View>
          )
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={navigateBack}
        >
          <ChevronLeft size={24} color={Colors.primary} />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarPlaceholder}>
            <User size={40} color={Colors.textSecondary} />
          </View>
          <Text style={styles.profileName}>Jad Laraki</Text>
          <Text style={styles.profileDate}>Last Updated: {new Date().toLocaleDateString()}</Text>
        </View>

        {/* Region Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Region</Text>
          {renderSelector('region', selectedRegion, setSelectedRegion, MOROCCAN_REGIONS)}
        </View>

        {/* Soil Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soil Type</Text>
          {renderSelector('soil', selectedSoilType, setSelectedSoilType, SOIL_TYPES)}
        </View>

        {/* Water Source Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Water Source</Text>
          {renderSelector('water', selectedWaterSource, setWaterSource, WATER_TYPES)}
        </View>
        
        {/* Save button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => {
            // Already saving via useEffect, just show feedback
            Alert.alert('Success', 'Profile preferences saved successfully!');
          }}
        >
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        </TouchableOpacity>

        {/* Home button for backup navigation */}
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.homeButtonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8F5',
  },
  header: {
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  profileDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  pickerContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
  },
  webSelect: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginTop: 8,
    width: '100%',
    fontSize: 16,
    color: Colors.text,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 40,
  },
  homeButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
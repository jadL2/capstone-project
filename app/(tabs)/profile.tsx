import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { ChevronLeft, User, ChevronDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Picker } from '@react-native-picker/picker';

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
  const [selectedRegion, setSelectedRegion] = useState<Region | "">("");
  const [selectedSoilType, setSelectedSoilType] = useState<SoilType | "">("");
  const [selectedWaterSource, setWaterSource] = useState<WaterSource | "">("");
  const [showPicker, setShowPicker] = useState('');

  // Helper function to open the appropriate picker
  const openPicker = (pickerName) => {
    setShowPicker(showPicker === pickerName ? '' : pickerName);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Region</Text>
          <TouchableOpacity 
            style={[
              styles.selectButton, 
              selectedRegion ? {
                backgroundColor: getOptionBackgroundColor('region', selectedRegion),
                borderColor: getOptionTextColor('region', selectedRegion),
              } : null
            ]}
            onPress={() => openPicker('region')}
          >
            <Text style={[
              styles.selectButtonText, 
              selectedRegion ? {
                color: getOptionTextColor('region', selectedRegion),
                fontWeight: '600'
              } : styles.placeholderText
            ]}>
              {selectedRegion ? MOROCCAN_REGIONS.find(r => r.value === selectedRegion)?.label : 'Select Region'}
            </Text>
            <ChevronDown size={20} color={selectedRegion ? getOptionTextColor('region', selectedRegion) : Colors.textSecondary} />
          </TouchableOpacity>
          {showPicker === 'region' && Platform.OS !== 'web' && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedRegion}
                onValueChange={(itemValue) => {
                  setSelectedRegion(itemValue as Region);
                  setShowPicker('');
                }}
                style={styles.picker}
                dropdownIconColor={Colors.primary}
              >
                <Picker.Item label="Select Region" value="" color={Colors.textSecondary} />
                {renderPickerItems(MOROCCAN_REGIONS)}
              </Picker>
            </View>
          )}
          {Platform.OS === 'web' && showPicker === 'region' && (
            <select 
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value as Region);
                setShowPicker('');
              }}
              style={[styles.webSelect, selectedRegion ? {
                backgroundColor: getOptionBackgroundColor('region', selectedRegion),
                borderColor: getOptionTextColor('region', selectedRegion),
                color: getOptionTextColor('region', selectedRegion),
                fontWeight: '600'
              } : null]}
            >
              <option value="">Select Region</option>
              {MOROCCAN_REGIONS.map(item => (
                <option 
                  key={item.value} 
                  value={item.value} 
                  style={{color: item.color}}
                >
                  {item.label}
                </option>
              ))}
            </select>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soil Type</Text>
          <TouchableOpacity 
            style={[
              styles.selectButton, 
              selectedSoilType ? {
                backgroundColor: getOptionBackgroundColor('soil', selectedSoilType),
                borderColor: getOptionTextColor('soil', selectedSoilType),
              } : null
            ]}
            onPress={() => openPicker('soil')}
          >
            <Text style={[
              styles.selectButtonText, 
              selectedSoilType ? {
                color: getOptionTextColor('soil', selectedSoilType),
                fontWeight: '600'
              } : styles.placeholderText
            ]}>
              {selectedSoilType ? SOIL_TYPES.find(s => s.value === selectedSoilType)?.label : 'Select Soil Type'}
            </Text>
            <ChevronDown size={20} color={selectedSoilType ? getOptionTextColor('soil', selectedSoilType) : Colors.textSecondary} />
          </TouchableOpacity>
          {showPicker === 'soil' && Platform.OS !== 'web' && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedSoilType}
                onValueChange={(itemValue) => {
                  setSelectedSoilType(itemValue as SoilType);
                  setShowPicker('');
                }}
                style={styles.picker}
                dropdownIconColor={Colors.primary}
              >
                <Picker.Item label="Select Soil Type" value="" color={Colors.textSecondary} />
                {renderPickerItems(SOIL_TYPES)}
              </Picker>
            </View>
          )}
          {Platform.OS === 'web' && showPicker === 'soil' && (
            <select 
              value={selectedSoilType}
              onChange={(e) => {
                setSelectedSoilType(e.target.value as SoilType);
                setShowPicker('');
              }}
              style={[styles.webSelect, selectedSoilType ? {
                backgroundColor: getOptionBackgroundColor('soil', selectedSoilType),
                borderColor: getOptionTextColor('soil', selectedSoilType),
                color: getOptionTextColor('soil', selectedSoilType),
                fontWeight: '600'
              } : null]}
            >
              <option value="">Select Soil Type</option>
              {SOIL_TYPES.map(item => (
                <option 
                  key={item.value} 
                  value={item.value}
                  style={{color: item.color}}
                >
                  {item.label}
                </option>
              ))}
            </select>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Water Source</Text>
          <TouchableOpacity 
            style={[
              styles.selectButton, 
              selectedWaterSource ? {
                backgroundColor: getOptionBackgroundColor('water', selectedWaterSource),
                borderColor: getOptionTextColor('water', selectedWaterSource),
              } : null
            ]}
            onPress={() => openPicker('water')}
          >
            <Text style={[
              styles.selectButtonText, 
              selectedWaterSource ? {
                color: getOptionTextColor('water', selectedWaterSource),
                fontWeight: '600'
              } : styles.placeholderText
            ]}>
              {selectedWaterSource ? WATER_TYPES.find(w => w.value === selectedWaterSource)?.label : 'Select Water Source'}
            </Text>
            <ChevronDown size={20} color={selectedWaterSource ? getOptionTextColor('water', selectedWaterSource) : Colors.textSecondary} />
          </TouchableOpacity>
          {showPicker === 'water' && Platform.OS !== 'web' && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedWaterSource}
                onValueChange={(itemValue) => {
                  setWaterSource(itemValue as WaterSource);
                  setShowPicker('');
                }}
                style={styles.picker}
                dropdownIconColor={Colors.primary}
              >
                <Picker.Item label="Select Water Source" value="" color={Colors.textSecondary} />
                {renderPickerItems(WATER_TYPES)}
              </Picker>
            </View>
          )}
          {Platform.OS === 'web' && showPicker === 'water' && (
            <select 
              value={selectedWaterSource}
              onChange={(e) => {
                setWaterSource(e.target.value as WaterSource);
                setShowPicker('');
              }}
              style={[styles.webSelect, selectedWaterSource ? {
                backgroundColor: getOptionBackgroundColor('water', selectedWaterSource),
                borderColor: getOptionTextColor('water', selectedWaterSource),
                color: getOptionTextColor('water', selectedWaterSource),
                fontWeight: '600'
              } : null]}
            >
              <option value="">Select Water Source</option>
              {WATER_TYPES.map(item => (
                <option 
                  key={item.value} 
                  value={item.value}
                  style={{color: item.color}}
                >
                  {item.label}
                </option>
              ))}
            </select>
          )}
        </View>
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
    paddingTop: 60,
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
});
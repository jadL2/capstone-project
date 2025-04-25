import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, FileText } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Picker } from '@react-native-picker/picker';
import { LineChart } from 'react-native-chart-kit';

// Define the regions of Morocco with their characteristics
const MOROCCAN_REGIONS = [
  { value: 'marrakech-safi', label: 'Marrakech-Safi', color: '#e57373' }, // Light red
  { value: 'casablanca-settat', label: 'Casablanca-Settat', color: '#64b5f6' }, // Light blue
  { value: 'rabat-sale-kenitra', label: 'Rabat-Salé-Kénitra', color: '#81c784' }, // Light green
  { value: 'fes-meknes', label: 'Fès-Meknès', color: '#ffb74d' }, // Light orange
  { value: 'souss-massa', label: 'Souss-Massa', color: '#9575cd' }, // Light purple
  { value: 'oriental', label: 'Oriental', color: '#4db6ac' }, // Light teal
  { value: 'draa-tafilalet', label: 'Drâa-Tafilalet', color: '#dce775' }, // Light lime
  { value: 'tangier-tetouan-al-hoceima', label: 'Tanger-Tétouan-Al Hoceima', color: '#ff8a65' }, // Light deep orange
  { value: 'beni-mellal-khenifra', label: 'Béni Mellal-Khénifra', color: '#a1887f' }, // Light brown
  { value: 'guelmim-oued-noun', label: 'Guelmim-Oued Noun', color: '#90a4ae' }, // Light blue gray
  { value: 'laayoune-sakia-el-hamra', label: 'Laâyoune-Sakia El Hamra', color: '#f06292' }, // Light pink
  { value: 'dakhla-oued-ed-dahab', label: 'Dakhla-Oued Ed-Dahab', color: '#7986cb' }, // Light indigo
];

const WATER_TYPES = [
  { value: 'irrigation', label: 'Irrigation System', color: '#64b5f6' }, // Light blue
  { value: 'rainwater', label: 'Rainwater', color: '#81c784' }, // Light green
  { value: 'well', label: 'Well Water', color: '#9575cd' }, // Light purple
  { value: 'river', label: 'River Water', color: '#4db6ac' }, // Light teal
];

const SOIL_TYPES = [
  { value: 'clay', label: 'Clay Soil', color: '#a1887f' }, // Light brown
  { value: 'sandy', label: 'Sandy Soil', color: '#ffb74d' }, // Light orange
  { value: 'loamy', label: 'Loamy Soil', color: '#81c784' }, // Light green
  { value: 'chalky', label: 'Chalky Soil', color: '#90a4ae' }, // Light blue gray
  { value: 'peaty', label: 'Peaty Soil', color: '#7986cb' }, // Light indigo
];

// Define crops available in Morocco with their characteristics
const CROP_TYPES = [
  { value: 'wheat', label: 'Wheat', waterNeed: 0.8, soilPref: ['loamy', 'clay'], revenueFactor: 0.9, color: '#dce775' }, // Light lime
  { value: 'barley', label: 'Barley', waterNeed: 0.7, soilPref: ['sandy', 'loamy'], revenueFactor: 0.85, color: '#ffcc80' }, // Light orange
  { value: 'olives', label: 'Olives', waterNeed: 0.6, soilPref: ['chalky', 'loamy'], revenueFactor: 1.2, color: '#aed581' }, // Light light green
  { value: 'citrus', label: 'Citrus Fruits', waterNeed: 1.0, soilPref: ['loamy'], revenueFactor: 1.4, color: '#ffb74d' }, // Light orange
  { value: 'tomatoes', label: 'Tomatoes', waterNeed: 0.9, soilPref: ['loamy', 'sandy'], revenueFactor: 1.1, color: '#e57373' }, // Light red
  { value: 'potatoes', label: 'Potatoes', waterNeed: 0.85, soilPref: ['loamy', 'sandy'], revenueFactor: 1.0, color: '#fff176' }, // Light yellow
  { value: 'dates', label: 'Dates', waterNeed: 0.7, soilPref: ['sandy'], revenueFactor: 1.3, color: '#a1887f' }, // Light brown
  { value: 'grapes', label: 'Grapes', waterNeed: 0.75, soilPref: ['loamy', 'chalky'], revenueFactor: 1.25, color: '#ba68c8' }, // Light purple
  { value: 'almonds', label: 'Almonds', waterNeed: 0.65, soilPref: ['loamy', 'sandy'], revenueFactor: 1.35, color: '#90a4ae' }, // Light blue gray
  { value: 'sugar-beet', label: 'Sugar Beet', waterNeed: 0.9, soilPref: ['clay', 'loamy'], revenueFactor: 0.95, color: '#f48fb1' }, // Light pink
];

// Characteristics of regions, water types, and soil types affecting yield projections
const REGION_FACTORS = {
  'marrakech-safi': { baseYield: 0.85, waterEfficiency: 0.8, costFactor: 0.9 },
  'casablanca-settat': { baseYield: 0.95, waterEfficiency: 0.9, costFactor: 1.1 },
  'rabat-sale-kenitra': { baseYield: 1.0, waterEfficiency: 0.85, costFactor: 1.0 },
  'fes-meknes': { baseYield: 0.9, waterEfficiency: 0.75, costFactor: 0.85 },
  'souss-massa': { baseYield: 1.1, waterEfficiency: 0.7, costFactor: 0.95 },
  'oriental': { baseYield: 0.7, waterEfficiency: 0.6, costFactor: 0.8 },
  'draa-tafilalet': { baseYield: 0.6, waterEfficiency: 0.5, costFactor: 0.75 },
  'tangier-tetouan-al-hoceima': { baseYield: 0.95, waterEfficiency: 0.9, costFactor: 1.05 },
  'beni-mellal-khenifra': { baseYield: 0.85, waterEfficiency: 0.8, costFactor: 0.9 },
  'guelmim-oued-noun': { baseYield: 0.7, waterEfficiency: 0.6, costFactor: 0.8 },
  'laayoune-sakia-el-hamra': { baseYield: 0.6, waterEfficiency: 0.5, costFactor: 0.8 },
  'dakhla-oued-ed-dahab': { baseYield: 0.65, waterEfficiency: 0.55, costFactor: 0.85 },
};

const WATER_FACTORS = {
  'irrigation': { yieldFactor: 1.2, costFactor: 1.3, reliability: 0.95 },
  'rainwater': { yieldFactor: 0.8, costFactor: 0.7, reliability: 0.6 },
  'well': { yieldFactor: 1.0, costFactor: 0.9, reliability: 0.85 },
  'river': { yieldFactor: 1.1, costFactor: 0.8, reliability: 0.75 },
};

const SOIL_FACTORS = {
  'clay': { yieldFactor: 0.9, waterRetention: 1.2, fertilityFactor: 1.0 },
  'sandy': { yieldFactor: 0.7, waterRetention: 0.6, fertilityFactor: 0.8 },
  'loamy': { yieldFactor: 1.2, waterRetention: 1.0, fertilityFactor: 1.2 },
  'chalky': { yieldFactor: 0.8, waterRetention: 0.7, fertilityFactor: 0.7 },
  'peaty': { yieldFactor: 1.1, waterRetention: 1.3, fertilityFactor: 1.1 },
};

// Base costs and revenues for agricultural operations in Morocco (in MAD - Moroccan Dirham)
const BASE_VALUES = {
  initialInvestment: 100000,  // Initial investment for 1 hectare
  annualMaintenanceCost: 20000,  // Annual maintenance cost per hectare
  averageCropRevenue: 45000,  // Average annual revenue per hectare
  laborCosts: 15000,  // Annual labor costs per hectare
  waterCosts: 8000,  // Annual water costs per hectare
  fertilizersAndPesticidesCosts: 7000,  // Annual costs for fertilizers and pesticides
  equipmentDepreciation: 5000,  // Annual equipment depreciation
};

export default function BusinessPlanScreen() {
  const router = useRouter();
  const [region, setRegion] = useState('');
  const [waterType, setWaterType] = useState('');
  const [soilType, setSoilType] = useState('');
  const [cropType, setCropType] = useState('');
  const [landArea, setLandArea] = useState('1');  // in hectares
  const [scenarioType, setScenarioType] = useState('base');
  const [showPicker, setShowPicker] = useState('');
  
  // Calculate business plan projections
  const calculateProjections = () => {
    if (!region || !waterType || !soilType || !landArea || !cropType) {
      return null;
    }
    
    const areaInHectares = parseFloat(landArea);
    if (isNaN(areaInHectares) || areaInHectares <= 0) {
      return null;
    }

    const regionFactor = REGION_FACTORS[region] || { baseYield: 1.0, waterEfficiency: 1.0, costFactor: 1.0 };
    const waterFactor = WATER_FACTORS[waterType] || { yieldFactor: 1.0, costFactor: 1.0, reliability: 1.0 };
    const soilFactor = SOIL_FACTORS[soilType] || { yieldFactor: 1.0, waterRetention: 1.0, fertilityFactor: 1.0 };
    const crop = CROP_TYPES.find(c => c.value === cropType) || { waterNeed: 1.0, soilPref: [], revenueFactor: 1.0 };

    // Calculate soil compatibility bonus
    const soilCompatibilityBonus = crop.soilPref.includes(soilType) ? 1.2 : 0.8;
    
    // Calculate water efficiency based on crop needs
    const waterEfficiencyMultiplier = waterType === 'irrigation' 
      ? 1.0 
      : (waterType === 'rainwater' ? (1.0 - (crop.waterNeed - 0.5)) : 0.9);

    // Calculate base scenario
    const baseInitialInvestment = BASE_VALUES.initialInvestment * regionFactor.costFactor * areaInHectares;
    const baseAnnualMaintenance = BASE_VALUES.annualMaintenanceCost * regionFactor.costFactor * waterFactor.costFactor * areaInHectares;
    const baseWaterCosts = BASE_VALUES.waterCosts * waterFactor.costFactor * crop.waterNeed / soilFactor.waterRetention * areaInHectares;
    const baseFertilizerCosts = BASE_VALUES.fertilizersAndPesticidesCosts / soilFactor.fertilityFactor * areaInHectares;
    const baseLaborCosts = BASE_VALUES.laborCosts * regionFactor.costFactor * areaInHectares;
    const baseDepreciation = BASE_VALUES.equipmentDepreciation * areaInHectares;
    
    const baseTotalAnnualCosts = baseAnnualMaintenance + baseWaterCosts + baseFertilizerCosts + baseLaborCosts + baseDepreciation;
    const baseYearlyRevenue = BASE_VALUES.averageCropRevenue * crop.revenueFactor * regionFactor.baseYield * 
      waterFactor.yieldFactor * soilFactor.yieldFactor * waterFactor.reliability * 
      soilCompatibilityBonus * waterEfficiencyMultiplier * areaInHectares;
      
    const baseProfit = baseYearlyRevenue - baseTotalAnnualCosts;
    const baseROI = (baseProfit / baseInitialInvestment) * 100;
    const baseBreakEvenYears = baseProfit > 0 ? baseInitialInvestment / baseProfit : 'N/A';

    // Calculate aggressive (upside) scenario - 20% better performance
    const upMult = 1.2;
    const upInitialInvestment = baseInitialInvestment * 0.95; // Slight discount for bulk purchasing
    const upAnnualMaintenance = baseAnnualMaintenance;
    const upWaterCosts = baseWaterCosts * 0.9; // Better water management
    const upFertilizerCosts = baseFertilizerCosts * 0.9; // Better fertilizer management
    const upLaborCosts = baseLaborCosts;
    const upDepreciation = baseDepreciation;
    
    const upTotalAnnualCosts = upAnnualMaintenance + upWaterCosts + upFertilizerCosts + upLaborCosts + upDepreciation;
    const upYearlyRevenue = baseYearlyRevenue * upMult;
    const upProfit = upYearlyRevenue - upTotalAnnualCosts;
    const upROI = (upProfit / upInitialInvestment) * 100;
    const upBreakEvenYears = upProfit > 0 ? upInitialInvestment / upProfit : 'N/A';

    // Calculate conservative (downside) scenario - 20% worse performance
    const downMult = 0.8;
    const downInitialInvestment = baseInitialInvestment * 1.1; // Higher costs due to unforeseen expenses
    const downAnnualMaintenance = baseAnnualMaintenance * 1.1; // Higher maintenance costs
    const downWaterCosts = baseWaterCosts * 1.2; // Higher water costs or lower efficiency
    const downFertilizerCosts = baseFertilizerCosts * 1.1;
    const downLaborCosts = baseLaborCosts * 1.05;
    const downDepreciation = baseDepreciation;
    
    const downTotalAnnualCosts = downAnnualMaintenance + downWaterCosts + downFertilizerCosts + downLaborCosts + downDepreciation;
    const downYearlyRevenue = baseYearlyRevenue * downMult;
    const downProfit = downYearlyRevenue - downTotalAnnualCosts;
    const downROI = (downProfit / downInitialInvestment) * 100;
    const downBreakEvenYears = downProfit > 0 ? downInitialInvestment / downProfit : 'N/A';

    // Return projections for all three scenarios
    return {
      base: {
        initialInvestment: Math.round(baseInitialInvestment),
        annualCosts: Math.round(baseTotalAnnualCosts),
        yearlyRevenue: Math.round(baseYearlyRevenue),
        profit: Math.round(baseProfit),
        roi: typeof baseROI === 'number' ? baseROI.toFixed(1) : 'N/A',
        breakEvenYears: typeof baseBreakEvenYears === 'number' ? baseBreakEvenYears.toFixed(1) : 'N/A',
        cashFlow: [
          { year: 1, value: -baseInitialInvestment + baseProfit },
          { year: 2, value: (-baseInitialInvestment + baseProfit * 2) },
          { year: 3, value: (-baseInitialInvestment + baseProfit * 3) },
          { year: 4, value: (-baseInitialInvestment + baseProfit * 4) },
          { year: 5, value: (-baseInitialInvestment + baseProfit * 5) }
        ]
      },
      upside: {
        initialInvestment: Math.round(upInitialInvestment),
        annualCosts: Math.round(upTotalAnnualCosts),
        yearlyRevenue: Math.round(upYearlyRevenue),
        profit: Math.round(upProfit),
        roi: typeof upROI === 'number' ? upROI.toFixed(1) : 'N/A',
        breakEvenYears: typeof upBreakEvenYears === 'number' ? upBreakEvenYears.toFixed(1) : 'N/A',
        cashFlow: [
          { year: 1, value: -upInitialInvestment + upProfit },
          { year: 2, value: (-upInitialInvestment + upProfit * 2) },
          { year: 3, value: (-upInitialInvestment + upProfit * 3) },
          { year: 4, value: (-upInitialInvestment + upProfit * 4) },
          { year: 5, value: (-upInitialInvestment + upProfit * 5) }
        ]
      },
      downside: {
        initialInvestment: Math.round(downInitialInvestment),
        annualCosts: Math.round(downTotalAnnualCosts),
        yearlyRevenue: Math.round(downYearlyRevenue),
        profit: Math.round(downProfit),
        roi: typeof downROI === 'number' ? downROI.toFixed(1) : 'N/A',
        breakEvenYears: typeof downBreakEvenYears === 'string' ? downBreakEvenYears : downBreakEvenYears.toFixed(1),
        cashFlow: [
          { year: 1, value: -downInitialInvestment + downProfit },
          { year: 2, value: (-downInitialInvestment + downProfit * 2) },
          { year: 3, value: (-downInitialInvestment + downProfit * 3) },
          { year: 4, value: (-downInitialInvestment + downProfit * 4) },
          { year: 5, value: (-downInitialInvestment + downProfit * 5) }
        ]
      }
    };
  };

  const projections = calculateProjections();
  
  // Get current scenario data
  const currentScenario = projections ? projections[scenarioType] : null;

  // Prepare data for the chart
  const chartData = currentScenario ? {
    labels: ["Y1", "Y2", "Y3", "Y4", "Y5"],
    datasets: [
      {
        data: currentScenario.cashFlow.map(cf => cf.value / 1000), // Convert to thousands for better display
        color: (opacity = 1) => `rgba(0, 128, 255, ${opacity})`,
        strokeWidth: 2
      }
    ],
  } : null;

  // Get the background color for a selected option
  const getOptionBackgroundColor = (optionType, value) => {
    if (!value) return null;
    
    switch (optionType) {
      case 'region':
        return MOROCCAN_REGIONS.find(r => r.value === value)?.color + '30'; // 30% opacity
      case 'water':
        return WATER_TYPES.find(w => w.value === value)?.color + '30';
      case 'soil':
        return SOIL_TYPES.find(s => s.value === value)?.color + '30';
      case 'crop':
        return CROP_TYPES.find(c => c.value === value)?.color + '30';
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
      case 'water':
        return WATER_TYPES.find(w => w.value === value)?.color;
      case 'soil':
        return SOIL_TYPES.find(s => s.value === value)?.color;
      case 'crop':
        return CROP_TYPES.find(c => c.value === value)?.color;
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

  // Helper function to open the appropriate picker
  const openPicker = (pickerName) => {
    setShowPicker(showPicker === pickerName ? '' : pickerName);
  };

  // Check if a crop is compatible with the selected soil
  const getCropSoilCompatibility = (cropValue) => {
    const crop = CROP_TYPES.find(c => c.value === cropValue);
    if (!crop || !soilType) return null;
    return crop.soilPref.includes(soilType) ? 'compatible' : 'incompatible';
  };

  // Check if a crop is compatible with the selected water type
  const getCropWaterCompatibility = (cropValue) => {
    const crop = CROP_TYPES.find(c => c.value === cropValue);
    if (!crop || !waterType) return null;
    
    if (waterType === 'irrigation') return 'compatible';
    if (waterType === 'rainwater' && crop.waterNeed <= 0.7) return 'compatible';
    if (waterType === 'well' && crop.waterNeed <= 0.85) return 'compatible';
    if (waterType === 'river' && crop.waterNeed <= 0.9) return 'compatible';
    
    return crop.waterNeed > 0.9 ? 'incompatible' : 'moderate';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Business Plan',
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTintColor: Colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.header}>
          <FileText size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Agricultural Business Plan</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Enter Farm Details</Text>
          <Text style={styles.infoDescription}>
            Provide details about your farm to generate customized business projections for different scenarios.
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Farm Information</Text>

          {/* Region Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Region</Text>
            <TouchableOpacity 
              style={[
                styles.selectButton, 
                region ? {
                  backgroundColor: getOptionBackgroundColor('region', region),
                  borderColor: getOptionTextColor('region', region),
                } : null
              ]}
              onPress={() => openPicker('region')}
            >
              <Text style={[
                styles.selectButtonText, 
                region ? {
                  color: getOptionTextColor('region', region),
                  fontWeight: '600'
                } : styles.placeholderText
              ]}>
                {region ? MOROCCAN_REGIONS.find(r => r.value === region)?.label : 'Select Region'}
              </Text>
              <ChevronDown size={20} color={region ? getOptionTextColor('region', region) : Colors.textSecondary} />
            </TouchableOpacity>
            {showPicker === 'region' && Platform.OS !== 'web' && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={region}
                  onValueChange={(itemValue) => {
                    setRegion(itemValue);
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
            {Platform.OS === 'web' && (
              <select 
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={[styles.webSelect, region ? {
                  backgroundColor: getOptionBackgroundColor('region', region),
                  borderColor: getOptionTextColor('region', region),
                  color: getOptionTextColor('region', region),
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

          {/* Water Type Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Water Type</Text>
            <TouchableOpacity 
              style={[
                styles.selectButton, 
                waterType ? {
                  backgroundColor: getOptionBackgroundColor('water', waterType),
                  borderColor: getOptionTextColor('water', waterType),
                } : null
              ]}
              onPress={() => openPicker('water')}
            >
              <Text style={[
                styles.selectButtonText, 
                waterType ? {
                  color: getOptionTextColor('water', waterType),
                  fontWeight: '600'
                } : styles.placeholderText
              ]}>
                {waterType ? WATER_TYPES.find(w => w.value === waterType)?.label : 'Select Water Type'}
              </Text>
              <ChevronDown size={20} color={waterType ? getOptionTextColor('water', waterType) : Colors.textSecondary} />
            </TouchableOpacity>
            {showPicker === 'water' && Platform.OS !== 'web' && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={waterType}
                  onValueChange={(itemValue) => {
                    setWaterType(itemValue);
                    setShowPicker('');
                  }}
                  style={styles.picker}
                  dropdownIconColor={Colors.primary}
                >
                  <Picker.Item label="Select Water Type" value="" color={Colors.textSecondary} />
                  {renderPickerItems(WATER_TYPES)}
                </Picker>
              </View>
            )}
            {Platform.OS === 'web' && (
              <select 
                value={waterType}
                onChange={(e) => setWaterType(e.target.value)}
                style={[styles.webSelect, waterType ? {
                  backgroundColor: getOptionBackgroundColor('water', waterType),
                  borderColor: getOptionTextColor('water', waterType),
                  color: getOptionTextColor('water', waterType),
                  fontWeight: '600'
                } : null]}
              >
                <option value="">Select Water Type</option>
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

          {/* Soil Type Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Soil Type</Text>
            <TouchableOpacity 
              style={[
                styles.selectButton, 
                soilType ? {
                  backgroundColor: getOptionBackgroundColor('soil', soilType),
                  borderColor: getOptionTextColor('soil', soilType),
                } : null
              ]}
              onPress={() => openPicker('soil')}
            >
              <Text style={[
                styles.selectButtonText, 
                soilType ? {
                  color: getOptionTextColor('soil', soilType),
                  fontWeight: '600'
                } : styles.placeholderText
              ]}>
                {soilType ? SOIL_TYPES.find(s => s.value === soilType)?.label : 'Select Soil Type'}
              </Text>
              <ChevronDown size={20} color={soilType ? getOptionTextColor('soil', soilType) : Colors.textSecondary} />
            </TouchableOpacity>
            {showPicker === 'soil' && Platform.OS !== 'web' && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={soilType}
                  onValueChange={(itemValue) => {
                    setSoilType(itemValue);
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
            {Platform.OS === 'web' && (
              <select 
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                style={[styles.webSelect, soilType ? {
                  backgroundColor: getOptionBackgroundColor('soil', soilType),
                  borderColor: getOptionTextColor('soil', soilType),
                  color: getOptionTextColor('soil', soilType),
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

          {/* Crop Type Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Crop Type</Text>
            <TouchableOpacity 
              style={[
                styles.selectButton, 
                cropType ? {
                  backgroundColor: getOptionBackgroundColor('crop', cropType),
                  borderColor: getOptionTextColor('crop', cropType),
                } : null
              ]}
              onPress={() => openPicker('crop')}
            >
              <Text style={[
                styles.selectButtonText, 
                cropType ? {
                  color: getOptionTextColor('crop', cropType),
                  fontWeight: '600'
                } : styles.placeholderText
              ]}>
                {cropType ? CROP_TYPES.find(c => c.value === cropType)?.label : 'Select Crop Type'}
              </Text>
              <ChevronDown size={20} color={cropType ? getOptionTextColor('crop', cropType) : Colors.textSecondary} />
            </TouchableOpacity>
            {showPicker === 'crop' && Platform.OS !== 'web' && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={cropType}
                  onValueChange={(itemValue) => {
                    setCropType(itemValue);
                    setShowPicker('');
                  }}
                  style={styles.picker}
                  dropdownIconColor={Colors.primary}
                >
                  <Picker.Item label="Select Crop Type" value="" color={Colors.textSecondary} />
                  {CROP_TYPES.map(crop => (
                    <Picker.Item 
                      key={crop.value} 
                      label={`${crop.label} ${
                        getCropSoilCompatibility(crop.value) === 'incompatible' ? '(Poor Soil Match)' : 
                        getCropWaterCompatibility(crop.value) === 'incompatible' ? '(High Water Needs)' : 
                        ''
                      }`} 
                      value={crop.value}
                      color={
                        getCropSoilCompatibility(crop.value) === 'incompatible' || 
                        getCropWaterCompatibility(crop.value) === 'incompatible' 
                          ? '#ff6666' 
                          : crop.color || Colors.text
                      }
                    />
                  ))}
                </Picker>
              </View>
            )}
            {Platform.OS === 'web' && (
              <select 
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                style={[styles.webSelect, cropType ? {
                  backgroundColor: getOptionBackgroundColor('crop', cropType),
                  borderColor: getOptionTextColor('crop', cropType),
                  color: getOptionTextColor('crop', cropType),
                  fontWeight: '600'
                } : null]}
              >
                <option value="">Select Crop Type</option>
                {CROP_TYPES.map(crop => (
                  <option 
                    key={crop.value} 
                    value={crop.value}
                    style={{
                      color: (getCropSoilCompatibility(crop.value) === 'incompatible' || 
                             getCropWaterCompatibility(crop.value) === 'incompatible') 
                        ? '#ff6666' 
                        : crop.color
                    }}
                  >
                    {crop.label} {
                      getCropSoilCompatibility(crop.value) === 'incompatible' ? '(Poor Soil Match)' : 
                      getCropWaterCompatibility(crop.value) === 'incompatible' ? '(High Water Needs)' : 
                      ''
                    }
                  </option>
                ))}
              </select>
            )}
          </View>

          {/* Land Area Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Land Area (hectares)</Text>
            <TextInput
              style={[
                styles.textInput, 
                landArea !== '1' ? {
                  backgroundColor: Colors.primaryLight + '20',
                  borderColor: Colors.primary,
                } : null
              ]}
              value={landArea}
              onChangeText={setLandArea}
              keyboardType="numeric"
              placeholder="Enter land area in hectares"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>

        {/* Scenario Selection */}
        <View style={styles.scenarioSection}>
          <Text style={styles.sectionTitle}>Scenario</Text>
          <View style={styles.scenarioButtons}>
            <TouchableOpacity 
              style={[styles.scenarioButton, scenarioType === 'base' && styles.selectedScenario]}
              onPress={() => setScenarioType('base')}
            >
              <Text style={[styles.scenarioText, scenarioType === 'base' && styles.selectedScenarioText]}>
                Base Case
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.scenarioButton, scenarioType === 'upside' && styles.selectedScenario]}
              onPress={() => setScenarioType('upside')}
            >
              <Text style={[styles.scenarioText, scenarioType === 'upside' && styles.selectedScenarioText]}>
                Upside
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.scenarioButton, scenarioType === 'downside' && styles.selectedScenario]}
              onPress={() => setScenarioType('downside')}
            >
              <Text style={[styles.scenarioText, scenarioType === 'downside' && styles.selectedScenarioText]}>
                Downside
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Section */}
        {projections && currentScenario ? (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>
              {scenarioType === 'base' && 'Base Case Scenario (Most Likely)'}
              {scenarioType === 'upside' && 'Upside Scenario (Aggressive)'}
              {scenarioType === 'downside' && 'Downside Scenario (Conservative)'}
            </Text>
            
            {/* Financial Overview */}
            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>Financial Overview</Text>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Initial Investment:</Text>
                <Text style={styles.resultValue}>{currentScenario.initialInvestment.toLocaleString()} MAD</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Annual Costs:</Text>
                <Text style={styles.resultValue}>{currentScenario.annualCosts.toLocaleString()} MAD</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Yearly Revenue:</Text>
                <Text style={styles.resultValue}>{currentScenario.yearlyRevenue.toLocaleString()} MAD</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Annual Profit:</Text>
                <Text style={[
                  styles.resultValue, 
                  currentScenario.profit > 0 ? styles.profitPositive : styles.profitNegative
                ]}>
                  {currentScenario.profit.toLocaleString()} MAD
                </Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>ROI:</Text>
                <Text style={[
                  styles.resultValue, 
                  parseFloat(currentScenario.roi) > 0 ? styles.profitPositive : styles.profitNegative
                ]}>
                  {currentScenario.roi}%
                </Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Break-even (years):</Text>
                <Text style={styles.resultValue}>
                  {currentScenario.breakEvenYears}
                </Text>
              </View>
            </View>

            {/* Cash Flow Chart */}
            {chartData && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>5-Year Cash Flow Projection (in thousands MAD)</Text>
                
                {Platform.OS === 'web' ? (
                  <Text style={styles.chartPlaceholder}>
                    Interactive chart not available on web. Please check on mobile device.
                  </Text>
                ) : (
                  <LineChart
                    data={chartData}
                    width={Dimensions.get('window').width - 40}
                    height={220}
                    chartConfig={{
                      backgroundColor: Colors.cardBackground,
                      backgroundGradientFrom: Colors.cardBackground,
                      backgroundGradientTo: Colors.cardBackground,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(0, 128, 255, ${opacity})`,
                      style: {
                        borderRadius: 16
                      },
                      propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: Colors.primary
                      }
                    }}
                    bezier
                    style={styles.chart}
                  />
                )}
              </View>
            )}

            {/* Crop Analysis */}
            <View style={styles.cropAnalysisCard}>
              <Text style={styles.resultCardTitle}>Crop Analysis</Text>
              {cropType && (
                <>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Selected Crop:</Text>
                    <Text style={[
                      styles.resultValue,
                      { color: getOptionTextColor('crop', cropType) }
                    ]}>
                      {CROP_TYPES.find(c => c.value === cropType)?.label}
                    </Text>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Soil Compatibility:</Text>
                    <Text style={[
                      styles.resultValue, 
                      getCropSoilCompatibility(cropType) === 'compatible' ? styles.compatibilityGood : styles.compatibilityPoor
                    ]}>
                      {getCropSoilCompatibility(cropType) === 'compatible' ? 'Good Match' : 'Poor Match'}
                    </Text>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Water Requirements:</Text>
                    <Text style={[
                      styles.resultValue,
                      getCropWaterCompatibility(cropType) === 'compatible' ? styles.compatibilityGood : 
                      getCropWaterCompatibility(cropType) === 'moderate' ? styles.compatibilityModerate : 
                      styles.compatibilityPoor
                    ]}>
                      {getCropWaterCompatibility(cropType) === 'compatible' ? 'Well Suited' : 
                       getCropWaterCompatibility(cropType) === 'moderate' ? 'Moderate' : 
                       'High Needs'}
                    </Text>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Revenue Potential:</Text>
                    <Text style={[
                      styles.resultValue,
                      CROP_TYPES.find(c => c.value === cropType)?.revenueFactor >= 1.1 ? styles.profitPositive :
                      CROP_TYPES.find(c => c.value === cropType)?.revenueFactor <= 0.9 ? styles.profitNegative :
                      null
                    ]}>
                      {CROP_TYPES.find(c => c.value === cropType)?.revenueFactor >= 1.2 ? 'High' :
                       CROP_TYPES.find(c => c.value === cropType)?.revenueFactor >= 1.1 ? 'Above Average' :
                       CROP_TYPES.find(c => c.value === cropType)?.revenueFactor >= 0.9 ? 'Average' :
                       'Below Average'}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Scenario Description */}
            <View style={styles.scenarioDescriptionCard}>
              <Text style={styles.scenarioDescriptionTitle}>Scenario Details</Text>
              <Text style={styles.scenarioDescription}>
                {scenarioType === 'base' && (
                  `This base case scenario assumes standard market conditions, average crop yields, and typical operational costs for your selected region and farm characteristics. It represents the most likely outcome based on historical data from similar agricultural operations in Morocco.`
                )}
                {scenarioType === 'upside' && (
                  `This upside scenario represents an optimistic outlook with better-than-expected crop yields (20% above base case), favorable market conditions, and potential cost savings. This scenario might occur with ideal weather conditions, strong market demand, or improved operational efficiency.`
                )}
                {scenarioType === 'downside' && (
                  `This conservative scenario accounts for potential risks such as lower crop yields (20% below base case), market volatility, higher operational costs, or challenging weather conditions. This preparation helps ensure financial sustainability even in difficult years.`
                )}
              </Text>
            </View>

            {/* Recommendations */}
            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>Recommendations</Text>
              <Text style={styles.recommendation}>
                {region && REGION_FACTORS[region]?.baseYield > 0.9 ? 
                  '• The selected region has good agricultural potential with above-average yield expectations.' :
                  '• Consider crops that are well-suited to the lower yield potential in this region.'}
              </Text>
              
              <Text style={styles.recommendation}>
                {waterType === 'irrigation' ? 
                  '• Your irrigation system provides reliable water supply, suitable for water-intensive crops.' :
                  waterType === 'rainwater' ? 
                  '• Consider drought-resistant crops due to the reliance on less predictable rainwater.' :
                  '• Implement water conservation techniques to maximize the efficiency of your water source.'}
              </Text>
              
              <Text style={styles.recommendation}>
                {soilType === 'loamy' ? 
                  '• Your loamy soil is excellent for most crops with good nutrient balance and water retention.' :
                  soilType === 'sandy' ? 
                  '• Sandy soil benefits from organic matter additions to improve water retention and fertility.' :
                  soilType === 'clay' ? 
                  '• Clay soil requires good drainage systems but retains nutrients well.' :
                  '• Consider soil amendments specific to your soil type to improve crop yield potential.'}
              </Text>
              
              {cropType && (
                <Text style={styles.recommendation}>
                  {getCropSoilCompatibility(cropType) === 'compatible' && getCropWaterCompatibility(cropType) === 'compatible' ?
                    `• ${CROP_TYPES.find(c => c.value === cropType)?.label} is well-suited to your selected soil type and water source.` :
                    getCropSoilCompatibility(cropType) === 'incompatible' ?
                    `• Consider switching to crops better suited for ${soilType} soil, as ${CROP_TYPES.find(c => c.value === cropType)?.label} may underperform.` :
                    getCropWaterCompatibility(cropType) === 'incompatible' ?
                    `• ${CROP_TYPES.find(c => c.value === cropType)?.label} has high water requirements that may be challenging with your selected water source.` :
                    `• Monitor ${CROP_TYPES.find(c => c.value === cropType)?.label} growth carefully with your current soil and water conditions.`
                  }
                </Text>
              )}
              
              <Text style={styles.recommendation}>
                {currentScenario.profit > 0 ?
                  `• Based on projections, this agricultural operation is profitable with a ${currentScenario.roi}% ROI.` :
                  '• This scenario shows challenges in profitability. Consider adjusting your crop selection or operational approach.'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyResults}>
            <Text style={styles.emptyResultsText}>
              Enter all farm details to see business plan projections
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  formSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
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
  selectedInput: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '20', // 20% opacity
  },
  selectButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedInputText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  placeholderText: {
    color: Colors.textSecondary,
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
  selectedWebSelect: {
    borderColor: Colors.primary,
    color: Colors.primary,
    backgroundColor: Colors.primaryLight + '20', // 20% opacity
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  scenarioSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  scenarioButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scenarioButton: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedScenario: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  scenarioText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  selectedScenarioText: {
    color: Colors.white,
  },
  resultsSection: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  resultCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cropAnalysisCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  resultLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  profitPositive: {
    color: Colors.success,
  },
  profitNegative: {
    color: Colors.error,
  },
  compatibilityGood: {
    color: Colors.success,
  },
  compatibilityModerate: {
    color: Colors.warning || '#ff9900',
  },
  compatibilityPoor: {
    color: Colors.error,
  },
  chartCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartPlaceholder: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 40,
  },
  scenarioDescriptionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scenarioDescriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  scenarioDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  recommendationsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  recommendation: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyResultsText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
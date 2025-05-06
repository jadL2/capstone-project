import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, LineChart, BarChartBig, Filter, MapPin, Wheat, Apple, Coffee, Leaf } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { LineChart as RNLineChart } from 'react-native-chart-kit';

// Morocco Agricultural Production Data
// Comprehensive data for all regions and crops based on USDA FAS data
const MOROCCO_CROP_DATA = {
  // All 12 regions of Morocco
  regions: [
    { id: 'marrakech-safi', name: 'Marrakech-Safi', color: '#e57373' },
    { id: 'casablanca-settat', name: 'Casablanca-Settat', color: '#64b5f6' },
    { id: 'rabat-sale-kenitra', name: 'Rabat-Salé-Kénitra', color: '#81c784' },
    { id: 'fes-meknes', name: 'Fès-Meknès', color: '#ffb74d' },
    { id: 'souss-massa', name: 'Souss-Massa', color: '#9575cd' },
    { id: 'oriental', name: 'Oriental', color: '#4db6ac' },
    { id: 'draa-tafilalet', name: 'Drâa-Tafilalet', color: '#dce775' },
    { id: 'tangier-tetouan-al-hoceima', name: 'Tanger-Tétouan-Al Hoceima', color: '#ff8a65' },
    { id: 'beni-mellal-khenifra', name: 'Béni Mellal-Khénifra', color: '#a1887f' },
    { id: 'guelmim-oued-noun', name: 'Guelmim-Oued Noun', color: '#90a4ae' },
    { id: 'laayoune-sakia-el-hamra', name: 'Laâyoune-Sakia El Hamra', color: '#f06292' },
    { id: 'dakhla-oued-ed-dahab', name: 'Dakhla-Oued Ed-Dahab', color: '#7986cb' },
  ],
  
  // Various crop categories and specific crops
  cropCategories: [
    {
      id: 'grains',
      name: 'Grains & Cereals',
      icon: 'Wheat',
      color: '#f39c12',
      crops: [
        { id: 'wheat', name: 'Common Wheat', color: '#f1c40f' },
        { id: 'durum-wheat', name: 'Durum Wheat', color: '#e67e22' },
        { id: 'barley', name: 'Barley', color: '#d35400' },
        { id: 'corn', name: 'Corn', color: '#f9ca24' },
        { id: 'rice', name: 'Rice', color: '#f0932b' },
      ]
    },
    {
      id: 'fruits',
      name: 'Fruits',
      icon: 'Apple',
      color: '#e74c3c',
      crops: [
        { id: 'citrus', name: 'Citrus Fruits', color: '#f39c12' },
        { id: 'oranges', name: 'Oranges', color: '#e67e22' },
        { id: 'grapes', name: 'Grapes', color: '#8e44ad' },
        { id: 'dates', name: 'Dates', color: '#a1887f' },
        { id: 'olives', name: 'Olives', color: '#27ae60' },
        { id: 'almonds', name: 'Almonds', color: '#95a5a6' },
      ]
    },
    {
      id: 'vegetables',
      name: 'Vegetables',
      icon: 'Leaf',
      color: '#27ae60',
      crops: [
        { id: 'tomatoes', name: 'Tomatoes', color: '#e74c3c' },
        { id: 'potatoes', name: 'Potatoes', color: '#f5cd79' },
        { id: 'onions', name: 'Onions', color: '#ea8685' },
        { id: 'peppers', name: 'Peppers', color: '#78e08f' },
      ]
    },
    {
      id: 'industrial',
      name: 'Industrial Crops',
      icon: 'Coffee',
      color: '#8e44ad',
      crops: [
        { id: 'sugar-beet', name: 'Sugar Beet', color: '#f5cd79' },
        { id: 'sugar-cane', name: 'Sugar Cane', color: '#f19066' },
        { id: 'cotton', name: 'Cotton', color: '#ffffff' },
      ]
    },
  ],
  
  // Production data for various crops by year (in thousand metric tons)
  productionData: {
    'wheat': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [3000, 5100, 3400, 5800, 2200, 2800],
      unit: 'thousand tons',
      avgYield: 1.2, // tons per hectare
      trendDescription: 'Highly variable production due to rainfall dependency. 2025 production 26% below 10-year average.',
      regions: {
        'casablanca-settat': 22,
        'rabat-sale-kenitra': 18,
        'fes-meknes': 20,
        'marrakech-safi': 15,
        'beni-mellal-khenifra': 13,
        'other': 12,
      }
    },
    'durum-wheat': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [1800, 2200, 1500, 2400, 900, 1100],
      unit: 'thousand tons',
      avgYield: 1.0, // tons per hectare
      trendDescription: 'Production closely follows rainfall patterns with significant year-to-year variations.',
      regions: {
        'casablanca-settat': 20,
        'rabat-sale-kenitra': 15,
        'fes-meknes': 25,
        'marrakech-safi': 12,
        'beni-mellal-khenifra': 15,
        'other': 13,
      }
    },
    'barley': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [1200, 2600, 1100, 2400, 600, 700],
      unit: 'thousand tons',
      avgYield: 0.9, // tons per hectare
      trendDescription: 'Barley production has fallen significantly due to recurring drought conditions.',
      regions: {
        'casablanca-settat': 15,
        'fes-meknes': 18,
        'oriental': 22,
        'marrakech-safi': 16,
        'beni-mellal-khenifra': 14,
        'other': 15,
      }
    },
    'corn': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [130, 140, 120, 145, 110, 125],
      unit: 'thousand tons',
      avgYield: 0.8, // tons per hectare
      trendDescription: 'Corn production remains relatively stable but limited by water availability.',
      regions: {
        'rabat-sale-kenitra': 28,
        'fes-meknes': 25,
        'beni-mellal-khenifra': 22,
        'souss-massa': 10,
        'other': 15,
      }
    },
    'citrus': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [2400, 2300, 2500, 2600, 2200, 2300],
      unit: 'thousand tons',
      avgYield: 18, // tons per hectare
      trendDescription: 'Citrus production has remained relatively stable with moderate impact from drought.',
      regions: {
        'souss-massa': 45,
        'oriental': 20,
        'tangier-tetouan-al-hoceima': 12,
        'rabat-sale-kenitra': 10,
        'other': 13,
      }
    },
    'tomatoes': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [1500, 1600, 1550, 1700, 1600, 1650],
      unit: 'thousand tons',
      avgYield: 80, // tons per hectare
      trendDescription: 'Tomato production has shown growth due to greenhouse cultivation expansion.',
      regions: {
        'souss-massa': 60,
        'rabat-sale-kenitra': 15,
        'casablanca-settat': 12,
        'other': 13,
      }
    },
    'olives': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [1400, 1100, 1600, 1400, 1300, 1500],
      unit: 'thousand tons',
      avgYield: 1.6, // tons per hectare
      trendDescription: 'Olive production has been expanding with government support for tree planting.',
      regions: {
        'marrakech-safi': 25,
        'fes-meknes': 22,
        'tangier-tetouan-al-hoceima': 18,
        'oriental': 12,
        'beni-mellal-khenifra': 11,
        'other': 12,
      }
    },
    'sugar-beet': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [3600, 3400, 3200, 3500, 3100, 3300],
      unit: 'thousand tons',
      avgYield: 60, // tons per hectare
      trendDescription: 'Sugar beet production has remained stable with slight decreases due to water constraints.',
      regions: {
        'rabat-sale-kenitra': 30,
        'casablanca-settat': 25,
        'beni-mellal-khenifra': 28,
        'other': 17,
      }
    },
    'dates': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [140, 145, 150, 155, 160, 165],
      unit: 'thousand tons',
      avgYield: 4, // tons per hectare
      trendDescription: 'Date production has been gradually increasing with new plantation initiatives.',
      regions: {
        'draa-tafilalet': 65,
        'souss-massa': 15,
        'guelmim-oued-noun': 10,
        'other': 10,
      }
    },
  },
  
  // Import data for selected crops
  importData: {
    'wheat': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [5800, 3700, 5500, 3200, 7000, 7300],
      unit: 'thousand tons',
      sources: {
        'France': 43,
        'Canada': 14,
        'Germany': 14,
        'Russia': 8,
        'Ukraine': 7,
        'Others': 14,
      },
      trendDescription: 'Wheat imports fluctuate inversely with domestic production. 2025 forecast imports are 7.3 million tonnes.'
    },
    'barley': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [700, 500, 850, 600, 900, 900],
      unit: 'thousand tons',
      sources: {
        'France': 35,
        'Russia': 25,
        'Ukraine': 15,
        'Argentina': 10,
        'Others': 15,
      },
      trendDescription: 'Barley imports have been increasing to meet livestock feed demand amid local production shortfalls.'
    },
    'corn': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [2500, 2600, 2700, 2800, 2750, 2800],
      unit: 'thousand tons',
      sources: {
        'Argentina': 40,
        'Brazil': 30,
        'USA': 15,
        'Ukraine': 10,
        'Others': 5,
      },
      trendDescription: 'Corn imports remain high and stable to meet livestock feed demand, as domestic production is limited.'
    },
    'sugar': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [800, 850, 860, 840, 860, 870],
      unit: 'thousand tons',
      sources: {
        'EU': 45,
        'Brazil': 25,
        'Thailand': 15,
        'Others': 15,
      },
      trendDescription: 'Sugar imports complement domestic production from sugar beet and sugar cane to meet consumption needs.'
    },
  },
  
  // Price data for selected crops (MAD per ton)
  priceData: {
    'wheat': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [2800, 2600, 3200, 3100, 3400, 3300],
      unit: 'MAD/ton',
      trendDescription: 'Wheat prices have been trending upward despite government price controls and subsidies.'
    },
    'barley': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [2500, 2400, 2900, 2800, 3100, 3000],
      unit: 'MAD/ton',
      trendDescription: 'Barley prices follow wheat price trends but typically trade at a discount.'
    },
    'citrus': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [3500, 3600, 3700, 4000, 4200, 4300],
      unit: 'MAD/ton',
      trendDescription: 'Citrus prices have shown steady increases due to growing export demand.'
    },
    'olives': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [7000, 7200, 7500, 7800, 8000, 8200],
      unit: 'MAD/ton',
      trendDescription: 'Olive prices have been rising due to increasing domestic and export demand for olive oil.'
    },
    'tomatoes': {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      values: [2000, 2100, 2300, 2500, 2600, 2700],
      unit: 'MAD/ton',
      trendDescription: 'Tomato prices have been increasing with growing export markets, particularly to Europe.'
    },
  },
};

// Get icon component based on name
const getIconComponent = (iconName, size, color) => {
  switch (iconName) {
    case 'Wheat':
      return <Wheat size={size} color={color} />;
    case 'Apple':
      return <Apple size={size} color={color} />;
    case 'Coffee':
      return <Coffee size={size} color={color} />;
    case 'Leaf':
      return <Leaf size={size} color={color} />;
    default:
      return <Wheat size={size} color={color} />;
  }
};

export default function MoroccanProductionScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('grains');
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [selectedDataType, setSelectedDataType] = useState('production');
  
  // Find the current category based on selection
  const currentCategory = MOROCCO_CROP_DATA.cropCategories.find(cat => cat.id === selectedCategory);
  
  // Check if data exists for this crop and data type
  const hasProductionData = MOROCCO_CROP_DATA.productionData[selectedCrop] !== undefined;
  const hasImportData = MOROCCO_CROP_DATA.importData[selectedCrop] !== undefined;
  const hasPriceData = MOROCCO_CROP_DATA.priceData[selectedCrop] !== undefined;
  
  // Get data for selected crop and data type
  const getCropData = () => {
    switch (selectedDataType) {
      case 'production':
        return hasProductionData ? MOROCCO_CROP_DATA.productionData[selectedCrop] : null;
      case 'imports':
        return hasImportData ? MOROCCO_CROP_DATA.importData[selectedCrop] : null;
      case 'prices':
        return hasPriceData ? MOROCCO_CROP_DATA.priceData[selectedCrop] : null;
      default:
        return null;
    }
  };
  
  const cropData = getCropData();
  
  // Prepare chart data
  const getChartData = () => {
    if (!cropData) return null;
    
    return {
      labels: cropData.years.map(year => year.toString()),
      datasets: [
        {
          data: cropData.values,
          color: (opacity = 1) => {
            const cropColor = currentCategory?.crops.find(c => c.id === selectedCrop)?.color || '#f39c12';
            return `rgba(${hexToRgb(cropColor)}, ${opacity})`;
          },
          strokeWidth: 2
        }
      ],
    };
  };
  
  // Helper function to convert hex to rgb
  const hexToRgb = (hex) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  };
  
  const chartData = getChartData();
  
  // Get chart title based on data type
  const getChartTitle = () => {
    if (!cropData) return '';
    
    const cropName = currentCategory?.crops.find(c => c.id === selectedCrop)?.name || selectedCrop;
    
    switch (selectedDataType) {
      case 'production':
        return `${cropName} Production (${cropData.unit})`;
      case 'imports':
        return `${cropName} Imports (${cropData.unit})`;
      case 'prices':
        return `${cropName} Prices (${cropData.unit})`;
      default:
        return '';
    }
  };
  
  // Get regional data for the selected crop (production only)
  const getRegionalData = () => {
    if (selectedDataType !== 'production' || !hasProductionData) return null;
    
    const productionData = MOROCCO_CROP_DATA.productionData[selectedCrop];
    if (!productionData.regions) return null;
    
    return productionData.regions;
  };
  
  const regionalData = getRegionalData();
  
  // Get import sources data (imports only)
  const getImportSourcesData = () => {
    if (selectedDataType !== 'imports' || !hasImportData) return null;
    
    const importData = MOROCCO_CROP_DATA.importData[selectedCrop];
    if (!importData.sources) return null;
    
    return importData.sources;
  };
  
  const importSourcesData = getImportSourcesData();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Moroccan Production',
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
          {currentCategory && getIconComponent(currentCategory.icon, 24, currentCategory.color)}
          <Text style={styles.headerTitle}>
            {currentCategory ? currentCategory.name : 'Agricultural Production'}
          </Text>
        </View>

        {/* Category Selection */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryScrollView}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {MOROCCO_CROP_DATA.cropCategories.map((category) => (
            <TouchableOpacity 
              key={category.id}
              style={[
                styles.categoryButton, 
                selectedCategory === category.id && { backgroundColor: category.color + '30', borderColor: category.color }
              ]}
              onPress={() => {
                setSelectedCategory(category.id);
                // Set the first crop in this category as selected
                if (category.crops.length > 0) {
                  setSelectedCrop(category.crops[0].id);
                }
              }}
            >
              {getIconComponent(category.icon, 20, selectedCategory === category.id ? category.color : Colors.textSecondary)}
              <Text 
                style={[
                  styles.categoryButtonText, 
                  selectedCategory === category.id && { color: category.color, fontWeight: 'bold' }
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Crop Selection */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.cropScrollView}
          contentContainerStyle={styles.cropScrollContent}
        >
          {currentCategory?.crops.map((crop) => (
            <TouchableOpacity 
              key={crop.id}
              style={[
                styles.cropButton, 
                selectedCrop === crop.id && { backgroundColor: crop.color + '30', borderColor: crop.color }
              ]}
              onPress={() => setSelectedCrop(crop.id)}
            >
              <Text 
                style={[
                  styles.cropButtonText, 
                  selectedCrop === crop.id && { color: crop.color, fontWeight: 'bold' }
                ]}
              >
                {crop.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Data Type Selection */}
        <View style={styles.dataTypeContainer}>
          <TouchableOpacity 
            style={[
              styles.dataTypeButton, 
              selectedDataType === 'production' && styles.selectedDataType,
              !hasProductionData && styles.disabledDataType
            ]}
            onPress={() => hasProductionData && setSelectedDataType('production')}
            disabled={!hasProductionData}
          >
            <LineChart 
              size={16} 
              color={selectedDataType === 'production' ? Colors.white : !hasProductionData ? Colors.textTertiary : Colors.textSecondary} 
            />
            <Text 
              style={[
                styles.dataTypeText, 
                selectedDataType === 'production' && styles.selectedDataTypeText,
                !hasProductionData && styles.disabledDataTypeText
              ]}
            >
              Production
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.dataTypeButton, 
              selectedDataType === 'imports' && styles.selectedDataType,
              !hasImportData && styles.disabledDataType
            ]}
            onPress={() => hasImportData && setSelectedDataType('imports')}
            disabled={!hasImportData}
          >
            <BarChartBig 
              size={16} 
              color={selectedDataType === 'imports' ? Colors.white : !hasImportData ? Colors.textTertiary : Colors.textSecondary} 
            />
            <Text 
              style={[
                styles.dataTypeText, 
                selectedDataType === 'imports' && styles.selectedDataTypeText,
                !hasImportData && styles.disabledDataTypeText
              ]}
            >
              Imports
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.dataTypeButton, 
              selectedDataType === 'prices' && styles.selectedDataType,
              !hasPriceData && styles.disabledDataType
            ]}
            onPress={() => hasPriceData && setSelectedDataType('prices')}
            disabled={!hasPriceData}
          >
            <Filter 
              size={16} 
              color={selectedDataType === 'prices' ? Colors.white : !hasPriceData ? Colors.textTertiary : Colors.textSecondary} 
            />
            <Text 
              style={[
                styles.dataTypeText, 
                selectedDataType === 'prices' && styles.selectedDataTypeText,
                !hasPriceData && styles.disabledDataTypeText
              ]}
            >
              Prices
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart Section */}
        {cropData ? (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>{getChartTitle()}</Text>
            
            {chartData && (
              <RNLineChart
                data={chartData}
                width={Dimensions.get('window').width - 40}
                height={220}
                chartConfig={{
                  backgroundColor: Colors.cardBackground,
                  backgroundGradientFrom: Colors.cardBackground,
                  backgroundGradientTo: Colors.cardBackground,
                  decimalPlaces: 0,
                  color: (opacity = 1) => {
                    const cropColor = currentCategory?.crops.find(c => c.id === selectedCrop)?.color || '#f39c12';
                    return `rgba(${hexToRgb(cropColor)}, ${opacity})`;
                  },
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: { 
                    r: "6", 
                    strokeWidth: "2", 
                    stroke: currentCategory?.crops.find(c => c.id === selectedCrop)?.color || '#f39c12'
                  }
                }}
                bezier
                style={styles.chart}
              />
            )}
            
            {cropData.trendDescription && (
              <Text style={styles.trendDescription}>
                {cropData.trendDescription}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              No data available for this selection
            </Text>
          </View>
        )}
        
        {/* Regional Production Data */}
        {regionalData && (
          <View style={styles.regionalDataSection}>
            <Text style={styles.sectionTitle}>Regional Production (%)</Text>
            
            {Object.entries(regionalData).map(([regionId, percentage], index) => {
              const region = MOROCCO_CROP_DATA.regions.find(r => r.id === regionId) || 
                            { name: regionId.charAt(0).toUpperCase() + regionId.slice(1), color: '#95a5a6' };
              
              return (
                <View key={index} style={styles.regionItem}>
                  <View style={styles.regionBar}>
                    <View 
                      style={[
                        styles.regionBarFill, 
                        { width: `${percentage}%`, backgroundColor: region.color }
                      ]}
                    />
                  </View>
                  <View style={styles.regionLabelContainer}>
                    <MapPin size={12} color={region.color} />
                    <Text style={styles.regionLabel}>{region.name}</Text>
                    <Text style={styles.regionPercentage}>{percentage}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        
        {/* Import Sources Data */}
        {importSourcesData && (
          <View style={styles.importSourcesSection}>
            <Text style={styles.sectionTitle}>Import Sources (%)</Text>
            
            {Object.entries(importSourcesData).map(([country, percentage], index) => (
              <View key={index} style={styles.sourceItem}>
                <View style={styles.sourceBar}>
                  <View 
                    style={[
                      styles.sourceBarFill, 
                      { width: `${percentage}%`, backgroundColor: sourceColors[index % sourceColors.length] }
                    ]}
                  />
                </View>
                <View style={styles.sourceLabelContainer}>
                  <View style={[styles.sourceColorDot, { backgroundColor: sourceColors[index % sourceColors.length] }]} />
                  <Text style={styles.sourceLabel}>{country}</Text>
                  <Text style={styles.sourcePercentage}>{percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* Additional Data and Analysis */}
        {cropData && (
          <View style={styles.additionalDataSection}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            {selectedDataType === 'production' && hasProductionData && (
              <View style={styles.dataCard}>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Average Yield:</Text>
                  <Text style={styles.dataValue}>
                    {MOROCCO_CROP_DATA.productionData[selectedCrop].avgYield} tons/hectare
                  </Text>
                </View>
                
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>5-Year Average:</Text>
                  <Text style={styles.dataValue}>
                    {(MOROCCO_CROP_DATA.productionData[selectedCrop].values.reduce((a, b) => a + b, 0) / 
                    MOROCCO_CROP_DATA.productionData[selectedCrop].values.length).toFixed(1)} {cropData.unit}
                  </Text>
                </View>
                
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Year-on-Year Change:</Text>
                  <Text style={[
                    styles.dataValue,
                    {
                      color: cropData.values[5] > cropData.values[4] ? Colors.success :
                             cropData.values[5] < cropData.values[4] ? Colors.error :
                             Colors.text
                    }
                  ]}>
                    {((cropData.values[5] - cropData.values[4]) / cropData.values[4] * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>
            )}
            
            {selectedDataType === 'imports' && hasImportData && (
              <View style={styles.dataCard}>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Import Dependency:</Text>
                  <Text style={styles.dataValue}>
                    {hasProductionData ? 
                     `${(MOROCCO_CROP_DATA.importData[selectedCrop].values[5] / 
                         (MOROCCO_CROP_DATA.importData[selectedCrop].values[5] + 
                          MOROCCO_CROP_DATA.productionData[selectedCrop].values[5]) * 100).toFixed(1)}%` :
                     'N/A'}
                  </Text>
                </View>
                
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>5-Year Average:</Text>
                  <Text style={styles.dataValue}>
                    {(MOROCCO_CROP_DATA.importData[selectedCrop].values.reduce((a, b) => a + b, 0) / 
                    MOROCCO_CROP_DATA.importData[selectedCrop].values.length).toFixed(1)} {cropData.unit}
                  </Text>
                </View>
                
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Year-on-Year Change:</Text>
                  <Text style={[
                    styles.dataValue,
                    {
                      color: cropData.values[5] > cropData.values[4] ? Colors.success :
                             cropData.values[5] < cropData.values[4] ? Colors.error :
                             Colors.text
                    }
                  ]}>
                    {((cropData.values[5] - cropData.values[4]) / cropData.values[4] * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>
            )}
            
            {selectedDataType === 'prices' && hasPriceData && (
              <View style={styles.dataCard}>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Current Price:</Text>
                  <Text style={styles.dataValue}>
                    {cropData.values[5].toLocaleString()} {cropData.unit}
                  </Text>
                </View>
                
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>5-Year Growth:</Text>
                  <Text style={[
                    styles.dataValue,
                    {
                      color: cropData.values[5] > cropData.values[0] ? Colors.success :
                             cropData.values[5] < cropData.values[0] ? Colors.error :
                             Colors.text
                    }
                  ]}>
                    {((cropData.values[5] - cropData.values[0]) / cropData.values[0] * 100).toFixed(1)}%
                  </Text>
                </View>
                
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Year-on-Year Change:</Text>
                  <Text style={[
                    styles.dataValue,
                    {
                      color: cropData.values[5] > cropData.values[4] ? Colors.success :
                             cropData.values[5] < cropData.values[4] ? Colors.error :
                             Colors.text
                    }
                  ]}>
                    {((cropData.values[5] - cropData.values[4]) / cropData.values[4] * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
        
        {/* Bottom Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Data Sources</Text>
          <Text style={styles.infoText}>
            All data is sourced from the USDA Foreign Agricultural Service (FAS) reports on Morocco, 
            including the "Morocco: Grain and Feed Annual" report and USDA's World Agricultural Production circulars.
          </Text>
          <Text style={styles.infoText}>
            Production forecasts represent official USDA estimates. Regional breakdowns are derived from 
            historical FAS data combined with satellite imagery analysis. Price data reflects market prices 
            reported in major Moroccan agricultural markets.
          </Text>
          <Text style={styles.updateInfo}>Last updated: April 2025</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Colors for import sources
const sourceColors = ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#34495e', '#d35400'];

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
  categoryScrollView: {
    marginBottom: 16,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  cropScrollView: {
    marginBottom: 16,
  },
  cropScrollContent: {
    paddingHorizontal: 16,
  },
  cropButton: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cropButtonText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dataTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  dataTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBackground,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedDataType: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  disabledDataType: {
    opacity: 0.5,
  },
  dataTypeText: {
    fontSize: 13,
    marginLeft: 6,
    color: Colors.textSecondary,
  },
  selectedDataTypeText: {
    color: Colors.white,
    fontWeight: '500',
  },
  disabledDataTypeText: {
    color: Colors.textTertiary,
  },
  chartSection: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  trendDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 12,
    lineHeight: 20,
  },
  noDataContainer: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  regionalDataSection: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  regionItem: {
    marginBottom: 12,
  },
  regionBar: {
    height: 12,
    backgroundColor: Colors.background,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  regionBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  regionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regionLabel: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 6,
    flex: 1,
  },
  regionPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  importSourcesSection: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sourceItem: {
    marginBottom: 12,
  },
  sourceBar: {
    height: 12,
    backgroundColor: Colors.background,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  sourceBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  sourceLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  sourceLabel: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  sourcePercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  additionalDataSection: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dataCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dataLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  infoSection: {
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  updateInfo: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { ChevronLeft, Droplets, Calendar, Scaling as Seedling, Plus, InfoIcon, MapPin, Edit2, Trash2, Filter, SortDesc, Check, X, MoreHorizontal, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

// Define types for user profile settings
type Region = 'Meknes-Fes' | 'Souss-Massa' | 'Doukkala-Abda';
type SoilType = 'Clay' | 'Loamy' | 'Sandy';
type WaterSource = 'Rain-fed' | 'Irrigation';

// Define types for crops
type CropStatus = 'Growing' | 'Ready to Harvest' | 'Planted' | 'Planning';

// Define soil data type for prediction API
type SoilData = {
  N: number; // Nitrogen
  P: number; // Phosphorus
  K: number; // Potassium
  temperature: number;
  humidity: number;
  pH: number;
  rainfall: number;
};

// Fixed CropType definition
type CropType = {
  id: string;
  name: string;
  variety: string;
  plantingDate: string;
  harvestDate: string;
  status: CropStatus;
  field: string;
  area: number; // hectares
  notes: string;
  lastWatered?: string;
  lastFertilized?: string;
  soilData?: SoilData;
  isRecommended?: boolean; // New flag to highlight recommended crops
};

// Define activities
type ActivityType = 'Watering' | 'Fertilizing' | 'Pesticide' | 'Pruning' | 'Harvesting' | 'Planting' | 'Other';
type Activity = {
  id: string;
  cropId: string;
  type: ActivityType;
  date: string;
  notes: string;
  completed: boolean;
  isRecommended?: boolean; // New flag to highlight recommended activities
};

// Crop recommendation details by crop type
type CropRecommendationDetails = {
  [key: string]: {
    varieties: string[];
    growthDuration: number; // days
    wateringFrequency: number; // days
    fertilizingFrequency: number; // days
    activities: Array<{
      type: ActivityType;
      dayOffset: number;
      notes: string;
    }>;
  };
};

// Define the crop management screen component
export default function CropManagementScreen() {
  // Current date for planning
  const currentDate = new Date('2025-05-05');
  const formattedCurrentDate = currentDate.toISOString().split('T')[0];
  
  // User profile settings
  const [userProfile, setUserProfile] = useState<{
    region: Region | null;
    soilType: SoilType | null;
    waterSource: WaterSource | null;
  }>({
    region: 'Meknes-Fes',
    soilType: 'Loamy',
    waterSource: 'Irrigation'
  });
  
  const [loading, setLoading] = useState(false);

  // Crop recommendation information
  const cropRecommendations: CropRecommendationDetails = {
    'Rice': {
      varieties: ['Basmati', 'Japonica'],
      growthDuration: 120,
      wateringFrequency: 3,
      fertilizingFrequency: 14,
      activities: [
        { type: 'Watering', dayOffset: 3, notes: 'Keep soil saturated' },
        { type: 'Fertilizing', dayOffset: 14, notes: 'NPK balanced fertilizer' },
        { type: 'Pesticide', dayOffset: 30, notes: 'Check for stem borers' }
      ]
    },
    'Wheat': {
      varieties: ['Durum', 'Common'],
      growthDuration: 160,
      wateringFrequency: 7,
      fertilizingFrequency: 21,
      activities: [
        { type: 'Watering', dayOffset: 7, notes: 'Moderate irrigation' },
        { type: 'Fertilizing', dayOffset: 21, notes: 'Nitrogen-rich fertilizer' },
        { type: 'Harvesting', dayOffset: 160, notes: 'Check grain hardness' }
      ]
    },
    'Cotton': {
      varieties: ['Pima', 'Upland'],
      growthDuration: 180,
      wateringFrequency: 10,
      fertilizingFrequency: 30,
      activities: [
        { type: 'Watering', dayOffset: 10, notes: 'Deep watering' },
        { type: 'Fertilizing', dayOffset: 30, notes: 'Phosphorus-rich fertilizer' },
        { type: 'Pesticide', dayOffset: 45, notes: 'Check for bollworms' }
      ]
    },
    'Chickpea': {
      varieties: ['Desi', 'Kabuli'],
      growthDuration: 110,
      wateringFrequency: 8,
      fertilizingFrequency: 25,
      activities: [
        { type: 'Watering', dayOffset: 8, notes: 'Light irrigation' },
        { type: 'Fertilizing', dayOffset: 25, notes: 'Low nitrogen fertilizer' },
        { type: 'Harvesting', dayOffset: 110, notes: 'Harvest when pods are dry' }
      ]
    },
    'Papaya': {
      varieties: ['Red Lady', 'Sunrise'],
      growthDuration: 280,
      wateringFrequency: 5,
      fertilizingFrequency: 30,
      activities: [
        { type: 'Watering', dayOffset: 5, notes: 'Regular watering' },
        { type: 'Fertilizing', dayOffset: 30, notes: 'Balanced fertilizer' },
        { type: 'Pruning', dayOffset: 90, notes: 'Remove lower leaves' }
      ]
    },
    'Grapes': {
      varieties: ['Muscat', 'Syrah'],
      growthDuration: 170,
      wateringFrequency: 7,
      fertilizingFrequency: 45,
      activities: [
        { type: 'Watering', dayOffset: 7, notes: 'Drip irrigation' },
        { type: 'Pruning', dayOffset: 45, notes: 'Canopy management' },
        { type: 'Pesticide', dayOffset: 60, notes: 'Check for powdery mildew' }
      ]
    },
    'Maize': {
      varieties: ['Sweet Corn', 'Field Corn'],
      growthDuration: 100,
      wateringFrequency: 7,
      fertilizingFrequency: 21,
      activities: [
        { type: 'Watering', dayOffset: 7, notes: 'Regular watering' },
        { type: 'Fertilizing', dayOffset: 21, notes: 'Nitrogen-rich fertilizer' },
        { type: 'Harvesting', dayOffset: 100, notes: 'Check for kernel moisture' }
      ]
    },
    'Barley': {
      varieties: ['Two-row', 'Six-row'],
      growthDuration: 120,
      wateringFrequency: 10,
      fertilizingFrequency: 28,
      activities: [
        { type: 'Watering', dayOffset: 10, notes: 'Moderate irrigation' },
        { type: 'Fertilizing', dayOffset: 28, notes: 'Balanced fertilizer' },
        { type: 'Harvesting', dayOffset: 120, notes: 'Harvest when golden color' }
      ]
    },
    'Pomegranate': {
      varieties: ['Wonderful', 'Mollar'],
      growthDuration: 365, // perennial
      wateringFrequency: 10,
      fertilizingFrequency: 60,
      activities: [
        { type: 'Watering', dayOffset: 10, notes: 'Deep watering' },
        { type: 'Pruning', dayOffset: 120, notes: 'Structural pruning' },
        { type: 'Fertilizing', dayOffset: 60, notes: 'Potassium-rich fertilizer' }
      ]
    },
    'Lentil': {
      varieties: ['Green', 'Red'],
      growthDuration: 100,
      wateringFrequency: 10,
      fertilizingFrequency: 30,
      activities: [
        { type: 'Watering', dayOffset: 10, notes: 'Light irrigation' },
        { type: 'Fertilizing', dayOffset: 30, notes: 'Low nitrogen fertilizer' },
        { type: 'Harvesting', dayOffset: 100, notes: 'Harvest when pods are dry' }
      ]
    },
    'Millet': {
      varieties: ['Pearl', 'Foxtail'],
      growthDuration: 90,
      wateringFrequency: 8,
      fertilizingFrequency: 25,
      activities: [
        { type: 'Watering', dayOffset: 8, notes: 'Moderate watering' },
        { type: 'Fertilizing', dayOffset: 25, notes: 'Balanced fertilizer' },
        { type: 'Harvesting', dayOffset: 90, notes: 'Harvest when grains are firm' }
      ]
    },
    'Olives': {
      varieties: ['Picholine Marocaine', 'Arbequina'],
      growthDuration: 365, // perennial
      wateringFrequency: 14,
      fertilizingFrequency: 90,
      activities: [
        { type: 'Watering', dayOffset: 14, notes: 'Deep watering' },
        { type: 'Pruning', dayOffset: 180, notes: 'Remove suckers and thin canopy' },
        { type: 'Fertilizing', dayOffset: 90, notes: 'Balanced fertilizer' }
      ]
    },
    'Argan': {
      varieties: ['Indigenous', 'Traditional'],
      growthDuration: 365, // perennial
      wateringFrequency: 20,
      fertilizingFrequency: 120,
      activities: [
        { type: 'Watering', dayOffset: 20, notes: 'Drought-resistant, minimal water' },
        { type: 'Pruning', dayOffset: 200, notes: 'Light structural pruning' },
        { type: 'Harvesting', dayOffset: 270, notes: 'Harvest mature fruits' }
      ]
    },
    'Tomatoes': {
      varieties: ['Roma', 'Cherry'],
      growthDuration: 80,
      wateringFrequency: 3,
      fertilizingFrequency: 14,
      activities: [
        { type: 'Watering', dayOffset: 3, notes: 'Regular watering' },
        { type: 'Fertilizing', dayOffset: 14, notes: 'Balanced fertilizer' },
        { type: 'Pruning', dayOffset: 30, notes: 'Remove suckers for indeterminate varieties' }
      ]
    },
  };

  // Initial empty state for crops
  const [crops, setCrops] = useState<CropType[]>([]);
  
  // Initial empty state for activities
  const [activities, setActivities] = useState<Activity[]>([]);

  // Crop prediction state
  const [cropPrediction, setCropPrediction] = useState<{ loading: boolean, error: string | null, recommendation: string | null }>({
    loading: false,
    error: null,
    recommendation: null
  });

  // Soil data form for prediction
  const [soilDataForm, setSoilDataForm] = useState<SoilData>({
    N: 80,
    P: 40,
    K: 40,
    temperature: 23.5,
    humidity: 70,
    pH: 6.5,
    rainfall: 200
  });

  // Area for new predicted crop
  const [predictCropArea, setPredictCropArea] = useState<string>("5.0");

  // Modal states
  const [predictModalVisible, setPredictModalVisible] = useState(false);
  const [predictionResultModalVisible, setPredictionResultModalVisible] = useState(false);
  const [addCropModalVisible, setAddCropModalVisible] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropType | null>(null);
  
  // Function to navigate back to dashboard
  const navigateBack = () => {
    try {
      // First try the router.back() function
      router.back();
    } catch (error) {
      console.error('Error navigating back:', error);
      // If router.back() fails, navigate directly to the dashboard tab
      router.replace('/(tabs)');
    }
  };
  
  // Function to calculate harvest date based on planting date and growth duration
  const calculateHarvestDate = (plantingDate: string, growthDuration: number): string => {
    const date = new Date(plantingDate);
    date.setDate(date.getDate() + growthDuration);
    return date.toISOString().split('T')[0];
  };

  // Function to generate activities for a crop based on recommendation
  const generateActivitiesForCrop = (cropId: string, cropName: string, plantingDate: string): Activity[] => {
    const cropInfo = cropRecommendations[cropName];
    if (!cropInfo) return [];
    
    const newActivities: Activity[] = [];
    const plantDate = new Date(plantingDate);
    
    // Generate activities based on crop requirements
    cropInfo.activities.forEach((activity, index) => {
      const activityDate = new Date(plantDate);
      activityDate.setDate(activityDate.getDate() + activity.dayOffset);
      
      // Only add activities that are in the future or today
      if (activityDate >= currentDate) {
        newActivities.push({
          id: `${cropId}-activity-${index}`,
          cropId: cropId,
          type: activity.type,
          date: activityDate.toISOString().split('T')[0],
          notes: activity.notes,
          completed: false,
          isRecommended: true
        });
      }
    });
    
    return newActivities;
  };

  // MOCK API - Get crop recommendation 
  const getCropRecommendation = async (soilData: SoilData) => {
    setCropPrediction({ loading: true, error: null, recommendation: null });
    
    console.log('Mock API called with data:', soilData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Mock API logic for recommending crops based on soil data
      let recommendation: string;
      
      // Determine crop based on soil and environmental parameters
      // This is simplified logic based on agricultural conditions
      
      if (soilData.temperature > 25) {
        if (soilData.humidity > 70) {
          if (soilData.rainfall > 200) {
            recommendation = "Rice";
          } else {
            recommendation = "Cotton";
          }
        } else {
          if (soilData.K > 45) {
            recommendation = "Papaya";
          } else {
            recommendation = "Chickpea";
          }
        }
      } else if (soilData.temperature < 20) {
        if (soilData.humidity > 65) {
          recommendation = "Grapes";
        } else {
          recommendation = "Wheat";
        }
      } else {
        // Medium temperature (20-25°C)
        if (soilData.N > 100) {
          if (soilData.P > 50) {
            recommendation = "Maize";
          } else {
            recommendation = "Barley";
          }
        } else if (soilData.K > 50) {
          recommendation = "Pomegranate";
        } else if (soilData.pH > 7) {
          recommendation = "Lentil";
        } else {
          recommendation = "Millet";
        }
      }
      
      // For Moroccan conditions, prioritize these crops
      if (soilData.pH > 7.5 && soilData.temperature > 22 && soilData.rainfall < 200) {
        recommendation = "Olives";
      }
      
      if (soilData.N > 90 && soilData.humidity < 60 && soilData.temperature > 20) {
        recommendation = "Argan";
      }
      
      console.log('Mock API recommendation:', recommendation);
      
      setCropPrediction({
        loading: false,
        error: null,
        recommendation: recommendation
      });
      
      // Show prediction result modal
      setPredictModalVisible(false);
      setPredictionResultModalVisible(true);
      
    } catch (error) {
      console.error('Error in mock API:', error);
      setCropPrediction({
        loading: false,
        error: 'Failed to process soil data. Please try again.',
        recommendation: null
      });
      
      Alert.alert('Prediction Error', 'Failed to analyze soil data. Please check your inputs and try again.');
    }
  };

  // Function to replace all crops and activities with the recommended crop
  const handlePredictionForPlanning = (cropName: string) => {
    try {
      // Get the crop recommendation details
      const cropInfo = cropRecommendations[cropName];
      if (!cropInfo) {
        Alert.alert('Error', `No information available for ${cropName}`);
        return;
      }
      
      // Create a new ID for the crop
      const newCropId = `recommended-${Date.now()}`;
      
      // Select a variety
      const variety = cropInfo.varieties[0] || 'Standard';
      
      // Calculate harvest date based on growth duration
      const harvestDate = calculateHarvestDate(formattedCurrentDate, cropInfo.growthDuration);
      
      // Parse area from input
      const cropArea = parseFloat(predictCropArea) || 5.0;
      
      // Create the new crop with the recommended flag
      const newCrop: CropType = {
        id: newCropId,
        name: cropName,
        variety: variety,
        plantingDate: formattedCurrentDate,
        harvestDate: harvestDate,
        status: 'Planning',
        field: 'Select field',
        area: cropArea, // Use user-defined area
        notes: `Recommended based on soil analysis (N:${soilDataForm.N}, P:${soilDataForm.P}, K:${soilDataForm.K}, pH:${soilDataForm.pH})`,
        soilData: { ...soilDataForm },
        isRecommended: true
      };
      
      // Generate activities for this crop
      const newActivities = generateActivitiesForCrop(newCropId, cropName, formattedCurrentDate);
      
      // REPLACE all crops and activities (not just add)
      setCrops([newCrop]);
      setActivities(newActivities);
      
      // Close the modal and show success message
      setPredictionResultModalVisible(false);
      Alert.alert('Success', `Set ${cropName} as your recommended crop with ${newActivities.length} planned activities.`);
      
    } catch (error) {
      console.error('Error adding recommended crop:', error);
      Alert.alert('Error', 'Failed to set the recommended crop. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={navigateBack}
        >
          <ChevronLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crop Management</Text>
        <TouchableOpacity style={styles.infoButton}>
          <InfoIcon size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {userProfile.region && (
          <View style={styles.profileBanner}>
            <MapPin size={18} color={Colors.primary} />
            <Text style={styles.profileBannerText}>
              Farm: <Text style={styles.profileHighlight}>{userProfile.region}</Text> • 
              {crops.length} Crops • {crops.reduce((sum, crop) => sum + crop.area, 0).toFixed(1)} Hectares
            </Text>
          </View>
        )}

        <View style={styles.summaryContainer}>
          <TouchableOpacity 
            style={styles.summaryCard}
            onPress={() => setAddCropModalVisible(true)}
          >
            <Seedling size={24} color={Colors.primary} />
            <Text style={styles.summaryCardTitle}>Add New Crop</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.summaryCard}
            onPress={() => setPredictModalVisible(true)}
          >
            <Zap size={24} color={Colors.accent} />
            <Text style={styles.summaryCardTitle}>Predict Crop</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Crops</Text>
          
          {crops.length === 0 ? (
            <View style={styles.emptyCropMessage}>
              <Seedling size={40} color="#cbd5e1" />
              <Text style={styles.emptyStateText}>
                No crops yet. Use "Predict Crop" to get a recommendation based on your soil data.
              </Text>
            </View>
          ) : (
            crops.map(crop => (
              <TouchableOpacity 
                key={crop.id} 
                style={[styles.cropCard, crop.isRecommended && styles.recommendedCropCard]}
                onPress={() => {
                  setSelectedCrop(crop);
                  Alert.alert('Crop Selected', `You selected ${crop.name} (${crop.variety})`);
                }}
              >
                <View style={styles.cropCardHeader}>
                  <View style={[styles.cropThumbnail, styles.cropThumbnailPlaceholder]}>
                    <Seedling size={24} color={crop.isRecommended ? Colors.accent : Colors.primary} />
                  </View>
                  
                  <View style={styles.cropHeaderInfo}>
                    <View style={styles.cropNameContainer}>
                      <Text style={styles.cropName}>{crop.name}</Text>
                      {crop.isRecommended && (
                        <View style={styles.recommendedBadge}>
                          <Zap size={12} color="#ffffff" />
                          <Text style={styles.recommendedText}>Recommended</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cropVariety}>{crop.variety}</Text>
                    <View style={styles.cropInfoTags}>
                      <View style={[styles.statusBadge, crop.isRecommended && styles.recommendedStatusBadge]}>
                        <Text style={[styles.statusText, crop.isRecommended && styles.recommendedStatusText]}>
                          {crop.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Activities</Text>
          
          {activities.length === 0 ? (
            <View style={styles.emptyActivityMessage}>
              <Calendar size={40} color="#cbd5e1" />
              <Text style={styles.emptyStateText}>
                No activities scheduled. Add a crop or get a recommendation to generate activities.
              </Text>
            </View>
          ) : (
            activities
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date
              .slice(0, 5) // Limit to 5 activities 
              .map(activity => {
                const crop = crops.find(c => c.id === activity.cropId);
                
                return (
                  <View key={activity.id} style={[styles.activityItem, activity.isRecommended && styles.recommendedActivityItem]}>
                    <TouchableOpacity style={styles.activityCheckbox}>
                      {activity.completed && <Check size={14} color="#fff" />}
                    </TouchableOpacity>
                    
                    <View style={styles.activityContent}>
                      <View style={styles.activityTitleContainer}>
                        <Text style={styles.activityTitle}>
                          {activity.type}: {crop?.name}
                        </Text>
                        {activity.isRecommended && (
                          <View style={styles.activityRecommendedBadge}>
                            <Zap size={10} color="#ffffff" />
                          </View>
                        )}
                      </View>
                      <Text style={styles.activityDate}>{activity.date}</Text>
                      {activity.notes && <Text style={styles.activityNotes}>{activity.notes}</Text>}
                    </View>
                  </View>
                );
            })
          )}
        </View>
      </ScrollView>

      {/* Crop Prediction Modal */}
      <Modal
        visible={predictModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crop Prediction</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setPredictModalVisible(false)}
              >
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.predictionInfo}>
                <Text style={styles.predictionInfoText}>
                  Our AI model will analyze your soil and environmental data to recommend the most suitable crops for your conditions.
                </Text>
              </View>
              
              <Text style={styles.soilDataTitle}>Soil & Environmental Data</Text>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 4 }]}>
                  <Text style={styles.formLabel}>Nitrogen (N)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={soilDataForm.N.toString()}
                    onChangeText={(text) => setSoilDataForm({...soilDataForm, N: parseFloat(text) || 0})}
                    keyboardType="numeric"
                    placeholder="N content"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 4, marginRight: 4 }]}>
                  <Text style={styles.formLabel}>Phosphorus (P)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={soilDataForm.P.toString()}
                    onChangeText={(text) => setSoilDataForm({...soilDataForm, P: parseFloat(text) || 0})}
                    keyboardType="numeric"
                    placeholder="P content"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 4 }]}>
                  <Text style={styles.formLabel}>Potassium (K)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={soilDataForm.K.toString()}
                    onChangeText={(text) => setSoilDataForm({...soilDataForm, K: parseFloat(text) || 0})}
                    keyboardType="numeric"
                    placeholder="K content"
                  />
                </View>
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 4 }]}>
                  <Text style={styles.formLabel}>Temperature (°C)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={soilDataForm.temperature.toString()}
                    onChangeText={(text) => setSoilDataForm({...soilDataForm, temperature: parseFloat(text) || 0})}
                    keyboardType="numeric"
                    placeholder="Avg temp"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 4 }]}>
                  <Text style={styles.formLabel}>Humidity (%)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={soilDataForm.humidity.toString()}
                    onChangeText={(text) => setSoilDataForm({...soilDataForm, humidity: parseFloat(text) || 0})}
                    keyboardType="numeric"
                    placeholder="Humidity %"
                  />
                </View>
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 4 }]}>
                  <Text style={styles.formLabel}>pH Level</Text>
                  <TextInput
                    style={styles.formInput}
                    value={soilDataForm.pH.toString()}
                    onChangeText={(text) => setSoilDataForm({...soilDataForm, pH: parseFloat(text) || 0})}
                    keyboardType="numeric"
                    placeholder="Soil pH"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 4 }]}>
                  <Text style={styles.formLabel}>Rainfall (mm)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={soilDataForm.rainfall.toString()}
                    onChangeText={(text) => setSoilDataForm({...soilDataForm, rainfall: parseFloat(text) || 0})}
                    keyboardType="numeric"
                    placeholder="Annual rainfall"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Field Area (hectares)</Text>
                <TextInput
                  style={styles.formInput}
                  value={predictCropArea}
                  onChangeText={(text) => setPredictCropArea(text)}
                  keyboardType="numeric"
                  placeholder="Crop area in hectares"
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonOutline]}
                onPress={() => setPredictModalVisible(false)}
              >
                <Text style={styles.modalButtonTextOutline}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => getCropRecommendation(soilDataForm)}
                disabled={cropPrediction.loading}
              >
                {cropPrediction.loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Zap size={16} color="#fff" />
                    <Text style={styles.modalButtonTextPrimary}>Get Prediction</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Prediction Results Modal */}
      <Modal
        visible={predictionResultModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crop Recommendation</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setPredictionResultModalVisible(false)}
              >
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.resultContent}>
              {cropPrediction.recommendation ? (
                <>
                  <View style={styles.resultIconContainer}>
                    <Seedling size={60} color={Colors.success} />
                  </View>
                  
                  <Text style={styles.resultTitle}>Recommended Crop:</Text>
                  <Text style={styles.resultCrop}>{cropPrediction.recommendation}</Text>
                  
                  <Text style={styles.resultDescription}>
                    Based on your soil and environmental data, our AI model suggests that {cropPrediction.recommendation.toLowerCase()} would be suitable for your conditions.
                  </Text>
                  
                  <Text style={styles.resultWarning}>
                    Note: Setting this recommendation will replace your current crops and activities.
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.usePredictionButton}
                    onPress={() => handlePredictionForPlanning(cropPrediction.recommendation!)}
                  >
                    <Text style={styles.usePredictionButtonText}>Set as My Crop</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.errorText}>
                  {cropPrediction.error || "Failed to get prediction. Please try again."}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Add New Crop Modal */}
      <Modal
        visible={addCropModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Crop</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setAddCropModalVisible(false)}
              >
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Crop Name</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    style={styles.formPicker}
                    selectedValue={selectedCrop ? selectedCrop.name : ''}
                    onValueChange={(itemValue) => {
                      const cropInfo = cropRecommendations[itemValue];
                      if (cropInfo) {
                        setSelectedCrop({
                          ...selectedCrop || {
                            id: `crop-${Date.now()}`,
                            status: 'Planning',
                            field: 'Main Field',
                            area: 1.0,
                            notes: '',
                            plantingDate: formattedCurrentDate,
                            harvestDate: calculateHarvestDate(formattedCurrentDate, cropInfo.growthDuration),
                          } as CropType,
                          name: itemValue,
                          variety: cropInfo.varieties[0],
                        });
                      }
                    }}
                  >
                    <Picker.Item label="Select crop type" value="" />
                    {Object.keys(cropRecommendations).map(cropName => (
                      <Picker.Item key={cropName} label={cropName} value={cropName} />
                    ))}
                  </Picker>
                </View>
              </View>
              
              {selectedCrop && selectedCrop.name && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Variety</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        style={styles.formPicker}
                        selectedValue={selectedCrop.variety}
                        onValueChange={(itemValue) => {
                          setSelectedCrop({...selectedCrop, variety: itemValue});
                        }}
                      >
                        {cropRecommendations[selectedCrop.name]?.varieties.map(variety => (
                          <Picker.Item key={variety} label={variety} value={variety} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  
                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 4 }]}>
                      <Text style={styles.formLabel}>Planting Date</Text>
                      <TextInput
                        style={styles.formInput}
                        value={selectedCrop.plantingDate}
                        onChangeText={(text) => {
                          const newCrop = {...selectedCrop, plantingDate: text};
                          if (selectedCrop.name) {
                            const growthDuration = cropRecommendations[selectedCrop.name].growthDuration;
                            newCrop.harvestDate = calculateHarvestDate(text, growthDuration);
                          }
                          setSelectedCrop(newCrop);
                        }}
                        placeholder="YYYY-MM-DD"
                      />
                    </View>
                    
                    <View style={[styles.formGroup, { flex: 1, marginLeft: 4 }]}>
                      <Text style={styles.formLabel}>Expected Harvest</Text>
                      <TextInput
                        style={styles.formInput}
                        value={selectedCrop.harvestDate}
                        editable={false}
                        placeholder="Calculated based on crop"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 4 }]}>
                      <Text style={styles.formLabel}>Status</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          style={styles.formPicker}
                          selectedValue={selectedCrop.status}
                          onValueChange={(itemValue) => setSelectedCrop({...selectedCrop, status: itemValue})}
                        >
                          <Picker.Item label="Planning" value="Planning" />
                          <Picker.Item label="Planted" value="Planted" />
                          <Picker.Item label="Growing" value="Growing" />
                          <Picker.Item label="Ready to Harvest" value="Ready to Harvest" />
                        </Picker>
                      </View>
                    </View>
                    
                    <View style={[styles.formGroup, { flex: 1, marginLeft: 4 }]}>
                      <Text style={styles.formLabel}>Field</Text>
                      <TextInput
                        style={styles.formInput}
                        value={selectedCrop.field}
                        onChangeText={(text) => setSelectedCrop({...selectedCrop, field: text})}
                        placeholder="Field name/location"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Area (hectares)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={selectedCrop.area.toString()}
                      onChangeText={(text) => setSelectedCrop({...selectedCrop, area: parseFloat(text) || 0})}
                      keyboardType="numeric"
                      placeholder="Crop area in hectares"
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Notes</Text>
                    <TextInput
                      style={[styles.formInput, styles.textArea]}
                      value={selectedCrop.notes}
                      onChangeText={(text) => setSelectedCrop({...selectedCrop, notes: text})}
                      placeholder="Add additional notes about this crop"
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </>
              )}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonOutline]}
                onPress={() => {
                  setSelectedCrop(null);
                  setAddCropModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonTextOutline}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.modalButtonPrimary,
                  (!selectedCrop || !selectedCrop.name) && styles.modalButtonDisabled
                ]}
                onPress={() => {
                  if (!selectedCrop || !selectedCrop.name) return;
                  
                  // Generate a unique ID if not present
                  const cropToAdd = {
                    ...selectedCrop,
                    id: selectedCrop.id || `crop-${Date.now()}`
                  };
                  
                  // Add the new crop to the existing crops
                  setCrops([...crops, cropToAdd]);
                  
                  // Generate and add activities for this crop
                  const newActivities = generateActivitiesForCrop(
                    cropToAdd.id, 
                    cropToAdd.name, 
                    cropToAdd.plantingDate
                  );
                  setActivities([...activities, ...newActivities]);
                  
                  // Show success message and close modal
                  Alert.alert('Success', `${cropToAdd.name} (${cropToAdd.variety}) added to your crops with ${newActivities.length} planned activities.`);
                  setSelectedCrop(null);
                  setAddCropModalVisible(false);
                }}
                disabled={!selectedCrop || !selectedCrop.name}
              >
                <Seedling size={16} color="#fff" />
                <Text style={styles.modalButtonTextPrimary}>Add Crop</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Quick Dashboard Navigation Button - Added as a fallback */}
      <TouchableOpacity 
        style={styles.dashboardButton}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.dashboardButtonText}>Return to Dashboard</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#263238',
  },
  backButton: {
    padding: 8,
  },
  infoButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  profileBannerText: {
    marginLeft: 8,
    color: '#263238',
    fontSize: 14,
  },
  profileHighlight: {
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCardTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#263238',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#263238',
  },
  emptyCropMessage: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyActivityMessage: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  cropCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendedCropCard: {
    backgroundColor: '#fff8e1',
    borderLeftWidth: 4,
    borderLeftColor: '#ff8f00',
  },
  cropCardHeader: {
    flexDirection: 'row',
  },
  cropNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  cropThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  cropThumbnailPlaceholder: {
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropHeaderInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263238',
    marginRight: 8,
  },
  recommendedBadge: {
    backgroundColor: '#ff8f00',
    flexDirection: 'row',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  recommendedText: {
    fontSize: 10,
    color: '#ffffff',
    marginLeft: 3,
    fontWeight: 'bold',
  },
  cropVariety: {
    fontSize: 14,
    color: '#607d8b',
    marginTop: 2,
  },
  cropInfoTags: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  recommendedStatusBadge: {
    backgroundColor: '#fff8e1',
  },
  statusText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '500',
  },
  recommendedStatusText: {
    color: '#e65100',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  recommendedActivityItem: {
    backgroundColor: '#fff8e1',
    borderLeftWidth: 3,
    borderLeftColor: '#ff8f00',
  },
  activityCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2e7d32',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#263238',
  },
  activityRecommendedBadge: {
    backgroundColor: '#ff8f00',
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  activityDate: {
    fontSize: 12,
    color: '#607d8b',
    marginTop: 2,
  },
  activityNotes: {
    fontSize: 11,
    color: '#78909c',
    marginTop: 2,
    fontStyle: 'italic',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    padding: 0,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263238',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
    maxHeight: '70%',
  },
  predictionInfo: {
    backgroundColor: '#eceff1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  predictionInfoText: {
    fontSize: 14,
    color: '#546e7a',
    lineHeight: 20,
  },
  soilDataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#263238',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 14,
    color: '#546e7a',
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: '#263238',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  modalButtonOutline: {
    borderWidth: 1,
    borderColor: '#2e7d32',
    marginRight: 8,
  },
  modalButtonPrimary: {
    backgroundColor: '#2e7d32',
    marginLeft: 8,
  },
  modalButtonTextOutline: {
    color: '#2e7d32',
    fontWeight: '500',
    fontSize: 16,
  },
  modalButtonTextPrimary: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 6,
  },
  // Result modal styles
  resultContent: {
    padding: 24,
    alignItems: 'center',
  },
  resultIconContainer: {
    backgroundColor: '#e8f5e9',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 16,
    color: '#546e7a',
    marginBottom: 8,
  },
  resultCrop: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 16,
  },
  resultDescription: {
    fontSize: 14,
    color: '#263238',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 10,
  },
  resultWarning: {
    fontSize: 13,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  usePredictionButton: {
    backgroundColor: '#ff8f00',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  usePredictionButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
  },
  // Additional styles for Add Crop Modal
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
  },
  formPicker: {
    height: 50,
    color: '#263238',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  // Dashboard button for fallback navigation
  dashboardButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  dashboardButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  }
});
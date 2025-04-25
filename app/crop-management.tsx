import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { ChevronLeft, Droplets, Calendar, Scaling as Seedling, Plus, InfoIcon, MapPin, Edit2, Trash2, Filter, SortDesc, Check, X, MoreHorizontal, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Constants from 'expo-constants';

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
  imgUrl?: string;
  soilData?: SoilData;
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
};

// Define the crop management screen component
export default function CropManagementScreen() {
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
  const currentDate = new Date('2025-04-24'); // Using the given date
  const formattedCurrentDate = currentDate.toISOString().split('T')[0];

  // API configuration from app.jsonhttps
  const apiUrl = Constants.expoConfig?.extra?.cropPredictApiUrl || '://crop-predict-api.herokuapp.com/predict';

  // Sample crop data - would be from API in real app
  const [crops, setCrops] = useState<CropType[]>([
    {
      id: '1',
      name: 'Wheat',
      variety: 'Durum',
      plantingDate: '2025-01-10',
      harvestDate: '2025-06-15',
      status: 'Growing',
      field: 'Northern Field',
      area: 5.2,
      notes: 'Good growth, needs regular monitoring for rust',
      lastWatered: '2025-04-22',
      lastFertilized: '2025-04-10',
      imgUrl: 'will put one after',
      soilData: {
        N: 90,
        P: 42,
        K: 43,
        temperature: 22.8,
        humidity: 82,
        pH: 6.5,
        rainfall: 210
      }
    },
    {
      id: '2',
      name: 'Olives',
      variety: 'Picholine Marocaine',
      plantingDate: '2023-03-15',
      harvestDate: '2025-11-20',
      status: 'Growing',
      field: 'Hillside Orchard',
      area: 3.8,
      notes: 'Trees are healthy, plan for pruning next month',
      lastWatered: '2025-04-20',
      lastFertilized: '2025-03-15',
      imgUrl: 'will put one later',
      soilData: {
        N: 78,
        P: 35,
        K: 60,
        temperature: 25.5,
        humidity: 60,
        pH: 7.2,
        rainfall: 150
      }
    },
    {
      id: '3',
      name: 'Tomatoes',
      variety: 'Roma',
      plantingDate: '2025-02-20',
      harvestDate: '2025-05-30',
      status: 'Growing',
      field: 'South Plot',
      area: 1.2,
      notes: 'Some leaf spots observed, monitoring closely',
      lastWatered: '2025-04-23',
      lastFertilized: '2025-04-15',
      imgUrl: 'will put one later',
      soilData: {
        N: 115,
        P: 45,
        K: 50,
        temperature: 26.7,
        humidity: 75,
        pH: 6.8,
        rainfall: 180
      }
    }
  ]);

  // Activities/tasks for crops
  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', cropId: '1', type: 'Watering', date: '2025-04-25', notes: 'Standard irrigation', completed: false },
    { id: '2', cropId: '3', type: 'Fertilizing', date: '2025-04-27', notes: 'Use organic fertilizer', completed: false },
    { id: '3', cropId: '2', type: 'Pruning', date: '2025-04-30', notes: 'Light pruning for better air circulation', completed: false },
  ]);

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

  // Modal states
  const [predictModalVisible, setPredictModalVisible] = useState(false);
  const [predictionResultModalVisible, setPredictionResultModalVisible] = useState(false);
  const [addCropModalVisible, setAddCropModalVisible] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropType | null>(null);

  // Get crop recommendation from API
  const getCropRecommendation = async (soilData: SoilData) => {
    setCropPrediction({ loading: true, error: null, recommendation: null });
    
    try {
      console.log('Sending request to:', apiUrl);
      console.log('With data:', soilData);
      
      const response = await axios.post(apiUrl, soilData);
      console.log('API response:', response.data);
      
      // Handle successful response
      if (response.data && response.data.recommended_crop) {
        setCropPrediction({
          loading: false,
          error: null,
          recommendation: response.data.recommended_crop
        });
        
        // Show prediction result modal
        setPredictModalVisible(false);
        setPredictionResultModalVisible(true);
      } else {
        throw new Error('Invalid response from prediction API');
      }
    } catch (error) {
      console.error('Error getting crop recommendation:', error);
      setCropPrediction({
        loading: false,
        error: 'Failed to get crop recommendation. Please try again.',
        recommendation: null
      });
      
      // Show error message to user
      Alert.alert('Prediction Error', 'Failed to get crop recommendation. Please check your internet connection and try again.');
    }
  };

  // Use crop prediction for planning
  const handlePredictionForPlanning = (crop: string) => {
    Alert.alert('Success', `Added ${crop} to planning based on soil analysis.`);
    setPredictionResultModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
          
          {crops.map(crop => (
            <TouchableOpacity 
              key={crop.id} 
              style={styles.cropCard}
              onPress={() => {
                setSelectedCrop(crop);
                Alert.alert('Crop Selected', `You selected ${crop.name} (${crop.variety})`);
              }}
            >
              <View style={styles.cropCardHeader}>
                {crop.imgUrl ? (
                  <Image 
                    source={{ uri: crop.imgUrl }} 
                    style={styles.cropThumbnail}
                  />
                ) : (
                  <View style={[styles.cropThumbnail, styles.cropThumbnailPlaceholder]}>
                    <Seedling size={24} color={Colors.primary} />
                  </View>
                )}
                
                <View style={styles.cropHeaderInfo}>
                  <Text style={styles.cropName}>{crop.name}</Text>
                  <Text style={styles.cropVariety}>{crop.variety}</Text>
                  <View style={styles.cropInfoTags}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{crop.status}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Activities</Text>
          
          {activities.slice(0, 3).map(activity => {
            const crop = crops.find(c => c.id === activity.cropId);
            
            return (
              <View key={activity.id} style={styles.activityItem}>
                <TouchableOpacity style={styles.activityCheckbox}>
                  {activity.completed && <Check size={14} color="#fff" />}
                </TouchableOpacity>
                
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {activity.type}: {crop?.name}
                  </Text>
                  <Text style={styles.activityDate}>{activity.date}</Text>
                </View>
              </View>
            );
          })}
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
                  
                  <TouchableOpacity
                    style={styles.usePredictionButton}
                    onPress={() => handlePredictionForPlanning(cropPrediction.recommendation!)}
                  >
                    <Text style={styles.usePredictionButtonText}>Use This Recommendation</Text>
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
  cropCardHeader: {
    flexDirection: 'row',
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
  statusText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '500',
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
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#263238',
  },
  activityDate: {
    fontSize: 12,
    color: '#607d8b',
    marginTop: 2,
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
    marginBottom: 20,
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
  }
});
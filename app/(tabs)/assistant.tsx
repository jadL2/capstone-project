import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Zap, FileText, Wheat, BarChart2, Droplets, SendHorizonal, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define type for soil data
type SoilData = {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  pH: number;
  rainfall: number;
};

// Type for chat messages
type Message = {
  id: string;
  type: 'system' | 'user';
  content: string;
  timestamp: Date;
};

// Conversation context type
type ConversationContext = {
  lastRecommendedCrop: string;
  awaitingBusinessPlan: boolean;
  awaitingYieldInfo: boolean;
};

export default function PredictionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'system',
      content: 'Welcome to the Agricultural Assistant! I can help you with crop recommendations, business plans, and yield predictions. What would you like to know?',
      timestamp: new Date(),
    }
  ]);
  
  const [userInput, setUserInput] = useState('');
  const [soilData, setSoilData] = useState<SoilData | null>({
    N: 80,
    P: 40,
    K: 40,
    temperature: 23.5,
    humidity: 70,
    pH: 6.5,
    rainfall: 200
  }); // Default soil data for demonstration
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  
  // Track conversation context
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    lastRecommendedCrop: '',
    awaitingBusinessPlan: false,
    awaitingYieldInfo: false
  });
  
  // Load saved soil data if available
  useEffect(() => {
    const loadSoilData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('soilData');
        if (savedData) {
          setSoilData(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Error loading soil data:', error);
      }
    };
    
    loadSoilData();
  }, []);
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Function to handle sending messages
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Add user message
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: userInput,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // Process user input
    processUserInput(userInput);
    
    // Clear input
    setUserInput('');
  };
  
  // Process user input and generate response
  const processUserInput = async (input: string) => {
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const lowerInput = input.toLowerCase();
      let responseContent = '';
      
      // First check for context-dependent responses
      if (conversationContext.awaitingBusinessPlan && 
          (lowerInput.includes('yes') || lowerInput === 'y' || lowerInput.includes('sure') || lowerInput.includes('ok'))) {
        // User said yes to business plan after crop recommendation
        const crop = conversationContext.lastRecommendedCrop || 'Millet';
        
        // Generate detailed business plan for the recommended crop
        responseContent = `Here's a business plan for ${crop}:\n\n` +
                        `Initial Investment:\n` +
                        `• Land preparation: 5,000-7,000 MAD/hectare\n` +
                        `• Seeds/seedlings: ${crop === 'Millet' ? '2,000-3,000' : '3,000-8,000'} MAD/hectare\n` +
                        `• Basic equipment: 15,000-25,000 MAD\n` +
                        `• Irrigation system: ${crop === 'Millet' ? '20,000-30,000' : '30,000-50,000'} MAD/hectare\n\n` +
                        
                        `Annual Operating Costs:\n` +
                        `• Fertilizer: ${crop === 'Millet' ? '3,000-4,000' : '4,000-6,000'} MAD/hectare\n` +
                        `• Pesticides: ${crop === 'Millet' ? '1,500-2,500' : '2,000-4,000'} MAD/hectare\n` +
                        `• Labor: ${crop === 'Millet' ? '8,000-12,000' : '10,000-20,000'} MAD/hectare\n` +
                        `• Water: ${crop === 'Millet' ? '5,000-8,000' : '7,000-15,000'} MAD/hectare\n\n` +
                        
                        `Revenue Projection:\n` +
                        `• Expected yield: ${crop === 'Millet' ? '2.5-3.5' : '1.8-4.5'} tons/hectare\n` +
                        `• Market price: ${crop === 'Millet' ? '4,000-5,000' : '4,500-7,000'} MAD/ton\n` +
                        `• Annual revenue: ${crop === 'Millet' ? '10,000-17,500' : '8,100-31,500'} MAD/hectare\n\n` +
                        
                        `Financial Summary:\n` +
                        `• Break-even period: ${crop === 'Millet' ? '3-4' : '2-5'} years\n` +
                        `• ROI: ${crop === 'Millet' ? '8-12' : '7-15'}% annually after break-even\n\n` +
                        
                        `Would you like me to open our detailed Business Plan tool to customize these numbers?`;
        
        // Reset the awaiting flag
        setConversationContext(prev => ({...prev, awaitingBusinessPlan: false}));
      }
      else if (conversationContext.awaitingYieldInfo && 
               (lowerInput.includes('yes') || lowerInput === 'y' || lowerInput.includes('sure') || lowerInput.includes('ok'))) {
        // User said yes to yield information
        const crop = conversationContext.lastRecommendedCrop || 'Millet';
        
        responseContent = `Detailed yield information for ${crop} in Morocco:\n\n` +
                        `• National average: ${crop === 'Millet' ? '2.8' : '2.2'} tons/hectare\n` +
                        `• Regional variations:\n` +
                        `  - Marrakech-Safi: ${crop === 'Millet' ? '2.4' : '1.9'} tons/hectare\n` +
                        `  - Casablanca-Settat: ${crop === 'Millet' ? '3.1' : '2.5'} tons/hectare\n` +
                        `  - Fès-Meknès: ${crop === 'Millet' ? '2.9' : '2.3'} tons/hectare\n\n` +
                        `• Production trend: ${crop === 'Millet' ? 'Stable with slight annual increase' : 'Variable, depends heavily on rainfall'}\n\n` +
                        `Would you like to see this data visualized in our Production Data tool?`;
        
        // Reset the awaiting flag
        setConversationContext(prev => ({...prev, awaitingYieldInfo: false}));
      }
      // Then check for keyword-based queries
      else if (lowerInput.includes('recommend') && (lowerInput.includes('crop') || lowerInput.includes('plant'))) {
        if (soilData) {
          // Get crop recommendation based on soil data
          const recommendedCrop = getRecommendedCrop(soilData);
          responseContent = `Based on your soil data (N:${soilData.N}, P:${soilData.P}, K:${soilData.K}, pH:${soilData.pH}), I recommend growing ${recommendedCrop}.\n\nWould you like to see a business plan for this crop?`;
          
          // Set context for follow-up
          setConversationContext({
            lastRecommendedCrop: recommendedCrop,
            awaitingBusinessPlan: true,
            awaitingYieldInfo: false
          });
        } else {
          responseContent = 'To give you a personalized crop recommendation, I need information about your soil. Would you like to enter your soil data now or go to the Crop Management screen?';
        }
      } 
      else if (lowerInput.includes('business') && lowerInput.includes('plan')) {
        const cropName = extractCropName(lowerInput) || (soilData ? getRecommendedCrop(soilData) : 'wheat');
        responseContent = `Here's a business plan summary for ${cropName}:\n\n` +
                        `• Initial Investment: 100,000-120,000 MAD per hectare\n` +
                        `• Annual Revenue (estimated): 45,000-60,000 MAD per hectare\n` +
                        `• Annual Costs: 25,000-35,000 MAD per hectare\n` +
                        `• Expected ROI: 8-15% annually\n` +
                        `• Typical break-even period: 3-5 years\n\n` +
                        `Would you like to create a detailed business plan in our Business Plan tool?`;
        
        // Update context
        setConversationContext(prev => ({
          ...prev, 
          lastRecommendedCrop: cropName
        }));
      }
      else if (lowerInput.includes('yield') || lowerInput.includes('production')) {
        const cropName = extractCropName(lowerInput) || (conversationContext.lastRecommendedCrop || 'wheat');
        responseContent = `Yield data for ${cropName} in Morocco:\n\n` +
                        `• Average yield: 1.2-2.5 tons per hectare\n` +
                        `• Production varies significantly by region\n` +
                        `• Marrakech-Safi region typically yields ${cropName.toLowerCase() === 'olives' ? '1.6' : '1.2'} tons/hectare\n` +
                        `• Production has been ${cropName.toLowerCase() === 'olives' ? 'increasing' : 'variable'} in recent years\n\n` +
                        `Would you like to see detailed production statistics?`;
        
        // Set context for follow-up
        setConversationContext(prev => ({
          ...prev,
          lastRecommendedCrop: cropName,
          awaitingBusinessPlan: false,
          awaitingYieldInfo: true
        }));
      }
      else if (lowerInput.includes('soil') || lowerInput.includes('data')) {
        if (soilData) {
          responseContent = `Your current soil data:\n\n` +
                          `• Nitrogen (N): ${soilData.N} mg/kg\n` +
                          `• Phosphorus (P): ${soilData.P} mg/kg\n` +
                          `• Potassium (K): ${soilData.K} mg/kg\n` +
                          `• pH: ${soilData.pH}\n` +
                          `• Temperature: ${soilData.temperature}°C\n` +
                          `• Humidity: ${soilData.humidity}%\n` +
                          `• Rainfall: ${soilData.rainfall} mm\n\n` +
                          `Would you like me to analyze this soil data or update it in Crop Management?`;
        } else {
          responseContent = `You haven't entered any soil data yet. Would you like to enter soil data now to get personalized crop recommendations?`;
        }
      }
      else if (lowerInput.includes('water') || lowerInput.includes('irrigation')) {
        responseContent = `Water management is crucial for agriculture in Morocco. Here are some options:\n\n` +
                        `• Drip irrigation: Most efficient, saves 30-40% water\n` +
                        `• Sprinkler systems: Good for certain crops, medium efficiency\n` +
                        `• Traditional flooding: Least efficient but lowest initial cost\n\n` +
                        `The optimal choice depends on your crop, soil type, and local water availability. What crop are you planning to grow?`;
      }
      else if (lowerInput === 'yes' || lowerInput === 'y' || lowerInput === 'sure' || lowerInput === 'ok') {
        // Generic yes without clear context
        responseContent = `I'm not sure what you're saying yes to. Could you provide more details about what you'd like to know? I can help with crop recommendations, business planning, yield information, or soil analysis.`;
      }
      else {
        // Default response
        responseContent = `I can help with:\n\n` +
                        `• Crop recommendations based on soil data\n` +
                        `• Business planning and financial projections\n` +
                        `• Yield and production information\n` +
                        `• Water management strategies\n\n` +
                        `What information are you looking for today?`;
      }
      
      // Add system response
      const newSystemMessage: Message = {
        id: `system-${Date.now()}`,
        type: 'system',
        content: responseContent,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newSystemMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to extract crop name from input
  const extractCropName = (input: string): string | null => {
    const cropNames = ['wheat', 'barley', 'olives', 'citrus', 'tomatoes', 'potatoes', 'corn',
                      'rice', 'dates', 'grapes', 'almonds', 'argan', 'sugar beet', 'millet'];
    
    for (const crop of cropNames) {
      if (input.toLowerCase().includes(crop)) {
        // Capitalize first letter
        return crop.charAt(0).toUpperCase() + crop.slice(1);
      }
    }
    
    return null;
  };
  
  // Helper function to recommend crop based on soil data
  const getRecommendedCrop = (data: SoilData): string => {
    if (data.pH > 7.5 && data.temperature > 22 && data.rainfall < 200) {
      return 'Olives';
    } else if (data.N > 90 && data.humidity < 60) {
      return 'Argan';
    } else if (data.temperature > 24) {
      return data.rainfall > 180 ? 'Citrus' : 'Dates';
    } else if (data.N > 70 && data.P > 40) {
      return 'Wheat';
    } else if (data.N < 90 && data.P < 50 && data.K < 50) {
      return 'Millet';
    } else {
      return 'Barley';
    }
  };
  
  // Function to navigate to other screens
  const navigateToScreen = (screen: string) => {
    router.push(screen);
  };
  
  // Function to show the options modal
  const toggleOptionsModal = () => {
    setShowOptionsModal(!showOptionsModal);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Agricultural Assistant',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#263238',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#2e7d32" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={toggleOptionsModal} style={styles.optionsButton}>
              <Zap size={22} color="#2e7d32" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.chatContainer}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Display all messages */}
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.type === 'user' ? styles.userMessageContainer : styles.systemMessageContainer
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.type === 'user' ? styles.userBubble : styles.systemBubble
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.type === 'user' ? styles.userMessageText : styles.systemMessageText
                ]}>
                  {message.content}
                </Text>
                <Text style={[
                  styles.timestamp,
                  message.type === 'user' ? styles.userTimestamp : styles.systemTimestamp
                ]}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))}
          
          {/* Loading indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2e7d32" />
            </View>
          )}
        </ScrollView>
        
        {/* Input section */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Ask about crops, yields, or business plans..."
            placeholderTextColor="#94a3b8"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !userInput.trim() && styles.disabledSendButton
            ]}
            onPress={handleSendMessage}
            disabled={!userInput.trim() || loading}
          >
            <SendHorizonal size={20} color={!userInput.trim() ? "#cbd5e1" : "#ffffff"} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleOptionsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assistant Tools</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={toggleOptionsModal}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  toggleOptionsModal();
                  navigateToScreen('/crop-management');
                }}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#e8f5e9' }]}>
                  <Wheat size={24} color="#2e7d32" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Crop Management</Text>
                  <Text style={styles.optionDescription}>Add crops and view recommendations</Text>
                </View>
                <ChevronRight size={20} color="#94a3b8" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  toggleOptionsModal();
                  navigateToScreen('/business-plan');
                }}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#e3f2fd' }]}>
                  <FileText size={24} color="#1976d2" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Business Plan</Text>
                  <Text style={styles.optionDescription}>Financial projections for your crops</Text>
                </View>
                <ChevronRight size={20} color="#94a3b8" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  toggleOptionsModal();
                  navigateToScreen('/moroccan-production');
                }}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#fff3e0' }]}>
                  <BarChart2 size={24} color="#ef6c00" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Moroccan Production</Text>
                  <Text style={styles.optionDescription}>View agricultural yield statistics</Text>
                </View>
                <ChevronRight size={20} color="#94a3b8" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  toggleOptionsModal();
                  
                  // Add a system message to explain
                  const newSystemMessage: Message = {
                    id: `system-soil-${Date.now()}`,
                    type: 'system',
                    content: 'To update your soil data for better recommendations, please go to the Crop Management screen.',
                    timestamp: new Date(),
                  };
                  
                  setMessages(prev => [...prev, newSystemMessage]);
                }}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#f3e5f5' }]}>
                  <Droplets size={24} color="#7b1fa2" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Update Soil Data</Text>
                  <Text style={styles.optionDescription}>Enter new soil parameters</Text>
                </View>
                <ChevronRight size={20} color="#94a3b8" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    padding: 8,
  },
  optionsButton: {
    padding: 8,
    marginRight: 8,
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  systemMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#2e7d32',
    borderBottomRightRadius: 4,
  },
  systemBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  systemMessageText: {
    color: '#334155',
  },
  timestamp: {
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  systemTimestamp: {
    color: '#94a3b8',
  },
  loadingContainer: {
    padding: 12,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: '#334155',
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSendButton: {
    backgroundColor: '#e2e8f0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#334155',
    lineHeight: 28,
  },
  modalContent: {
    padding: 16,
    maxHeight: '90%',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748b',
  },
});
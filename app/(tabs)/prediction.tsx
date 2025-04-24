import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChartLine as LineChart } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

type CropOption = 'wheat' | 'olives' | 'citrus' | 'vegetables';
type PredictionType = 'yield' | 'price' | 'weather';

type RegionData = {
  [key: string]: {
    crops: CropOption[];
    yieldData: {
      [key in CropOption]: {
        estimate: string;
        previous: string;
        trend: number;
      };
    };
    priceData: {
      [key in CropOption]: {
        current: string;
        forecast30: string;
        forecast90: string;
        trend: number;
      };
    };
  };
};

const regionData: RegionData = {
  'Meknes-Fes': {
    crops: ['wheat', 'olives', 'vegetables'],
    yieldData: {
      wheat: { estimate: '3.5 tons/hectare', previous: '3.2 tons/hectare', trend: 9.4 },
      olives: { estimate: '2.8 tons/hectare', previous: '2.5 tons/hectare', trend: 12 },
      citrus: { estimate: '25 tons/hectare', previous: '23 tons/hectare', trend: 8.7 },
      vegetables: { estimate: '35 tons/hectare', previous: '32 tons/hectare', trend: 9.4 }
    },
    priceData: {
      wheat: { 
        current: '450 MAD/quintal',
        forecast30: '470 MAD/quintal (+4.4%)',
        forecast90: '490 MAD/quintal (+8.9%)',
        trend: 8.9
      },
      olives: {
        current: '35 MAD/kg',
        forecast30: '38 MAD/kg (+8.6%)',
        forecast90: '40 MAD/kg (+14.3%)',
        trend: 14.3
      },
      citrus: {
        current: '8 MAD/kg',
        forecast30: '9 MAD/kg (+12.5%)',
        forecast90: '10 MAD/kg (+25%)',
        trend: 25
      },
      vegetables: {
        current: '12 MAD/kg',
        forecast30: '14 MAD/kg (+16.7%)',
        forecast90: '15 MAD/kg (+25%)',
        trend: 25
      }
    }
  },
  'Souss-Massa': {
    crops: ['citrus', 'vegetables'],
    yieldData: {
      wheat: { estimate: '3.0 tons/hectare', previous: '2.8 tons/hectare', trend: 7.1 },
      olives: { estimate: '2.5 tons/hectare', previous: '2.3 tons/hectare', trend: 8.7 },
      citrus: { estimate: '28 tons/hectare', previous: '25 tons/hectare', trend: 12 },
      vegetables: { estimate: '40 tons/hectare', previous: '36 tons/hectare', trend: 11.1 }
    },
    priceData: {
      wheat: {
        current: '440 MAD/quintal',
        forecast30: '460 MAD/quintal (+4.5%)',
        forecast90: '480 MAD/quintal (+9.1%)',
        trend: 9.1
      },
      olives: {
        current: '33 MAD/kg',
        forecast30: '35 MAD/kg (+6.1%)',
        forecast90: '38 MAD/kg (+15.2%)',
        trend: 15.2
      },
      citrus: {
        current: '7 MAD/kg',
        forecast30: '8 MAD/kg (+14.3%)',
        forecast90: '9 MAD/kg (+28.6%)',
        trend: 28.6
      },
      vegetables: {
        current: '11 MAD/kg',
        forecast30: '13 MAD/kg (+18.2%)',
        forecast90: '14 MAD/kg (+27.3%)',
        trend: 27.3
      }
    }
  },
  'Doukkala-Abda': {
    crops: ['wheat', 'vegetables'],
    yieldData: {
      wheat: { estimate: '3.8 tons/hectare', previous: '3.5 tons/hectare', trend: 8.6 },
      olives: { estimate: '2.6 tons/hectare', previous: '2.4 tons/hectare', trend: 8.3 },
      citrus: { estimate: '24 tons/hectare', previous: '22 tons/hectare', trend: 9.1 },
      vegetables: { estimate: '38 tons/hectare', previous: '35 tons/hectare', trend: 8.6 }
    },
    priceData: {
      wheat: {
        current: '460 MAD/quintal',
        forecast30: '480 MAD/quintal (+4.3%)',
        forecast90: '500 MAD/quintal (+8.7%)',
        trend: 8.7
      },
      olives: {
        current: '34 MAD/kg',
        forecast30: '36 MAD/kg (+5.9%)',
        forecast90: '39 MAD/kg (+14.7%)',
        trend: 14.7
      },
      citrus: {
        current: '7.5 MAD/kg',
        forecast30: '8.5 MAD/kg (+13.3%)',
        forecast90: '9.5 MAD/kg (+26.7%)',
        trend: 26.7
      },
      vegetables: {
        current: '11.5 MAD/kg',
        forecast30: '13.5 MAD/kg (+17.4%)',
        forecast90: '14.5 MAD/kg (+26.1%)',
        trend: 26.1
      }
    }
  }
};

export default function PredictionScreen() {
  const [selectedRegion, setSelectedRegion] = useState<string>('Meknes-Fes');
  const [activeCrop, setActiveCrop] = useState<CropOption>('wheat');
  const [activePrediction, setActivePrediction] = useState<PredictionType>('yield');
  const [isLoading, setIsLoading] = useState(false);

  const handleCropChange = (crop: CropOption) => {
    setIsLoading(true);
    setActiveCrop(crop);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handlePredictionChange = (type: PredictionType) => {
    setIsLoading(true);
    setActivePrediction(type);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const getWeatherImpact = (region: string, soilType: string, waterSource: string) => {
    const impacts = {
      'Meknes-Fes': {
        'Clay': {
          'Rain-fed': 'Moderate risk of waterlogging in heavy rain periods',
          'Irrigation': 'Good water retention, manage irrigation carefully'
        },
        'Loamy': {
          'Rain-fed': 'Optimal conditions for most crops',
          'Irrigation': 'Excellent growing conditions with controlled irrigation'
        },
        'Sandy': {
          'Rain-fed': 'May need supplemental irrigation in dry periods',
          'Irrigation': 'Requires frequent but controlled irrigation'
        }
      }
    };
    
    return impacts[region]?.[soilType]?.[waterSource] || 
      'Weather impact analysis not available for this combination';
  };

  const renderPredictionContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Analyzing agricultural data...</Text>
        </View>
      );
    }

    const regionInfo = regionData[selectedRegion];
    const yieldInfo = regionInfo.yieldData[activeCrop];
    const priceInfo = regionInfo.priceData[activeCrop];

    return (
      <View style={styles.predictionContainer}>
        <View style={styles.chartContainer}>
          <View style={styles.chartPlaceholder}>
            <LineChart size={80} color={Colors.textSecondary} />
            <Text style={styles.chartPlaceholderText}>Prediction Chart</Text>
          </View>
        </View>

        <View style={styles.predictionDetails}>
          <Text style={styles.predictionTitle}>
            {activePrediction === 'yield' && `${activeCrop.charAt(0).toUpperCase() + activeCrop.slice(1)} Yield Prediction`}
            {activePrediction === 'price' && `${activeCrop.charAt(0).toUpperCase() + activeCrop.slice(1)} Price Forecast`}
            {activePrediction === 'weather' && 'Weather Impact Analysis'}
          </Text>

          <View style={styles.predictionData}>
            {activePrediction === 'yield' && (
              <>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Estimated Yield:</Text>
                  <Text style={styles.dataValue}>{yieldInfo.estimate}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Previous Year:</Text>
                  <Text style={styles.dataValue}>{yieldInfo.previous}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Trend:</Text>
                  <Text style={[
                    styles.dataValue,
                    { color: yieldInfo.trend > 0 ? Colors.success : Colors.error }
                  ]}>
                    {yieldInfo.trend > 0 ? '+' : ''}{yieldInfo.trend}%
                  </Text>
                </View>
              </>
            )}

            {activePrediction === 'price' && (
              <>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Current Price:</Text>
                  <Text style={styles.dataValue}>{priceInfo.current}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>30-Day Forecast:</Text>
                  <Text style={styles.dataValue}>{priceInfo.forecast30}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>90-Day Forecast:</Text>
                  <Text style={styles.dataValue}>{priceInfo.forecast90}</Text>
                </View>
              </>
            )}

            {activePrediction === 'weather' && (
              <>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Precipitation:</Text>
                  <Text style={styles.dataValue}>+15% above average</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Temperature:</Text>
                  <Text style={styles.dataValue}>2°C above average</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Soil Moisture:</Text>
                  <Text style={styles.dataValue}>Optimal conditions</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.predictionInsight}>
            <Text style={styles.insightTitle}>Key Insights</Text>
            <Text style={styles.insightText}>
              {activePrediction === 'yield' && 
                `Based on current growing conditions in ${selectedRegion}, ${activeCrop} yields are predicted to be ${yieldInfo.trend}% higher than last year. Soil moisture levels are optimal, and growing degree days are tracking above the 5-year average.`}
              
              {activePrediction === 'price' && 
                `Market analysis for ${activeCrop} in ${selectedRegion} shows a positive trend with a projected ${priceInfo.trend}% increase over the next 90 days. Consider forward contracting options at current favorable prices.`}
              
              {activePrediction === 'weather' && 
                `The 90-day forecast indicates above-average precipitation and slightly higher temperatures. This combination generally favors ${activeCrop} development in ${selectedRegion}, but monitor for increased disease pressure.`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prévisions Agricoles</Text>
      </View>

      <ScrollView>
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Culture:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropSelector}>
            {regionData[selectedRegion].crops.map((crop) => (
              <TouchableOpacity
                key={crop}
                style={[styles.cropOption, activeCrop === crop && styles.activeCropOption]}
                onPress={() => handleCropChange(crop as CropOption)}
              >
                <Text style={[styles.cropText, activeCrop === crop && styles.activeCropText]}>
                  {crop.charAt(0).toUpperCase() + crop.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.predictionTypeContainer}>
          <TouchableOpacity
            style={[styles.predictionTypeOption, activePrediction === 'yield' && styles.activePredictionType]}
            onPress={() => handlePredictionChange('yield')}
          >
            <Text style={[styles.predictionTypeText, activePrediction === 'yield' && styles.activePredictionText]}>
              Rendement
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.predictionTypeOption, activePrediction === 'price' && styles.activePredictionType]}
            onPress={() => handlePredictionChange('price')}
          >
            <Text style={[styles.predictionTypeText, activePrediction === 'price' && styles.activePredictionText]}>
              Prix
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.predictionTypeOption, activePrediction === 'weather' && styles.activePredictionType]}
            onPress={() => handlePredictionChange('weather')}
          >
            <Text style={[styles.predictionTypeText, activePrediction === 'weather' && styles.activePredictionText]}>
              Météo
            </Text>
          </TouchableOpacity>
        </View>

        {renderPredictionContent()}
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
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  filterContainer: {
    padding: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  cropSelector: {
    flexDirection: 'row',
  },
  cropOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeCropOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cropText: {
    fontSize: 14,
    color: Colors.text,
  },
  activeCropText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  predictionTypeContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
  },
  predictionTypeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activePredictionType: {
    borderBottomColor: Colors.primary,
  },
  predictionTypeText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  activePredictionText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  predictionContainer: {
    padding: 16,
  },
  chartContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: 16,
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  predictionDetails: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  predictionData: {
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dataLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  predictionInsight: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});
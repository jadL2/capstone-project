import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { ChevronLeft, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';

type Region = 'Meknes-Fes' | 'Souss-Massa' | 'Doukkala-Abda';
type SoilType = 'Clay' | 'Loamy' | 'Sandy';
type WaterSource = 'Rain-fed' | 'Irrigation';

export default function ProfileScreen() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedSoilType, setSelectedSoilType] = useState<SoilType | null>(null);
  const [selectedWaterSource, setWaterSource] = useState<WaterSource | null>(null);

  const regions: Region[] = ['Meknes-Fes', 'Souss-Massa', 'Doukkala-Abda'];
  const soilTypes: SoilType[] = ['Clay', 'Loamy', 'Sandy'];
  const waterSources: WaterSource[] = ['Rain-fed', 'Irrigation'];

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
          <View style={styles.optionsContainer}>
            {regions.map((region) => (
              <Pressable
                key={region}
                style={[
                  styles.optionButton,
                  selectedRegion === region && styles.selectedOption
                ]}
                onPress={() => setSelectedRegion(region)}
              >
                <Text style={[
                  styles.optionText,
                  selectedRegion === region && styles.selectedOptionText
                ]}>{region}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soil Type</Text>
          <View style={styles.optionsContainer}>
            {soilTypes.map((soilType) => (
              <Pressable
                key={soilType}
                style={[
                  styles.optionButton,
                  selectedSoilType === soilType && styles.selectedOption
                ]}
                onPress={() => setSelectedSoilType(soilType)}
              >
                <Text style={[
                  styles.optionText,
                  selectedSoilType === soilType && styles.selectedOptionText
                ]}>{soilType}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Water Source</Text>
          <View style={styles.optionsContainer}>
            {waterSources.map((source) => (
              <Pressable
                key={source}
                style={[
                  styles.optionButton,
                  selectedWaterSource === source && styles.selectedOption
                ]}
                onPress={() => setWaterSource(source)}
              >
                <Text style={[
                  styles.optionText,
                  selectedWaterSource === source && styles.selectedOptionText
                ]}>{source}</Text>
              </Pressable>
            ))}
          </View>
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
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 4,
  },
  selectedOption: {
    backgroundColor: '#F0F7F0',
  },
  optionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
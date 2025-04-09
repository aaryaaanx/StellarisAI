import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HowStellarisWorksScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={styles.navLeft}>
          <MaterialIcons name="arrow-back" size={32} color="#A855F7" />
          <Text style={styles.navTitle}>Back to Home</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
      >
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          {/* Page Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>
              How Stellaris<Text style={styles.gradientText}>AI</Text> Works
            </Text>
            <Text style={styles.subtitle}>3 Simple Steps to Your Personal Career AI</Text>
          </View>

          {/* First Row: Existing Steps */}
          <View style={styles.stepsContainer}>
            {/* Step 1: Provide Career Context */}
            <View style={styles.stepCard}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="upload-file" size={24} color="#A855F7" />
              </View>
              <Text style={styles.stepTitle}>Provide Career Context</Text>
              <Text style={styles.stepDescription}>
                Provide career context through dialogue by detailing your experience, past roles and projects, and articulating your skills.
              </Text>
            </View>

            {/* Step 2: Model Fine-Tuning */}
            <View style={styles.stepCard}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="tune" size={24} color="#A855F7" />
              </View>
              <Text style={styles.stepTitle}>Model Fine-Tuning</Text>
              <Text style={styles.stepDescription}>
                Our system uses Llama 3 to create a personalized AI trained specifically on your data.
              </Text>
              {/* Document Visuals */}
              <View style={styles.documentContainer}>
                <View style={[styles.document, { top: 0, left: 0, transform: [{ rotate: '-10deg' }] }]}>
                  <MaterialIcons name="description" size={16} color="#A855F7" />
                </View>
                <View style={[styles.document, { top: 10, left: 20, transform: [{ rotate: '5deg' }] }]}>
                  <MaterialIcons name="description" size={16} color="#A855F7" />
                </View>
                <View style={[styles.document, { top: 0, left: 40, transform: [{ rotate: '15deg' }] }]}>
                  <MaterialIcons name="description" size={16} color="#A855F7" />
                </View>
              </View>
            </View>

            {/* Step 3: Chat with Your Assistant Instantly */}
            <View style={styles.stepCard}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="chat" size={24} color="#A855F7" />
              </View>
              <Text style={styles.stepTitle}>Chat with Your Assistant Instantly</Text>
              <Text style={styles.stepDescription}>
                Interact with your personalized assistant right after training.
              </Text>
            </View>
          </View>

          {/* Second Row: New Steps */}
          <View style={[styles.stepsContainer, { marginTop: 20 }]}>
            {/* Step 4: Download Your Custom Dataset */}
            <View style={styles.stepCard}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="download" size={24} color="#A855F7" />
              </View>
              <Text style={styles.stepTitle}>Download Your Custom Dataset</Text>
              <Text style={styles.stepDescription}>
                Export the dataset you've created through your interactions for further use or analysis.
              </Text>
            </View>

            {/* Step 5: Download Your Custom Model */}
            <View style={styles.stepCard}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="cloud-download" size={24} color="#A855F7" />
              </View>
              <Text style={styles.stepTitle}>Download Your Custom Model</Text>
              <Text style={styles.stepDescription}>
                Obtain your fine-tuned AI model to integrate into your own applications or workflows.
              </Text>
            </View>

            {/* Step 6: Deploy Your Model in Any Cloud Platform */}
            <View style={styles.stepCard}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="cloud-upload" size={24} color="#A855F7" />
              </View>
              <Text style={styles.stepTitle}>Deploy Your Model in Any Cloud Platform</Text>
              <Text style={styles.stepDescription}>
                Easily deploy your model to any cloud platform for scalable and accessible AI solutions.
              </Text>
            </View>
          </View>

          {/* Additional padding to ensure scrollability */}
          <View style={{ height: 80 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  gradientText: {
    color: '#A855F7',
  },
  subtitle: {
    fontSize: 18,
    color: '#C084FC',
    marginTop: 10,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  stepCard: {
    width: SCREEN_WIDTH * 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 16,
  },
  documentContainer: {
    marginTop: 10,
    width: 80,
    height: 40,
    position: 'relative',
  },
  document: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
});

export default HowStellarisWorksScreen;
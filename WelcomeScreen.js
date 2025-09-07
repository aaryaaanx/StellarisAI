import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  Animated, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  PanResponder 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const navAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(5)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(navAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, []);

  const SparklesCore = ({ particleDensity = 100, minSize = 9.8, maxSize = 10.1, particleColor = '#EC4899' }) => {
    const [dimensions, setDimensions] = useState({ width, height });
    const [touchPosition, setTouchPosition] = useState({ x: -1, y: -1 });

    const particles = useRef(
      Array.from({ length: particleDensity }).map(() => ({
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        size: Math.random() * (maxSize - minSize) + minSize,
        speedX: Math.random() * 0.5 - 0.30,
        speedY: Math.random() * 0.5 - 0.25,
      }))
    ).current;

    useEffect(() => {
      const subscription = Dimensions.addEventListener('change', () => {
        const newDimensions = Dimensions.get('window');
        setDimensions(newDimensions);
        particles.forEach(particle => {
          particle.x.setValue(Math.random() * newDimensions.width);
          particle.y.setValue(Math.random() * newDimensions.height);
        });
      });
      return () => subscription?.remove();
    }, []);

    const panResponder = useMemo(() => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => setTouchPosition({ x: gestureState.moveX, y: gestureState.moveY }),
      onPanResponderRelease: () => setTouchPosition({ x: -1, y: -1 }),
    }), []);

    useEffect(() => {
      let animationFrameId;
      const animate = () => {
        particles.forEach(particle => {
          Animated.parallel([
            Animated.timing(particle.x, { toValue: particle.x._value + particle.speedX, duration: 16, useNativeDriver: true }),
            Animated.timing(particle.y, { toValue: particle.y._value + particle.speedY, duration: 16, useNativeDriver: true }),
          ]).start(() => {
            particle.x.setValue(particle.x._value > dimensions.width ? 0 : 
                              particle.x._value < 0 ? dimensions.width : particle.x._value);
            particle.y.setValue(particle.y._value > dimensions.height ? 0 : 
                              particle.y._value < 0 ? dimensions.height : particle.y._value);

            if (touchPosition.x !== -1 && touchPosition.y !== -1) {
              const dx = touchPosition.x - particle.x._value;
              const dy = touchPosition.y - particle.y._value;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < 100) {
                const angle = Math.atan2(dy, dx);
                particle.x.setValue(particle.x._value - Math.cos(angle));
                particle.y.setValue(particle.y._value - Math.sin(angle));
              }
            }
          });
        });
        animationFrameId = requestAnimationFrame(animate);
      };

      animationFrameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrameId);
    }, [touchPosition, dimensions]);

    return (
      <View style={styles.sparklesContainer} {...panResponder.panHandlers}>
        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                transform: [{ translateX: particle.x }, { translateY: particle.y }],
                width: particle.size,
                height: particle.size,
                backgroundColor: particleColor,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const FeatureCard = ({ icon, title, description }) => (
    <View style={styles.featureCard}>
      <MaterialIcons name={icon} size={40} color="#A855F7" style={styles.featureIcon} />
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );

  const FloatingPaper = ({ count = 5 }) => {
    const [dimensions, setDimensions] = useState({ width, height });
    const papers = useRef(
      Array.from({ length: count }).map(() => ({
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        rotate: new Animated.Value(0),
      }))
    ).current;

    useEffect(() => {
      const subscription = Dimensions.addEventListener('change', () => 
        setDimensions(Dimensions.get('window'))
      );
      return () => subscription?.remove();
    }, []);

    useEffect(() => {
      papers.forEach(paper => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(paper.x, { toValue: Math.random() * dimensions.width, duration: 20000 + Math.random() * 10000, useNativeDriver: true }),
              Animated.timing(paper.x, { toValue: Math.random() * dimensions.width, duration: 20000 + Math.random() * 10000, useNativeDriver: true }),
              Animated.timing(paper.x, { toValue: Math.random() * dimensions.width, duration: 20000 + Math.random() * 10000, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(paper.y, { toValue: Math.random() * dimensions.height, duration: 20000 + Math.random() * 10000, useNativeDriver: true }),
              Animated.timing(paper.y, { toValue: Math.random() * dimensions.height, duration: 20000 + Math.random() * 10000, useNativeDriver: true }),
              Animated.timing(paper.y, { toValue: Math.random() * dimensions.height, duration: 20000 + Math.random() * 10000, useNativeDriver: true }),
            ]),
            Animated.timing(paper.rotate, { toValue: 360, duration: 20000 + Math.random() * 10000, useNativeDriver: true }),
          ])
        ).start();
      });
    }, [dimensions]);

    return (
      <View style={styles.floatingPaperContainer}>
        {papers.map((paper, i) => (
          <Animated.View
            key={i}
            style={[
              styles.floatingPaper,
              {
                transform: [
                  { translateX: paper.x },
                  { translateY: paper.y },
                  { rotate: paper.rotate.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
                ],
              },
            ]}
          >
            <MaterialIcons name="description" size={32} color="rgba(168, 85, 247, 0.5)" />
          </Animated.View>
        ))}
      </View>
    );
  };

  const handleButtonPressIn = useMemo(() => () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 200, useNativeDriver: true }),
      Animated.timing(shadowAnim, { toValue: 10, duration: 200, useNativeDriver: false }),
      Animated.timing(colorAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  }, []);

  const handleButtonPressOut = useMemo(() => () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(shadowAnim, { toValue: 5, duration: 200, useNativeDriver: false }),
      Animated.timing(colorAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  }, []);

  const animatedBackgroundColor = useMemo(() => colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#A855F7', '#C084FC'],
  }), []);

  return (
    <View style={styles.container}>
      <View style={styles.sparklesWrapper}>
        <SparklesCore particleDensity={100} minSize={0.6} maxSize={1.4} particleColor="#EC4899" />
      </View>

      <View style={styles.floatingPaperWrapper}>
        <FloatingPaper count={6} />
      </View>

      <Animated.View style={[styles.navbar, { transform: [{ translateY: navAnim }] }]}>
        <TouchableOpacity onPress={() => navigation.replace('Home')} style={styles.navLeft}>
          <MaterialIcons name="android" size={32} color="#A855F7" />
          <Text style={styles.navTitle}>Stellaris<Text style={styles.gradientText}>AI</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('HowStellarisWorks')} 
          style={styles.navRight}
        >
          <Text style={styles.navLink}>How StellarisAI Works</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContainer, { minHeight: height, flexGrow: 1 }]}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
          <View style={styles.mainTitleContainer}>
            <Text style={styles.mainTitle}>Stellaris<Text style={styles.gradientText}>AI</Text></Text>
          </View>
          <Text style={styles.title}>
            Your Personalized {' '}
            <Text style={styles.titleGradient}>AI for Smart Hiring
            </Text>
          </Text>
          <Text style={styles.subtitle}>Create Your Custom Career Assistant</Text>
          <Text style={styles.description}>
            Create your custom career assistant by transforming your career data into a powerful AI that answers recruitment questions with precision and personalization.
          </Text>
        </Animated.View>

        <View style={styles.featuresContainer}>
          <FeatureCard 
            icon="upload-file" 
            title="Provide Career Context" 
            description="Provide career context through dialogue by detailing your experience, describing past roles and projects, and articulating your skills and professional objectives." 
          />
          <FeatureCard 
            icon="model-training" 
            title="Model Fine-Tuning" 
            description="Our system uses Llama 3 to create a personalized AI trained specifically on your data." 
          />
          <FeatureCard 
            icon="chat-bubble-outline" 
            title="Chat with Your Assistant Instantly" 
            description="Interact with your personalized assistant right after training." 
          />
        </View>

        <Animated.View style={[styles.buttonContainer, { opacity: buttonAnim }]}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Questions')}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
          >
            <Animated.View
              style={[
                styles.button,
                {
                  backgroundColor: animatedBackgroundColor,
                  transform: [{ scale: scaleAnim }],
                  shadowOpacity: shadowAnim.interpolate({ inputRange: [5, 10], outputRange: [0.2, 0.4] }),
                  elevation: shadowAnim,
                },
              ]}
            >
              <MaterialIcons name="description" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Start Fine-Tuning</Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  sparklesWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  gradientText: {
    color: '#A855F7',
  },
  sparklesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  floatingPaperWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  floatingPaperContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingPaper: {
    position: 'absolute',
    width: 64,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  navRight: {
    padding: 10,
  },
  navTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  navLink: {
    color: '#A855F7',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainTitleContainer: {
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 5,
    marginBottom: 15,
    // backgroundColor: '#000000',
  },
  mainTitle: {
    fontSize: 58,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    // textShadowColor: 'rgba(255, 255, 255, 0.5)',
    // textShadowOffset: { width: 0, height: 0 },
    // textShadowRadius: 10,
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  titleGradient: {
    color: '#A855F7',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    color: '#EC4899',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    color: '#D1D5DB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 600,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    width: '100%',
    paddingHorizontal: 10,
  },
  featureCard: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  featureIcon: {
    marginBottom: 15,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  featureDescription: {
    color: '#D1D5DB',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default Home;

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Animated, 
  Dimensions, 
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';

const questions = [
  "Enter your name: ",
  "Enter your address: ",
  "Enter your hometown: ",
  "Where did you complete your 10th grade? ",
  "How many subjects in 10th grade? ",
  "Subjects in 10th grade (comma-separated): ",
  "Total score in 10th grade: ",
  "Where did you complete your 12th grade? ",
  "How many subjects in 12th grade? ",
  "Subjects in 12th grade (comma-separated): ",
  "Total score in 12th grade: ",
  "Where are you pursuing your Bachelor's? ",
  "What's your Bachelor's specialization? ",
  "Completed your Bachelor's? (yes/no): ",
  "What is your current semester? ",
  "What is your current CGPA? ",
  "Tech stacks you're comfortable with (comma-separated): ",
  "Enter your Skills (comma-separated): ",
  "How many projects do you want to add? ",
  "How many certificates do you want to add? ",
];

const { width, height } = Dimensions.get('window');

const QuestionScreen = ({ navigation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState('');
  const [dynamicQuestions, setDynamicQuestions] = useState([]);
  const [isProcessingDynamicQuestions, setIsProcessingDynamicQuestions] = useState(false);
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false);
  const [yesNoAnswer, setYesNoAnswer] = useState(null);
  const [yearSelected, setYearSelected] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const navAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(navAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleNext = useCallback(() => {
    if (allQuestionsCompleted) {
      submitForm(answers);
      return;
    }
    
    let currentValue = input;
    const currentQuestion = isProcessingDynamicQuestions ? dynamicQuestions[0] : questions[currentQuestionIndex];
    
    if (currentQuestion === "Completed your Bachelor's? (yes/no): ") {
      if (yesNoAnswer === null) {
        Alert.alert("Required Field", "Please select Yes or No");
        return;
      }
      currentValue = yesNoAnswer ? "Yes" : "No";
    } 
    else if (isProcessingDynamicQuestions && dynamicQuestions[0].includes("Enter year of completion")) {
      if (yearSelected === '') {
        Alert.alert("Required Field", "Please select a year");
        return;
      }
      currentValue = yearSelected;
    }
    else if (currentValue.trim() === '' && !currentQuestion.includes("Enter year of completion")) {
      Alert.alert("Required Field", "This field cannot be empty");
      return;
    }
    
    let updatedAnswers = { ...answers, [currentQuestion]: currentValue };
    setAnswers(updatedAnswers);
    
    if (!isProcessingDynamicQuestions) {
      if (questions[currentQuestionIndex] === "How many projects do you want to add? ") {
        const numProjects = parseInt(currentValue) || 0;
        const projectQuestions = [];
        for (let i = 0; i < numProjects; i++) {
          projectQuestions.push(`Enter name of project ${i + 1}: `);
          projectQuestions.push(`Enter description for project ${i + 1}: `);
        }
        
        if (projectQuestions.length > 0) {
          setDynamicQuestions(projectQuestions);
          setIsProcessingDynamicQuestions(true);
          setInput('');
          setYesNoAnswer(null);
          return;
        }
      } else if (questions[currentQuestionIndex] === "How many certificates do you want to add? ") {
        const numCertificates = parseInt(currentValue) || 0;
        const certificateQuestions = [];
        for (let i = 0; i < numCertificates; i++) {
          certificateQuestions.push(`Enter name of certificate ${i + 1}: `);
          certificateQuestions.push(`Enter issuing organization for certificate ${i + 1}: `);
          certificateQuestions.push(`Enter year of completion for certificate ${i + 1}: `);
        }
        
        if (certificateQuestions.length > 0) {
          setDynamicQuestions(certificateQuestions);
          setIsProcessingDynamicQuestions(true);
          setInput('');
          setYesNoAnswer(null);
          return;
        } else {
          setAllQuestionsCompleted(true);
          setInput('');
          setYesNoAnswer(null);
          return;
        }
      }
      
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
        setInput('');
        setYesNoAnswer(null);
        setYearSelected('');
      } else {
        setAllQuestionsCompleted(true);
        setInput('');
        setYesNoAnswer(null);
      }
    } else {
      const updatedDynamicQuestions = [...dynamicQuestions];
      updatedDynamicQuestions.shift();
      
      if (updatedDynamicQuestions.length > 0) {
        setDynamicQuestions(updatedDynamicQuestions);
        setInput('');
        setYearSelected('');
        setYesNoAnswer(null);
      } else {
        setIsProcessingDynamicQuestions(false);
        
        if (currentQuestionIndex === questions.length - 1 || 
            questions[currentQuestionIndex] === "How many certificates do you want to add? ") {
          setAllQuestionsCompleted(true);
        } else {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
        
        setInput('');
        setYesNoAnswer(null);
        setYearSelected('');
      }
    }
  }, [
    allQuestionsCompleted, 
    answers, 
    input, 
    isProcessingDynamicQuestions, 
    currentQuestionIndex, 
    dynamicQuestions, 
    yesNoAnswer, 
    yearSelected
  ]);

  const submitForm = useCallback((finalAnswers) => {
    navigation.navigate('Loading', { data: finalAnswers });
  }, [navigation]);

  const currentQuestion = useMemo(() => 
    isProcessingDynamicQuestions ? dynamicQuestions[0] : questions[currentQuestionIndex],
    [isProcessingDynamicQuestions, dynamicQuestions, currentQuestionIndex]
  );

  const SparklesCore = useCallback(({ particleDensity = 100, minSize = 0.6, maxSize = 1.4, particleColor = '#EC4899' }) => {
    const [dimensions, setDimensions] = useState({ width, height });
    const [touchPosition, setTouchPosition] = useState({ x: -1, y: -1 });

    const particles = useRef(
      Array.from({ length: particleDensity }).map(() => ({
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        size: Math.random() * (maxSize - minSize) + minSize,
        speedX: Math.random() * 0.5 - 0.25,
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
  }, []);

  const RoboAnimation = useCallback(() => {
    const floatAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -20, duration: 2000, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 0.8, duration: 2000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.5, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    }, []);

    return (
      <View style={styles.roboContainer}>
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowAnim,
              transform: [{ scale: glowAnim.interpolate({ inputRange: [0.5, 0.8], outputRange: [1, 1.2] }) }],
            },
          ]}
        />
        <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
          <MaterialIcons name="android" size={128} color="#A855F7" />
        </Animated.View>
      </View>
    );
  }, []);

  const renderFinalReview = useCallback(() => (
    <View style={styles.reviewContainer}>
      <Text style={styles.reviewTitle}>All Information Collected</Text>
      <Text style={styles.reviewText}>
        You've completed all the questions. Click "Fine tune" to process your information.
      </Text>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {isSubmitting && <ActivityIndicator size="large" color="#A855F7" />}
    </View>
  ), [errorMessage, isSubmitting]);

  const years = [];
  for (let i = 2010; i <= 2025; i++) {
    years.push(i.toString());
  }

  const renderInputField = () => {
    if (currentQuestion === "Completed your Bachelor's? (yes/no): ") {
      return (
        <View style={styles.yesNoContainer}>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              yesNoAnswer === true && styles.selectedButton
            ]}
            onPress={() => setYesNoAnswer(true)}
          >
            <Text style={[
              styles.yesNoButtonText,
              yesNoAnswer === true && styles.selectedButtonText
            ]}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              yesNoAnswer === false && styles.selectedButton
            ]}
            onPress={() => setYesNoAnswer(false)}
          >
            <Text style={[
              styles.yesNoButtonText,
              yesNoAnswer === false && styles.selectedButtonText
            ]}>No</Text>
          </TouchableOpacity>
        </View>
      );
    }
    else if (isProcessingDynamicQuestions && currentQuestion.includes("Enter year of completion")) {
      return (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={yearSelected}
            style={styles.picker}
            onValueChange={(itemValue) => setYearSelected(itemValue)}
            dropdownIconColor="#A855F7"
          >
            <Picker.Item label="Select Year" value="" color="#A855F7" />
            {years.map((year) => (
              <Picker.Item key={year} label={year} value={year} color="#D1D5DB" />
            ))}
          </Picker>
        </View>
      );
    }
    else {
      return (
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your answer..."
          placeholderTextColor="#D1D5DB"
          keyboardType={
            currentQuestion === "What is your current CGPA? " ? "decimal-pad" :
            currentQuestion === "What is your current semester? " ? "number-pad" :
            "default"
          }
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sparklesWrapper}>
        <SparklesCore />
      </View>

      <Animated.View style={[styles.navbar, { transform: [{ translateY: navAnim }] }]}>
        <TouchableOpacity onPress={() => navigation.replace('Home')} style={styles.navLeft}>
          <MaterialIcons name="android" size={32} color="#A855F7" />
          <Text style={styles.navTitle}>StellarisAI</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {allQuestionsCompleted ? renderFinalReview() : (
            <>
              <Text style={styles.questionText}>{currentQuestion}</Text>
              {renderInputField()}
            </>
          )}
          
          <Animated.View style={[styles.buttonContainer, { opacity: buttonAnim }]}>
            <TouchableOpacity
              style={[styles.button, styles.nextButton]}
              onPress={handleNext}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {allQuestionsCompleted ? 'Fine tune' : 'Next'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      <View style={styles.roboWrapper}>
        <RoboAnimation />
      </View>
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
  sparklesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  roboWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 200,
    height: 200,
    zIndex: 1,
  },
  roboContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 160,
    height: 160,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 80,
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
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 28,
    color: '#A855F7',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#A855F7',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    elevation: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#A855F7',
  },
  buttonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  reviewContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  reviewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A855F7',
    marginBottom: 10,
    textAlign: 'center',
  },
  reviewText: {
    fontSize: 18,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EC4899',
    textAlign: 'center',
    marginTop: 10,
  },
  yesNoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  yesNoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  selectedButton: {
    backgroundColor: '#A855F7',
    borderColor: '#A855F7',
  },
  yesNoButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedButtonText: {
    color: '#FFFFFF',
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  picker: {
    width: '100%',
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    height: 50,
  },
});

export default QuestionScreen;
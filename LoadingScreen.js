import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Modal, 
  Animated, 
  Easing, 
  Dimensions, 
  PanResponder 
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const BASE_URL = 'https://4639-34-16-193-247.ngrok-free.app';
const { width, height } = Dimensions.get('window');

const LoadingScreen = ({ route, navigation }) => {
  const [status, setStatus] = useState('dataset_creation');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { data } = route.params;
  const pollingIntervalRef = useRef(null);
  
  // Animation values
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  console.log('Data received in LoadingScreen:', data);

  // Setup animations
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    if (isDownloading) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ])
      );
      
      spinAnimation.start();
      pulseAnimation.start();
      
      return () => {
        spinAnimation.stop();
        pulseAnimation.stop();
      };
    }
  }, [isDownloading, spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const checkConnectivity = async () => {
    try {
      const pingResponse = await axios.get(`${BASE_URL}/ping`, { timeout: 5000 });
      setDebugInfo(`Ping response: ${JSON.stringify(pingResponse.data)}`);
      return true;
    } catch (error) {
      setDebugInfo(`Ping error: ${error.message}`);
      return false;
    }
  };

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    let retryCount = 0;
    const maxRetries = 5;
    const baseDelay = 2000;

    const pollWithBackoff = async () => {
      try {
        console.log('Polling progress endpoint...');
        const progressResponse = await axios.get(`${BASE_URL}/progress`, { 
          timeout: 10000,
          headers: { 'ngrok-skip-browser-warning': 'true' },
        });
        console.log('Progress response:', progressResponse.data);
        setDebugInfo(`Latest progress: ${JSON.stringify(progressResponse.data)}`);
        
        retryCount = 0;
        const progressData = progressResponse.data;
        setProgress(progressData.progress || 0);
        
        if (progressData.status === "completed") {
          console.log("Training completed! Status is 'completed'");
          clearInterval(pollingIntervalRef.current);
          setStatus('finetuning_success');
          try {
            console.log("Attempting to load model...");
            const loadResponse = await axios.post(`${BASE_URL}/load_model`);
            console.log('Model load response:', loadResponse.data);
            Alert.alert('Success', 'Model training and loading completed successfully');
          } catch (loadError) {
            console.error('Error loading model:', loadError);
            setError(`Failed to load model: ${loadError.message}`);
            setStatus('error');
          }
        } else if (progressData.status === "error") {
          console.error("Received error status from backend:", progressData.message);
          clearInterval(pollingIntervalRef.current);
          setError(`Training error: ${progressData.message || 'Unknown error'}`);
          setStatus('error');
        } else if (progressData.status === "training") {
          console.log(`Training in progress: ${progressData.progress}%`);
          setStatus('finetuning');
        }
      } catch (error) {
        console.error('Error polling progress:', error);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          clearInterval(pollingIntervalRef.current);
          setError(`Failed to get training progress after ${maxRetries} attempts: ${error.message}`);
          setStatus('error');
        } else {
          console.log(`Retry ${retryCount}/${maxRetries} for progress polling`);
          setDebugInfo(`Retry ${retryCount}/${maxRetries}: ${error.message}`);
        }
      }
    };

    pollWithBackoff();
    pollingIntervalRef.current = setInterval(pollWithBackoff, baseDelay);
    console.log('Started progress polling');
  };

  useEffect(() => {
    const handleProcess = async () => {
      try {
        const connected = await checkConnectivity();
        if (!connected) {
          throw new Error('Cannot connect to backend server');
        }

        setStatus('dataset_creation');
        const datasetResponse = await axios.post(`${BASE_URL}/generate_dataset`, data, {
          timeout: 30000,
          headers: { 'ngrok-skip-browser-warning': 'true' },
        });
        console.log('Dataset response:', datasetResponse.data);
        
        if (datasetResponse.data.status === 'completed') {
          setStatus('dataset_success');
          Alert.alert('Success', 'Dataset creation completed successfully');
        } else {
          throw new Error('Dataset creation did not complete: ' + 
                         (datasetResponse.data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error during dataset creation:', error);
        setError(`Dataset creation failed: ${error.message}`);
        setStatus('error');
      }
    };

    handleProcess();
  }, [data]);

  const startFineTuning = async () => {
    try {
      const connected = await checkConnectivity();
      if (!connected) {
        throw new Error('Cannot connect to backend server');
      }

      setStatus('finetuning');
      setProgress(0);
      
      const trainResponse = await axios.post(`${BASE_URL}/train_model`, {}, {
        timeout: 15000,
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      console.log('Train model response:', trainResponse.data);
      
      if (trainResponse.data.success) {
        Alert.alert('Training Started', 'Model fine-tuning has been initiated');
        startPolling();
      } else {
        throw new Error('Training initialization failed: ' + 
                       (trainResponse.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error initiating fine-tuning:', error);
      setError(`Failed to start training: ${error.message}`);
      setStatus('error');
    }
  };

  const handleChatButtonPress = () => {
    navigation.navigate('Chat');
  };

  const handleRetry = () => {
    setError(null);
    
    if (status === 'error') {
      if (progress > 0) {
        startPolling();
      } else {
        setStatus('dataset_creation');
        const handleProcess = async () => {
          try {
            const datasetResponse = await axios.post(`${BASE_URL}/generate_dataset`, data, {
              headers: { 'ngrok-skip-browser-warning': 'true' },
            });
            if (datasetResponse.data.status === 'completed') {
              setStatus('dataset_success');
            }
          } catch (error) {
            setError(`Retry failed: ${error.message}`);
            setStatus('error');
          }
        };
        handleProcess();
      }
    }
  };

  const forceCheckProgress = async () => {
    try {
      setDebugInfo('Checking progress...');
      const progressResponse = await axios.get(`${BASE_URL}/progress`, { 
        timeout: 5000,
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      const progressData = progressResponse.data;
      
      setDebugInfo(`Status: ${progressData.status}, Progress: ${progressData.progress}%, Timestamp: ${new Date().toLocaleTimeString()}`);
      
      if (progressData.status === "completed") {
        setStatus('finetuning_success');
        Alert.alert(
          'Training Complete',
          'The backend reports that training is complete. Loading model now...',
          [
            {
              text: 'OK',
              onPress: async () => {
                try {
                  const loadResponse = await axios.post(`${BASE_URL}/load_model`);
                  Alert.alert('Success', 'Model loaded successfully');
                } catch (error) {
                  Alert.alert('Error', `Failed to load model: ${error.message}`);
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Current Progress',
          `Status: ${progressData.status}\nProgress: ${progressData.progress}%`
        );
        setProgress(progressData.progress || 0);
        if (progressData.status === "training") {
          setStatus('finetuning');
        } else if (progressData.status === "error") {
          setStatus('error');
          setError(progressData.message || 'Unknown error occurred');
        }
      }
    } catch (error) {
      setDebugInfo(`Error checking progress: ${error.message}`);
      Alert.alert('Error', `Failed to check progress: ${error.message}`);
    }
  };

  const handleDownloadDataset = async () => {
    try {
      setIsDownloading(true);
      setDownloadType('dataset');
      setDownloadProgress(0);
      setDebugInfo('Starting dataset download...');

      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);
      
      const response = await axios({
        url: `${BASE_URL}/download_dataset`,
        method: 'GET',
        responseType: 'blob',
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      setTimeout(() => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'dataset.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setDebugInfo('Dataset download completed');
        setIsDownloading(false);
        Alert.alert('Success', 'Dataset downloaded successfully');
      }, 500);
      
    } catch (error) {
      console.error('Download error:', error);
      setDebugInfo(`Download error: ${error.message}`);
      Alert.alert('Error', `Failed to download dataset: ${error.message}`);
      setIsDownloading(false);
    }
  };

  const handleDownloadModel = async () => {
    try {
      setIsDownloading(true);
      setDownloadType('model');
      setDownloadProgress(0);
      setDebugInfo('Starting model download...');

      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          const newProgress = prev + Math.random() * 8;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 600);
      
      const response = await axios({
        url: `${BASE_URL}/download_model`,
        method: 'GET',
        responseType: 'blob',
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      setTimeout(() => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'lora_model.zip');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setDebugInfo('Model download completed');
        setIsDownloading(false);
        Alert.alert('Success', 'Model downloaded successfully');
      }, 500);
      
    } catch (error) {
      console.error('Download error:', error);
      setDebugInfo(`Download error: ${error.message}`);
      Alert.alert('Error', `Failed to download model: ${error.message}`);
      setIsDownloading(false);
    }
  };

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

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => setTouchPosition({ x: gestureState.moveX, y: gestureState.moveY }),
      onPanResponderRelease: () => setTouchPosition({ x: -1, y: -1 }),
    });

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

  const renderContent = () => {
    switch (status) {
      case 'dataset_creation':
        return (
          <>
            <ActivityIndicator size="large" color="#A855F7" />
            <Text style={styles.loadingText}>Dataset Creation in Progress...</Text>
            {debugInfo ? <Text style={styles.debugText}>{debugInfo}</Text> : null}
          </>
        );
      case 'dataset_success':
        return (
          <>
            <View style={styles.successIcon}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.successText}>Dataset Creation Successful</Text>
            <TouchableOpacity style={styles.button} onPress={startFineTuning}>
              <Text style={styles.buttonText}>Finetune Llama Model</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.downloadButton} 
              onPress={handleDownloadDataset}
              disabled={isDownloading}>
              <Text style={styles.buttonText}>
                {isDownloading ? 'Downloading...' : 'Download Dataset'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={forceCheckProgress}>
              <Text style={styles.outlineButtonText}>Check Progress</Text>
            </TouchableOpacity>
            {debugInfo ? <Text style={styles.debugText}>{debugInfo}</Text> : null}
          </>
        );
      case 'finetuning':
        return (
          <>
            <ActivityIndicator size="large" color="#A855F7" />
            <Text style={styles.loadingText}>Model Fine-Tuning in Progress...</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
            <TouchableOpacity style={styles.outlineButton} onPress={forceCheckProgress}>
              <Text style={styles.outlineButtonText}>Force Refresh Progress</Text>
            </TouchableOpacity>
            {debugInfo ? <Text style={styles.debugText}>{debugInfo}</Text> : null}
          </>
        );
      case 'finetuning_success':
        return (
          <>
            <View style={styles.successIcon}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.successText}>Model Successfully Finetuned</Text>
            <TouchableOpacity style={styles.button} onPress={handleChatButtonPress}>
              <Text style={styles.buttonText}>Test Model</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.downloadButton} 
              onPress={handleDownloadDataset}
              disabled={isDownloading}>
              <Text style={styles.buttonText}>
                {isDownloading ? 'Downloading...' : 'Download Dataset'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.downloadButton} 
              onPress={handleDownloadModel}
              disabled={isDownloading}>
              <Text style={styles.buttonText}>
                {isDownloading ? 'Downloading...' : 'Download Model'}
              </Text>
            </TouchableOpacity>
            {debugInfo ? <Text style={styles.debugText}>{debugInfo}</Text> : null}
          </>
        );
      case 'error':
        return (
          <>
            <View style={styles.errorIcon}>
              <Text style={styles.errorMark}>✗</Text>
            </View>
            <Text style={styles.errorText}>An error occurred</Text>
            {error && <Text style={styles.errorDetail}>{error}</Text>}
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={forceCheckProgress}>
              <Text style={styles.outlineButtonText}>Check Backend Status</Text>
            </TouchableOpacity>
            {debugInfo ? <Text style={styles.debugText}>{debugInfo}</Text> : null}
          </>
        );
      default:
        return null;
    }
  };

  const renderDownloadModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDownloading}
        onRequestClose={() => console.log("Modal closed")}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Animated.View 
              style={[
                styles.animatedIconContainer, 
                { 
                  transform: [
                    { rotate: spin },
                    { scale: pulseValue }
                  ] 
                }
              ]}
            >
              <Text style={styles.downloadIcon}>↓</Text>
            </Animated.View>
            
            <Text style={styles.modalTitle}>
              Downloading {downloadType === 'dataset' ? 'Dataset' : 'Model'}
            </Text>
            
            <View style={styles.modalProgressContainer}>
              <View 
                style={[
                  styles.modalProgressBar, 
                  { width: `${downloadProgress}%` }
                ]} 
              />
            </View>
            
            <Text style={styles.modalProgressText}>
              {Math.round(downloadProgress)}%
            </Text>
            
            <Text style={styles.modalSubtext}>
              Please wait while your file is being prepared...
            </Text>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sparklesWrapper}>
        <SparklesCore />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {renderContent()}
        </Animated.View>
      </ScrollView>
      
      <View style={styles.roboWrapper}>
        <RoboAnimation />
      </View>
      
      {renderDownloadModal()}
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
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 22,
    color: '#A855F7',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '100%',
    height: 20,
 taxColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginTop: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#A855F7',
  },
  progressText: {
    fontSize: 18,
    color: '#D1D5DB',
    marginTop: 10,
    textAlign: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#A855F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  checkmark: {
    fontSize: 60,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  successText: {
    fontSize: 28,
    color: '#A855F7',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#A855F7',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 50,
    elevation: 5,
    minWidth: 160,
    alignItems: 'center',
    marginBottom: 15,
  },
  downloadButton: {
    backgroundColor: '#A855F7',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 50,
    elevation: 5,
    minWidth: 160,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#A855F7',
    minWidth: 200,
    alignItems: 'center',
    marginTop: 15,
  },
  outlineButtonText: {
    fontSize: 16,
    color: '#A855F7',
    fontWeight: '600',
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorMark: {
    fontSize: 60,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 22,
    color: '#EC4899',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    marginVertical: 10,
    maxWidth: '90%',
  },
  retryButton: {
    backgroundColor: '#A855F7',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    elevation: 5,
    minWidth: 200,
    alignItems: 'center',
    marginTop: 20,
  },
  debugText: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 5,
    maxWidth: '90%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#000000',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: ' AIF85%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  animatedIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A855F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  downloadIcon: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalProgressContainer: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  modalProgressBar: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 5,
  },
  modalProgressText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalSubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
  },
});

export default LoadingScreen;
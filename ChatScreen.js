import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const HEADER_HEIGHT = 60;
const { width, height } = Dimensions.get('window');

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputWrapperHeight, setInputWrapperHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade animation for content
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        setTimeout(scrollToBottom, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setTimeout(scrollToBottom, 100);
      }
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post('https://4639-34-16-193-247.ngrok-free.app/chat', {
        message: inputText,
      }, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      const aiMessage = {
        id: messages.length + 2,
        text: response.data.response || "I'm processing your request. Please wait a moment.",
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error communicating with AI:', error);
      const errorMessage = {
        id: messages.length + 2,
        text: 'Sorry, I encountered an error while processing your request. Please try again.',
        isUser: false,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Sparkles Component (Simplified without touch interaction)
  const SparklesCore = () => {
    const [dimensions, setDimensions] = useState({ width, height });

    const particles = useRef(
      Array.from({ length: 100 }).map(() => ({
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        size: Math.random() * (1.4 - 0.6) + 0.6,
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

    useEffect(() => {
      let animationFrameId;
      const animate = () => {
        particles.forEach(particle => {
          Animated.parallel([
            Animated.timing(particle.x, { 
              toValue: particle.x._value + particle.speedX, 
              duration: 16, 
              useNativeDriver: true 
            }),
            Animated.timing(particle.y, { 
              toValue: particle.y._value + particle.speedY, 
              duration: 16, 
              useNativeDriver: true 
            }),
          ]).start(() => {
            particle.x.setValue(particle.x._value > dimensions.width ? 0 : 
                              particle.x._value < 0 ? dimensions.width : particle.x._value);
            particle.y.setValue(particle.y._value > dimensions.height ? 0 : 
                              particle.y._value < 0 ? dimensions.height : particle.y._value);
          });
        });
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrameId);
    }, [dimensions]); // Removed touchPosition dependency

    return (
      <View style={styles.sparklesContainer}>
        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                transform: [{ translateX: particle.x }, { translateY: particle.y }],
                width: particle.size,
                height: particle.size,
                backgroundColor: '#EC4899',
              },
            ]}
          />
        ))}
      </View>
    );
  };

  // Robo Animation Component
  const RoboAnimation = () => {
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
  };

  const inputOffset = keyboardHeight;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.sparklesWrapper}>
          <SparklesCore />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Stellaris<Text style={styles.gradientText}>AI</Text></Text>
        </View>

        {/* Messages Container */}
        <View
          style={[
            styles.contentWrapper,
            {
              top: HEADER_HEIGHT,
              bottom: inputWrapperHeight + inputOffset,
            },
          ]}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.isUser ? styles.userBubble : styles.aiBubble,
                    message.isError && styles.errorBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.isUser ? styles.userText : styles.aiText,
                      message.isError && styles.errorText,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              ))}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.loadingText}>AI is thinking...</Text>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </View>

        {/* Input Field */}
        <View
          style={[styles.inputWrapper, { bottom: inputOffset }]}
          onLayout={(event) => {
            setInputWrapperHeight(event.nativeEvent.layout.height);
          }}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#D1D5DB"
              multiline
              maxHeight={100}
              onFocus={scrollToBottom}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (inputText.trim() === '' || isLoading) && styles.disabledButton,
              ]}
              onPress={sendMessage}
              disabled={inputText.trim() === '' || isLoading}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.roboWrapper}>
          <RoboAnimation />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    position: 'relative',
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
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  contentWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: 'transparent',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  aiBubble: {
    backgroundColor: '#A855F7',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  errorBubble: {
    backgroundColor: '#EC4899',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#A855F7',
    padding: 10,
    borderRadius: 18,
    marginBottom: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },
  inputWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    elevation: 2,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#FFFFFF',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#A855F7',
    width: 60,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#AAAAAA',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChatScreen;
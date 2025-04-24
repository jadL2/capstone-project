import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Bot, Send, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

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
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
  },
  userBubble: {
    backgroundColor: Colors.primary,
    marginLeft: 'auto',
    borderTopRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.cardBackground,
    marginRight: 'auto',
    borderTopLeftRadius: 4,
  },
  botIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thinkingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  thinkingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textSecondary,
    marginRight: 4,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  suggestionsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  suggestionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  suggestionsToggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  suggestionsList: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  suggestionItem: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
    fontSize: 16,
    color: Colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.primaryLight,
  },
});

export default function AssistantScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AgriDSS assistant. How can I help you today with your farm management decisions?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const suggestions = [
    "What crops should I plant this season?",
    "When is the best time to harvest corn?",
    "How to prevent pest infestation?",
    "Current market prices for soybeans",
  ];

  const handleSend = () => {
    if (input.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    setShowSuggestions(false);

    // Simulate AI response
    setTimeout(() => {
      const responses = {
        "what crops should i plant this season?": "Based on your location and current soil conditions, I recommend considering corn, soybeans, or wheat. Your farm's historical yield data shows that corn has performed well in the past two seasons. Would you like me to create a detailed planting schedule?",
        "when is the best time to harvest corn?": "For your region, corn typically reaches physiological maturity when kernels form a black layer. This usually occurs 55-65 days after silking. Based on your planting date, optimal harvest would be mid-September to early October. I can help you monitor moisture content as we get closer to harvest time.",
        "how to prevent pest infestation?": "To prevent pest infestations in your crops, I recommend implementing Integrated Pest Management (IPM). This includes regular field scouting, crop rotation, beneficial insects, and selective pesticides when necessary. Would you like me to create a customized IPM plan for your farm?",
        "current market prices for soybeans": "Current soybean futures are trading at $13.45 per bushel, up 0.8% from yesterday. Local cash prices in your area are averaging $12.90. Based on market trends, prices are expected to remain stable through harvest, with possible increases in Q1 next year. Would you like to set price alerts?",
      };

      const defaultResponse = "I understand you're asking about \"" + input + "\". Let me analyze the agricultural data and provide some insights. Based on your farm's location and current conditions, I recommend considering the specific timing, soil conditions, and market trends before making any decisions. Would you like me to provide more specific information on this topic?";

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: responses[input.toLowerCase()] || defaultResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsThinking(false);
    }, 2000);
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    handleSend();
  };

  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Farm Assistant</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View 
              key={message.id} 
              style={[
                styles.messageBubble, 
                message.isUser ? styles.userBubble : styles.assistantBubble
              ]}
            >
              {!message.isUser && (
                <View style={styles.botIconContainer}>
                  <Bot size={16} color="#fff" />
                </View>
              )}
              <View style={styles.messageContent}>
                <Text style={[
                  styles.messageText,
                  !message.isUser && { color: Colors.text }
                ]}>{message.text}</Text>
                <Text style={[
                  styles.timestamp,
                  !message.isUser && { color: Colors.textSecondary }
                ]}>{formatTime(message.timestamp)}</Text>
              </View>
            </View>
          ))}

          {isThinking && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <View style={styles.botIconContainer}>
                <Bot size={16} color="#fff" />
              </View>
              <View style={styles.messageContent}>
                <View style={styles.thinkingContainer}>
                  <Text style={styles.thinkingText}>Thinking</Text>
                  <View style={styles.thinkingDots}>
                    <View style={[styles.thinkingDot, styles.dot1]} />
                    <View style={[styles.thinkingDot, styles.dot2]} />
                    <View style={[styles.thinkingDot, styles.dot3]} />
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.suggestionsContainer}>
          <TouchableOpacity 
            style={styles.suggestionsToggle}
            onPress={toggleSuggestions}
          >
            <Text style={styles.suggestionsToggleText}>
              {showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
            </Text>
            {showSuggestions ? (
              <ChevronUp size={16} color={Colors.textSecondary} />
            ) : (
              <ChevronDown size={16} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>

          {showSuggestions && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsList}
            >
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestion(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about farming decisions..."
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              input.trim() === '' && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={input.trim() === ''}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
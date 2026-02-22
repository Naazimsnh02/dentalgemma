import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ChatBubble} from '../components/ChatBubble';
import type {Message} from '../types';
import DeviceInfo from 'react-native-device-info';

type ChatScreenProps = {
  sendMessage: (
    text: string,
    image: string | undefined,
    history: Message[],
    onToken: (token: string) => void,
  ) => Promise<string>;
  stopGeneration: () => Promise<void>;
  resetContext: () => Promise<void>;
  isGenerating: boolean;
  error: string | null;
  statusDetailed: string;
  onBack: () => void;
};

export const ChatScreen: React.FC<ChatScreenProps> = ({
  sendMessage,
  stopGeneration,
  resetContext,
  isGenerating,
  error,
  statusDetailed,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const [memoryStats, setMemoryStats] = useState({ used: 0, total: 0 });

  useEffect(() => {
    const fetchMem = async () => {
      try {
        const total = await DeviceInfo.getTotalMemory();
        const used = await DeviceInfo.getUsedMemory();
        setMemoryStats({ total, used });
      } catch {}
    };
    fetchMem();
    const interval = setInterval(fetchMem, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    return (bytes / 1024 / 1024).toFixed(0) + ' MB';
  };

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const history = [...messages];
    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputText('');

    let accumulated = '';
    try {
      const finalText = await sendMessage(
        userMessage.content,
        undefined,
        history,
        token => {
          accumulated += token;
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? {...m, content: accumulated, isStreaming: true}
                : m,
            ),
          );
        },
      );

      // Once generation is done, update the assistant message with the FULL text.
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? {...m, content: finalText || accumulated, isStreaming: false}
            : m,
        ),
      );
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content: 'Error generating response.',
                isStreaming: false,
              }
            : m,
        ),
      );
    }
  }, [inputText, messages, sendMessage]);

  const handleClearChat = useCallback(async () => {
    setMessages([]);
    await resetContext();
  }, [resetContext]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DentalGemma</Text>
        <TouchableOpacity onPress={handleClearChat} style={styles.clearButton}>
          <Text style={styles.clearText}>New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.debugBar}>
        <Text style={styles.debugText} numberOfLines={1}>⚙️ {statusDetailed}</Text>
        <Text style={styles.debugText}>RAM: {formatBytes(memoryStats.used)} / {formatBytes(memoryStats.total)}</Text>
      </View>

      {error && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({item}) => <ChatBubble message={item} />}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({animated: true})
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🦷</Text>
            <Text style={styles.emptyTitle}>DentalGemma</Text>
            <Text style={styles.emptySubtitle}>
              Ask me about dental conditions.
            </Text>
            <View style={styles.suggestions}>
              <TouchableOpacity
                style={styles.suggestion}
                onPress={() =>
                  setInputText('What are common signs of cavities?')
                }>
                <Text style={styles.suggestionText}>
                  What are common signs of cavities?
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestion}
                onPress={() =>
                  setInputText('Explain a periapical abscess')
                }>
                <Text style={styles.suggestionText}>
                  Explain a periapical abscess
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about dental health..."
          placeholderTextColor="#9E9E9E"
          multiline
          maxLength={2000}
          editable={!isGenerating}
        />
        {isGenerating ? (
          <TouchableOpacity style={styles.stopButton} onPress={stopGeneration}>
            <Text style={styles.stopText}>⏹</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  clearButton: {
    paddingVertical: 8,
    paddingLeft: 16,
  },
  clearText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  errorBar: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#E65100',
  },
  messageList: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1565C0',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
  },
  suggestions: {
    marginTop: 24,
    width: '100%',
  },
  suggestion: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#424242',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#212121',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendDisabled: {
    backgroundColor: '#E0E0E0',
  },
  sendText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    transform: [{ rotate: '-45deg' }],
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  stopText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  debugBar: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debugText: {
    color: '#00FF00',
    fontSize: 11,
    flexShrink: 1,
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

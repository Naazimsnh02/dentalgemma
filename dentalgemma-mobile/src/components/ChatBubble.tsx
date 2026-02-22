import React, {useState, useEffect} from 'react';
import {View, Text, Image, StyleSheet, Animated} from 'react-native';
import Markdown from 'react-native-markdown-display';
import type {Message} from '../types';

type ChatBubbleProps = {
  message: Message;
};

const TypingIndicator = () => {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
      <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
      <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
    </View>
  );
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({message}) => {
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Image 
            source={require('../../android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png')} 
            style={styles.avatarImage} 
            resizeMode="cover"
          />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}>
        {message.image && (
          <Image
            source={{uri: message.image}}
            style={styles.image}
            resizeMode="contain"
          />
        )}
        {message.isStreaming && !message.content ? (
          <TypingIndicator />
        ) : isUser ? (
          <Text
            style={[styles.text, styles.userText]}
            selectable>
            {message.content}
          </Text>
        ) : (
          <Markdown style={markdownStyles}>
            {message.content}
          </Markdown>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 12,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF', // Changed background to white for the image
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
    overflow: 'hidden', // Add overflow hidden for the image
  },
  avatarImage: {
    width: 32,
    height: 32,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#1976D2',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#F5F5F5',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#212121',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 22, // Match line height
    paddingHorizontal: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#888',
    marginHorizontal: 3,
  },
});

const markdownStyles = {
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#212121',
  },
  heading1: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 6,
    marginTop: 4,
  },
  heading2: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
    marginTop: 4,
  },
  heading3: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1e40af',
    marginBottom: 2,
    marginTop: 4,
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
  list_item: {
    marginBottom: 2,
  },
  strong: {
    fontWeight: '700' as const,
    color: '#111827',
  },
  em: {
    fontStyle: 'italic' as const,
  },
  code_inline: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    paddingHorizontal: 4,
    fontSize: 13,
    color: '#1d4ed8',
  },
  fence: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    fontSize: 13,
    color: '#374151',
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
    paddingLeft: 10,
    marginLeft: 0,
    marginVertical: 4,
    color: '#4b5563',
  },
  hr: {
    backgroundColor: '#e5e7eb',
    height: 1,
    marginVertical: 8,
  },
};

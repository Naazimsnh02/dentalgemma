import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import type {Message} from '../types';

type ChatBubbleProps = {
  message: Message;
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
          <Text style={styles.avatarText}>🦷</Text>
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
        <Text
          style={[styles.text, isUser ? styles.userText : styles.assistantText]}
          selectable>
          {message.content}
          {message.isStreaming && <Text style={styles.cursor}>▊</Text>}
        </Text>
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
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  avatarText: {
    fontSize: 16,
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
  cursor: {
    color: '#1976D2',
    opacity: 0.7,
  },
});

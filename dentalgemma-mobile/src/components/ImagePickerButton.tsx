import React from 'react';
import {TouchableOpacity, Text, StyleSheet, Alert} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';

type ImagePickerButtonProps = {
  onImageSelected: (uri: string) => void;
  disabled?: boolean;
};

export const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({
  onImageSelected,
  disabled,
}) => {
  const handlePress = () => {
    Alert.alert('Add X-ray Image', 'Choose a source', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await launchCamera({
            mediaType: 'photo',
            quality: 0.7,
            maxWidth: 224,
            maxHeight: 224,
          });
          if (result.assets?.[0]?.uri) {
            onImageSelected(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.7,
            maxWidth: 224,
            maxHeight: 224,
          });
          if (result.assets?.[0]?.uri) {
            onImageSelected(result.assets[0].uri);
          }
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={handlePress}
      disabled={disabled}>
      <Text style={styles.text}>📷</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: 20,
  },
});

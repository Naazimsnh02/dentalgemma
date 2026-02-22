import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

type ModelStatusProps = {
  progress: number;
  label: string;
};

export const ModelStatus: React.FC<ModelStatusProps> = ({progress, label}) => {
  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, {width: `${percentage}%`}]} />
      </View>
      <Text style={styles.percentage}>{percentage}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  barBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#1976D2',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
});

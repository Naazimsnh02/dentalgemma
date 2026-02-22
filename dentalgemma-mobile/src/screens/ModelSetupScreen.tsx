import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {ModelStatus} from '../components/ModelStatus';
import {
  checkModelFiles,
  getModelFileSize,
  getSetupInstructions,
} from '../utils/modelManager';
import type {ModelFiles, ModelState} from '../types';

type ModelSetupScreenProps = {
  modelState: ModelState;
  loadProgress: number;
  error: string | null;
  onLoadModel: (modelPath: string, mmprojPath: string) => Promise<void>;
};

export const ModelSetupScreen: React.FC<ModelSetupScreenProps> = ({
  modelState,
  loadProgress,
  error,
  onLoadModel,
}) => {
  const [files, setFiles] = useState<ModelFiles | null>(null);
  const [modelSize, setModelSize] = useState<string | null>(null);
  const [mmprojSize, setMmprojSize] = useState<string | null>(null);

  const checkFiles = async () => {
    const result = await checkModelFiles();
    setFiles(result);

    if (result.modelExists) {
      const size = await getModelFileSize(result.modelPath);
      setModelSize(size);
    }
    if (result.mmprojExists) {
      const size = await getModelFileSize(result.mmprojPath);
      setMmprojSize(size);
    }
  };

  useEffect(() => {
    checkFiles();
  }, []);

  const bothFilesReady = files?.modelExists && files?.mmprojExists;
  const isLoading = modelState === 'loading';

  const handleLoad = async () => {
    if (!files) {
      return;
    }
    await onLoadModel(files.modelPath, files.mmprojPath);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>🦷</Text>
        <Text style={styles.title}>DentalGemma</Text>
        <Text style={styles.subtitle}>
          Offline Dental AI — Powered by MedGemma
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Model Files</Text>

        <View style={styles.fileRow}>
          <Text style={files?.modelExists ? styles.checkmark : styles.cross}>
            {files?.modelExists ? '✓' : '✗'}
          </Text>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>Text Model (Q4_K_M)</Text>
            <Text style={styles.fileDetail}>
              {files?.modelExists
                ? `Ready — ${modelSize || '~2.5 GB'}`
                : 'Not found'}
            </Text>
          </View>
        </View>

        <View style={styles.fileRow}>
          <Text style={files?.mmprojExists ? styles.checkmark : styles.cross}>
            {files?.mmprojExists ? '✓' : '✗'}
          </Text>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>Vision Encoder (mmproj)</Text>
            <Text style={styles.fileDetail}>
              {files?.mmprojExists
                ? `Ready — ${mmprojSize || '~860 MB'}`
                : 'Not found'}
            </Text>
          </View>
        </View>

        {!bothFilesReady && (
          <>
            <View style={styles.divider} />
            <Text style={styles.instructions}>{getSetupInstructions()}</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={checkFiles}>
              <Text style={styles.refreshText}>🔄 Refresh</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {isLoading && (
        <ModelStatus progress={loadProgress} label="Loading model into RAM…" />
      )}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.loadButton,
          (!bothFilesReady || isLoading) && styles.loadButtonDisabled,
        ]}
        onPress={handleLoad}
        disabled={!bothFilesReady || isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.loadButtonText}>
            {bothFilesReady ? 'Load Model & Start Chat' : 'Model Files Missing'}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.specs}>
        <Text style={styles.specsTitle}>Device Requirements</Text>
        <Text style={styles.specsText}>• 6+ GB RAM (8+ GB recommended)</Text>
        <Text style={styles.specsText}>• ~3.4 GB storage for model files</Text>
        <Text style={styles.specsText}>• Load time: 10-15 seconds</Text>
        <Text style={styles.specsText}>• Speed: 5-15 tokens/second</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1565C0',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 20,
    color: '#4CAF50',
    width: 28,
  },
  cross: {
    fontSize: 20,
    color: '#F44336',
    width: 28,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#212121',
  },
  fileDetail: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  instructions: {
    fontSize: 13,
    color: '#616161',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  refreshButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    marginTop: 16,
  },
  refreshText: {
    fontSize: 14,
    color: '#1565C0',
    fontWeight: '500',
  },
  errorCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#E65100',
  },
  loadButton: {
    backgroundColor: '#1976D2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#1976D2',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loadButtonDisabled: {
    backgroundColor: '#BDBDBD',
    elevation: 0,
    shadowOpacity: 0,
  },
  loadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  specs: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  specsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  specsText: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
    lineHeight: 22,
  },
});

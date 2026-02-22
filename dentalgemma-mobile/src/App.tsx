import React, {useState, useCallback} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {toggleNativeLog, addNativeLogListener} from 'llama.rn';
import {ModelSetupScreen} from './screens/ModelSetupScreen';
import {ChatScreen} from './screens/ChatScreen';
import {useDentalGemma} from './hooks/useDentalGemma';
import type {ModelState} from './types';

// Catch logs from llama.cpp
toggleNativeLog(true);
addNativeLogListener((level, text) => {
  console.log(['[rnllama]', level ? `[${level}]` : '', text].filter(Boolean).join(' '));
});

const App: React.FC = () => {
  const [modelState, setModelState] = useState<ModelState>('checking');
  const {
    isModelLoaded,
    isGenerating,
    loadProgress,
    error,
    loadModel,
    sendMessage,
    stopGeneration,
    resetContext,
    unloadModel,
    statusDetailed,
  } = useDentalGemma();

  const handleLoadModel = useCallback(
    async (modelPath: string, mmprojPath: string) => {
      setModelState('loading');
      try {
        await loadModel(modelPath, mmprojPath);
        setModelState('loaded');
      } catch {
        setModelState('error');
      }
    },
    [loadModel],
  );

  const handleBack = useCallback(async () => {
    await unloadModel();
    setModelState('checking');
  }, [unloadModel]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {isModelLoaded ? (
        <ChatScreen
          sendMessage={sendMessage}
          stopGeneration={stopGeneration}
          resetContext={resetContext}
          isGenerating={isGenerating}
          error={error}
          statusDetailed={statusDetailed}
          onBack={handleBack}
        />
      ) : (
        <ModelSetupScreen
          modelState={modelState}
          loadProgress={loadProgress}
          error={error}
          onLoadModel={handleLoadModel}
        />
      )}
    </SafeAreaProvider>
  );
};

export default App;

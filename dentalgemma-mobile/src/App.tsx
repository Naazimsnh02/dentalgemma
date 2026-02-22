import React, {useState, useCallback} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {toggleNativeLog, addNativeLogListener} from 'llama.rn';
import {ModelSetupScreen} from './screens/ModelSetupScreen';
import {ChatScreen} from './screens/ChatScreen';
import {SymptomCheckerScreen} from './screens/SymptomCheckerScreen';
import {ImageAnalysisScreen} from './screens/ImageAnalysisScreen';
import {EducationScreen} from './screens/EducationScreen';
import {DentistFinderScreen} from './screens/DentistFinderScreen';
import {HomeScreen} from './screens/HomeScreen';
import {useDentalGemma} from './hooks/useDentalGemma';
import type {ModelState} from './types';

// Catch logs from llama.cpp
toggleNativeLog(true);
addNativeLogListener((level, text) => {
  console.log(['[rnllama]', level ? `[${level}]` : '', text].filter(Boolean).join(' '));
});

type Screen = 'home' | 'chat' | 'symptom-checker' | 'image-analysis' | 'education' | 'dentist-finder';

const App: React.FC = () => {
  const [modelState, setModelState] = useState<ModelState>('checking');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
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

  const handleBackToHome = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  const handleNavigateToChat = useCallback(() => {
    setCurrentScreen('chat');
  }, []);

  const handleNavigateToSymptomChecker = useCallback(() => {
    setCurrentScreen('symptom-checker');
  }, []);

  const handleNavigateToImageAnalysis = useCallback(() => {
    setCurrentScreen('image-analysis');
  }, []);

  const handleNavigateToEducation = useCallback(() => {
    setCurrentScreen('education');
  }, []);

  const handleNavigateToDentistFinder = useCallback(() => {
    setCurrentScreen('dentist-finder');
  }, []);

  const handleUnloadModel = useCallback(async () => {
    await unloadModel();
    setModelState('checking');
    setCurrentScreen('home');
  }, [unloadModel]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {!isModelLoaded ? (
        <ModelSetupScreen
          modelState={modelState}
          loadProgress={loadProgress}
          error={error}
          onLoadModel={handleLoadModel}
        />
      ) : currentScreen === 'home' ? (
        <HomeScreen
          onNavigateToChat={handleNavigateToChat}
          onNavigateToSymptomChecker={handleNavigateToSymptomChecker}
          onNavigateToImageAnalysis={handleNavigateToImageAnalysis}
          onNavigateToEducation={handleNavigateToEducation}
          onNavigateToDentistFinder={handleNavigateToDentistFinder}
          onUnloadModel={handleUnloadModel}
        />
      ) : currentScreen === 'chat' ? (
        <ChatScreen
          sendMessage={sendMessage}
          stopGeneration={stopGeneration}
          resetContext={resetContext}
          isGenerating={isGenerating}
          error={error}
          statusDetailed={statusDetailed}
          onBack={handleBackToHome}
        />
      ) : currentScreen === 'symptom-checker' ? (
        <SymptomCheckerScreen
          sendMessage={sendMessage}
          isGenerating={isGenerating}
          onBack={handleBackToHome}
        />
      ) : currentScreen === 'education' ? (
        <EducationScreen onBack={handleBackToHome} />
      ) : currentScreen === 'dentist-finder' ? (
        <DentistFinderScreen onBack={handleBackToHome} />
      ) : (
        <ImageAnalysisScreen
          sendMessage={sendMessage}
          isGenerating={isGenerating}
          onBack={handleBackToHome}
        />
      )}
    </SafeAreaProvider>
  );
};

export default App;

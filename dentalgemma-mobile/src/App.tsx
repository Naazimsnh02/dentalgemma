import React, {useState, useCallback, useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {toggleNativeLog, addNativeLogListener} from 'llama.rn';
import {ErrorBoundary} from './components/ErrorBoundary';
import {ModelSetupScreen} from './screens/ModelSetupScreen';
import {ChatScreen} from './screens/ChatScreen';
import {SymptomCheckerScreen} from './screens/SymptomCheckerScreen';
import {ClinicalAssessmentScreen} from './screens/ClinicalAssessmentScreen';
import {ImageAnalysisScreen} from './screens/ImageAnalysisScreen';
import {EducationScreen} from './screens/EducationScreen';
import {DentistFinderScreen} from './screens/DentistFinderScreen';
import {ResearchScreen} from './screens/ResearchScreen';
import {HomeScreen} from './screens/HomeScreen';
import {useDentalGemma} from './hooks/useDentalGemma';
import type {ModelState} from './types';

type Screen = 'home' | 'chat' | 'symptom-checker' | 'clinical-assessment' | 'image-analysis' | 'education' | 'dentist-finder' | 'research';

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

  // Initialize llama.rn logging safely after component mount
  useEffect(() => {
    try {
      if (__DEV__) {
        toggleNativeLog(true);
        addNativeLogListener((level, text) => {
          console.log(['[rnllama]', level ? `[${level}]` : '', text].filter(Boolean).join(' '));
        });
      }
    } catch (err) {
      console.warn('Failed to initialize llama.rn logging:', err);
    }
  }, []);

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

  const handleNavigateToClinicalAssessment = useCallback(() => {
    setCurrentScreen('clinical-assessment');
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

  const handleNavigateToResearch = useCallback(() => {
    setCurrentScreen('research');
  }, []);

  const handleUnloadModel = useCallback(async () => {
    await unloadModel();
    setModelState('checking');
    setCurrentScreen('home');
  }, [unloadModel]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
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
          onNavigateToClinicalAssessment={handleNavigateToClinicalAssessment}
          onNavigateToImageAnalysis={handleNavigateToImageAnalysis}
          onNavigateToEducation={handleNavigateToEducation}
          onNavigateToDentistFinder={handleNavigateToDentistFinder}
          onNavigateToResearch={handleNavigateToResearch}
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
      ) : currentScreen === 'clinical-assessment' ? (
        <ClinicalAssessmentScreen
          sendMessage={sendMessage}
          isGenerating={isGenerating}
          onBack={handleBackToHome}
        />
      ) : currentScreen === 'education' ? (
        <EducationScreen onBack={handleBackToHome} />
      ) : currentScreen === 'dentist-finder' ? (
        <DentistFinderScreen onBack={handleBackToHome} />
      ) : currentScreen === 'research' ? (
        <ResearchScreen onBack={handleBackToHome} />
      ) : (
        <ImageAnalysisScreen
          sendMessage={sendMessage}
          isGenerating={isGenerating}
          onBack={handleBackToHome}
        />
      )}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

export default App;

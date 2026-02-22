import RNFS from 'react-native-fs';
import {Platform} from 'react-native';
import {MODEL_FILENAME, MMPROJ_FILENAME} from '../constants/prompts';
import type {ModelFiles} from '../types';

const getModelsDir = (): string => {
  const baseDir =
    Platform.OS === 'android'
      ? RNFS.ExternalDirectoryPath
      : RNFS.DocumentDirectoryPath;
  return `${baseDir}/models`;
};

export const getModelPaths = (): {modelPath: string; mmprojPath: string} => {
  const dir = getModelsDir();
  return {
    modelPath: `${dir}/${MODEL_FILENAME}`,
    mmprojPath: `${dir}/${MMPROJ_FILENAME}`,
  };
};

export const checkModelFiles = async (): Promise<ModelFiles> => {
  const {modelPath, mmprojPath} = getModelPaths();

  const modelsDir = getModelsDir();
  console.log('🔍 Checking models directory:', modelsDir);
  console.log('🔍 Model path:', modelPath);
  console.log('🔍 MMProj path:', mmprojPath);
  
  const dirExists = await RNFS.exists(modelsDir);
  console.log('📁 Models directory exists:', dirExists);
  
  if (!dirExists) {
    console.log('📁 Creating models directory...');
    await RNFS.mkdir(modelsDir);
  }

  const [modelExists, mmprojExists] = await Promise.all([
    RNFS.exists(modelPath),
    RNFS.exists(mmprojPath),
  ]);
  
  console.log('✅ Model file exists:', modelExists);
  console.log('✅ MMProj file exists:', mmprojExists);

  return {modelPath, mmprojPath, modelExists, mmprojExists};
};

export const getModelFileSize = async (
  path: string,
): Promise<string | null> => {
  try {
    const stat = await RNFS.stat(path);
    const sizeGB = Number(stat.size) / (1024 * 1024 * 1024);
    if (sizeGB >= 1) {
      return `${sizeGB.toFixed(2)} GB`;
    }
    const sizeMB = Number(stat.size) / (1024 * 1024);
    return `${sizeMB.toFixed(0)} MB`;
  } catch {
    return null;
  }
};

export const getSetupInstructions = (): string => {
  const dir = getModelsDir();

  if (Platform.OS === 'android') {
    return `Push model files to your device using ADB:

adb push ${MODEL_FILENAME} ${dir}/
adb push ${MMPROJ_FILENAME} ${dir}/

Or copy the files manually to:
${dir}/`;
  }

  return `Copy model files to the app's Documents directory:

${dir}/${MODEL_FILENAME}
${dir}/${MMPROJ_FILENAME}`;
};

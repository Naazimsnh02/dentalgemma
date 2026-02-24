import RNFS from 'react-native-fs';
import {Platform} from 'react-native';
import type {ModelFiles} from '../types';
import {
  ensureModelsDirectory,
  checkModelFile,
  MODEL_FILES,
} from './modelDownloader';

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
    modelPath: `${dir}/${MODEL_FILES.model.filename}`,
    mmprojPath: `${dir}/${MODEL_FILES.mmproj.filename}`,
  };
};

export const checkModelFiles = async (): Promise<ModelFiles> => {
  const modelsDir = await ensureModelsDirectory();
  const {modelPath, mmprojPath} = getModelPaths();

  console.log('🔍 Checking models directory:', modelsDir);
  console.log('🔍 Model path:', modelPath);
  console.log('🔍 MMProj path:', mmprojPath);

  const [modelCheck, mmprojCheck] = await Promise.all([
    checkModelFile(modelPath),
    checkModelFile(mmprojPath),
  ]);

  console.log('✅ Model file exists:', modelCheck.exists);
  console.log('✅ MMProj file exists:', mmprojCheck.exists);

  return {
    modelPath,
    mmprojPath,
    modelExists: modelCheck.exists,
    mmprojExists: mmprojCheck.exists,
  };
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
  return 'Models will be downloaded automatically from Hugging Face.';
};

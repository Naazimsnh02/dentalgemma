import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

export type DownloadProgress = {
  bytesWritten: number;
  contentLength: number;
  progress: number; // 0-1
};

export type DownloadCallback = (progress: DownloadProgress) => void;

const HUGGINGFACE_BASE_URL =
  'https://huggingface.co/naazimsnh02/dentalgemma-1.5-4b-it-GGUF/resolve/main';

export const MODEL_FILES = {
  model: {
    filename: 'dentalgemma-4b-Q4_K_M.gguf',
    url: `${HUGGINGFACE_BASE_URL}/dentalgemma-4b-Q4_K_M.gguf`,
    expectedSize: 2.5 * 1024 * 1024 * 1024, // ~2.5 GB
  },
  mmproj: {
    filename: 'dentalgemma-mmproj-f16.gguf',
    url: `${HUGGINGFACE_BASE_URL}/dentalgemma-mmproj-f16.gguf`,
    expectedSize: 860 * 1024 * 1024, // ~860 MB
  },
};

const getModelsDir = (): string => {
  const baseDir =
    Platform.OS === 'android'
      ? RNFS.ExternalDirectoryPath
      : RNFS.DocumentDirectoryPath;
  return `${baseDir}/models`;
};

/**
 * Ensure the models directory exists
 */
export const ensureModelsDirectory = async (): Promise<string> => {
  const dir = getModelsDir();
  const exists = await RNFS.exists(dir);
  if (!exists) {
    await RNFS.mkdir(dir);
  }
  return dir;
};

/**
 * Check if a model file exists and is valid (non-zero size)
 */
export const checkModelFile = async (
  filepath: string,
): Promise<{exists: boolean; size: number}> => {
  try {
    const exists = await RNFS.exists(filepath);
    if (!exists) {
      return {exists: false, size: 0};
    }

    const stat = await RNFS.stat(filepath);
    const size = Number(stat.size);

    // File exists but is empty or corrupted
    if (size === 0) {
      console.warn(`⚠️ Model file exists but is empty: ${filepath}`);
      return {exists: false, size: 0};
    }

    return {exists: true, size};
  } catch (error) {
    console.error(`Error checking model file ${filepath}:`, error);
    return {exists: false, size: 0};
  }
};

/**
 * Download a single model file from Hugging Face
 */
export const downloadModelFile = async (
  url: string,
  destPath: string,
  onProgress?: DownloadCallback,
): Promise<void> => {
  console.log(`📥 Starting download: ${url}`);
  console.log(`📁 Destination: ${destPath}`);

  // Remove partial/corrupted file if exists
  const exists = await RNFS.exists(destPath);
  if (exists) {
    console.log('🗑️ Removing existing file...');
    await RNFS.unlink(destPath);
  }

  const downloadResult = RNFS.downloadFile({
    fromUrl: url,
    toFile: destPath,
    progressInterval: 500, // Update every 500ms
    progress: res => {
      if (onProgress) {
        onProgress({
          bytesWritten: res.bytesWritten,
          contentLength: res.contentLength,
          progress: res.bytesWritten / res.contentLength,
        });
      }
    },
  });

  const result = await downloadResult.promise;

  if (result.statusCode !== 200) {
    throw new Error(
      `Download failed with status ${result.statusCode}: ${url}`,
    );
  }

  // Verify the downloaded file
  const {exists: fileExists, size} = await checkModelFile(destPath);
  if (!fileExists || size === 0) {
    throw new Error('Downloaded file is invalid or empty');
  }

  console.log(`✅ Download complete: ${destPath} (${formatBytes(size)})`);
};

/**
 * Download both model files if they don't exist
 */
export const downloadModelsIfNeeded = async (
  onModelProgress?: DownloadCallback,
  onMmprojProgress?: DownloadCallback,
): Promise<{modelPath: string; mmprojPath: string}> => {
  const dir = await ensureModelsDirectory();
  const modelPath = `${dir}/${MODEL_FILES.model.filename}`;
  const mmprojPath = `${dir}/${MODEL_FILES.mmproj.filename}`;

  // Check existing files
  const [modelCheck, mmprojCheck] = await Promise.all([
    checkModelFile(modelPath),
    checkModelFile(mmprojPath),
  ]);

  console.log('🔍 Model file check:', modelCheck);
  console.log('🔍 MMProj file check:', mmprojCheck);

  // Download model if needed
  if (!modelCheck.exists) {
    console.log('📥 Downloading text model...');
    await downloadModelFile(
      MODEL_FILES.model.url,
      modelPath,
      onModelProgress,
    );
  } else {
    console.log('✅ Text model already exists');
  }

  // Download mmproj if needed
  if (!mmprojCheck.exists) {
    console.log('📥 Downloading vision encoder...');
    await downloadModelFile(
      MODEL_FILES.mmproj.url,
      mmprojPath,
      onMmprojProgress,
    );
  } else {
    console.log('✅ Vision encoder already exists');
  }

  return {modelPath, mmprojPath};
};

/**
 * Format bytes to human-readable string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Get total download size needed
 */
export const getRequiredDownloadSize = async (): Promise<{
  modelSize: number;
  mmprojSize: number;
  totalSize: number;
}> => {
  const dir = await ensureModelsDirectory();
  const modelPath = `${dir}/${MODEL_FILES.model.filename}`;
  const mmprojPath = `${dir}/${MODEL_FILES.mmproj.filename}`;

  const [modelCheck, mmprojCheck] = await Promise.all([
    checkModelFile(modelPath),
    checkModelFile(mmprojPath),
  ]);

  const modelSize = modelCheck.exists ? 0 : MODEL_FILES.model.expectedSize;
  const mmprojSize = mmprojCheck.exists ? 0 : MODEL_FILES.mmproj.expectedSize;

  return {
    modelSize,
    mmprojSize,
    totalSize: modelSize + mmprojSize,
  };
};

/**
 * Delete all model files (for cleanup/reset)
 */
export const deleteModelFiles = async (): Promise<void> => {
  const dir = getModelsDir();
  const exists = await RNFS.exists(dir);

  if (exists) {
    await RNFS.unlink(dir);
    console.log('🗑️ Deleted models directory');
  }
};

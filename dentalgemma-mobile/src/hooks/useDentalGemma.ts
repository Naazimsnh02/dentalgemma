import {useState, useCallback, useRef} from 'react';
import {initLlama, type LlamaContext} from 'llama.rn';
import RNFS from 'react-native-fs';
import {Platform} from 'react-native';
import {SYSTEM_PROMPT, STOP_WORDS} from '../constants/prompts';
import type {Message} from '../types';

type UseDentalGemmaReturn = {
  isModelLoaded: boolean;
  isGenerating: boolean;
  loadProgress: number;
  error: string | null;
  loadModel: (modelPath: string, mmprojPath: string) => Promise<void>;
  sendMessage: (
    text: string,
    image: string | undefined,
    history: Message[],
    onToken: (token: string) => void,
  ) => Promise<string>;
  stopGeneration: () => Promise<void>;
  resetContext: () => Promise<void>;
  unloadModel: () => Promise<void>;
  statusDetailed: string;
};

/**
 * Decodes a sequence of hex strings representing UTF-8 bytes.
 */
const decodeBytes = (hexArray: string[]): string => {
  try {
    const uriString = hexArray.map(hex => '%' + hex.padStart(2, '0')).join('');
    return decodeURIComponent(uriString);
  } catch (e) {
    // If invalid UTF-8 (e.g., partial sequence), return empty string
    return '';
  }
};

/**
 * Clean tokenizer artifacts from Gemma GGUF output.
 *
 * The quantized Gemma tokenizer produces byte-fallback tokens like
 *   [UNK_BYTE_0xe29681▁Findings]   or   <0xHH>
 * The content after the hex inside brackets (▁ + word) is a duplicate of
 * the text that follows the bracket, so we decode only the hex bytes and
 * discard the rest of the bracket content.
 */
const cleanTokenizerArtifacts = (text: string): string => {
  let cleaned = text;

  // 1. [UNK_BYTE_0xHEX + optional non-hex junk + ] → decode hex to UTF-8
  cleaned = cleaned.replace(
    /\[UNK_BYTE_0x([0-9a-fA-F]+)[^\]]*\]/g,
    (_match, hex) => {
      try {
        const pairs = (hex as string).match(/.{2}/g) || [];
        return decodeBytes(pairs);
      } catch {
        return ' ';
      }
    },
  );

  // 2. <0xHH> single-byte tokens
  cleaned = cleaned.replace(/<0x([0-9a-fA-F]{2})>/g, (_match, hex) => {
    try {
      return decodeBytes([hex]);
    } catch {
      return '';
    }
  });

  // 3. All Unicode Block Element characters (U+2580-U+259F) → space
  //    Includes ▁ (U+2581) which SentencePiece uses as a space marker,
  //    plus other block chars the quantized tokenizer may emit.
  cleaned = cleaned.replace(/[\u2580-\u259F]/g, ' ');

  // 4. Unicode replacement character → space (JNI bridge may produce these
  //    when ▁ bytes can't be decoded)
  cleaned = cleaned.replace(/\uFFFD/g, ' ');

  // 5. Various Unicode whitespace / invisible chars → standard space
  cleaned = cleaned.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ');

  // 6. Strip leftover UNK_BYTE fragments that weren't fully bracketed
  cleaned = cleaned.replace(/\[?UNK_BYTE[^\]\s]*\]?/gi, '');

  // 7. Remove common GGUF control tokens
  cleaned = cleaned.replace(/<\/?s>/g, '');
  cleaned = cleaned.replace(/<pad>/gi, '');

  // 8. Fix duplicate word]word patterns left by partial cleanup
  cleaned = cleaned.replace(/(\w+)\]\1/g, '$1');

  // 9. Remove orphaned ] between word chars (tokenizer artifact)
  cleaned = cleaned.replace(/(\w)\](\w)/g, '$1 $2');
  cleaned = cleaned.replace(/(^|[\s\n])\]/g, '$1');

  // 10. Collapse runs of spaces (preserve newlines)
  cleaned = cleaned.replace(/[^\S\n]{2,}/g, ' ');

  // 11. Remove spaces before punctuation
  cleaned = cleaned.replace(/ ([.,;:!?])/g, '$1');

  // 12. Ensure space after sentence-ending punctuation before a letter
  cleaned = cleaned.replace(/([.!?:])([A-Za-z])/g, '$1 $2');

  return cleaned;
};

/**
 * Resolve any image URI to a local file path the native C++ layer can fopen().
 * Returns a raw filesystem path (no file:// prefix) because llama.rn strips it anyway.
 */
const resolveImagePath = async (uri: string): Promise<string> => {
  const destPath = `${RNFS.CachesDirectoryPath}/dental_img_${Date.now()}.jpg`;

  if (uri.startsWith('content://') || uri.startsWith('file://')) {
    // content:// can't be fopen'd; file:// works but copy is safest
    const srcPath = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
    await RNFS.copyFile(srcPath, destPath);
    return destPath;
  }

  // Bare path (/storage/emulated/0/...)
  if (uri.startsWith('/')) {
    return uri;
  }

  // Unknown scheme — try copy as-is
  await RNFS.copyFile(uri, destPath);
  return destPath;
};

const detectVisionGpuSupport = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true;
  }

  if (Platform.OS !== 'android') {
    return false;
  }

  const candidates = [
    '/system/vendor/lib64/libOpenCL.so',
    '/system/lib64/libOpenCL.so',
    '/vendor/lib64/libOpenCL.so',
    '/system/vendor/lib/libOpenCL.so',
    '/system/lib/libOpenCL.so',
    '/vendor/lib/libOpenCL.so',
  ];

  try {
    for (const path of candidates) {
      const exists = await RNFS.exists(path);
      if (exists) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
};

export const useDentalGemma = (): UseDentalGemmaReturn => {
  const contextRef = useRef<LlamaContext | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusDetailed, setStatusDetailed] = useState<string>('Idle');

  const loadModel = useCallback(
    async (modelPath: string, mmprojPath: string) => {
      try {
        setError(null);
        setLoadProgress(0);

        if (contextRef.current) {
          await contextRef.current.release();
          contextRef.current = null;
        }

        const visionGpuSupported = await detectVisionGpuSupport();
        const nGpuLayers = visionGpuSupported ? 99 : 0;
        const imageMaxTokens = visionGpuSupported ? 256 : 128;

        setStatusDetailed('Loading text model...');
        console.log('📦 Loading model:', modelPath);
        const context = await initLlama(
          {
            model: modelPath,
            n_ctx: 2048,
            n_gpu_layers: nGpuLayers,
            n_threads: 4,
            use_mlock: false,
            ctx_shift: false,
            // Add Gemma-specific settings
            rope_freq_base: 10000,
            rope_freq_scale: 1.0,
          },
          progress => {
            console.log(`Loading model: ${Math.round(progress * 70)}%`);
            setLoadProgress(progress * 0.7);
          },
        );

        setLoadProgress(0.75);
        setStatusDetailed('Initializing vision encoder...');
        console.log('📦 Model loaded, initializing vision encoder...');

        const success = await context.initMultimodal({
          path: mmprojPath,
          use_gpu: false, // Fallback to CPU for vision to avoid OpenCL hangs
          // Limit image tokens to prevent OOM on 8GB RAM devices
          image_max_tokens: imageMaxTokens,
        });

        if (!success) {
          throw new Error('Failed to initialize vision encoder (mmproj)');
        }

        setLoadProgress(1);
        setStatusDetailed('Model ready.');
        console.log('✅ Vision encoder initialized successfully');
        contextRef.current = context;
        setIsModelLoaded(true);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load model';
        console.error('❌ Model loading error:', message);
        setError(message);
        setIsModelLoaded(false);
        throw err;
      }
    },
    [],
  );

  const sendMessage = useCallback(
    async (
      text: string,
      image: string | undefined,
      history: Message[],
      onToken: (token: string) => void,
    ): Promise<string> => {
      if (!contextRef.current) {
        throw new Error('Model not loaded');
      }

      setIsGenerating(true);
      setError(null);
      setStatusDetailed('Preparing request...');

      try {
        console.log('🔄 Generating response with image:', !!image);

        // Resolve image to a local file path the native layer can fopen()
        let imagePath: string | undefined;
        if (image) {
          setStatusDetailed('Reading image file...');
          imagePath = await resolveImagePath(image);
          const exists = await RNFS.exists(imagePath);
          console.log('🖼️ Image path:', imagePath, 'exists:', exists);
          if (!exists) {
            throw new Error('Image file not found after copy');
          }
        }

        setStatusDetailed('Formatting prompt...');
        // Build prompt in Gemma 3 chat format directly (bypasses Jinja template)
        // System prompt goes in its own turn
        let prompt = `<start_of_turn>user\n${SYSTEM_PROMPT}<end_of_turn>\n<start_of_turn>model\nUnderstood. I am DentalGemma, ready to assist.<end_of_turn>\n`;

        // Add conversation history (text only)
        for (const msg of history) {
          if (msg.role === 'system') {
            continue;
          }
          if (msg.role === 'user') {
            prompt += `<start_of_turn>user\n${msg.content}<end_of_turn>\n`;
          } else if (msg.role === 'assistant') {
            prompt += `<start_of_turn>model\n${msg.content}<end_of_turn>\n`;
          }
        }

        // Add current user message
        const userText = image
          ? text || 'Analyze this dental X-ray image in detail.'
          : text;

        if (imagePath) {
          // Place <__media__> before text for Gemma 3 vision
          prompt += `<start_of_turn>user\n<__media__>\n${userText}<end_of_turn>\n`;
        } else {
          prompt += `<start_of_turn>user\n${userText}<end_of_turn>\n`;
        }
        prompt += '<start_of_turn>model\n';

        console.log('📤 FULL PROMPT TO MODEL:');
        console.log('─'.repeat(80));
        console.log(prompt);
        console.log('─'.repeat(80));
        console.log(`Prompt length: ${prompt.length} chars`);
        console.log(`Has image: ${!!imagePath}`);

        console.log('📤 Sending prompt to model (length=%d, hasImage=%s)...', prompt.length, !!imagePath);
        setStatusDetailed('Calling native completion()...');

        // Accumulate raw tokens so multi-byte sequences and space tokens
        // are cleaned in full-text context rather than individually
        let rawAccumulated = '';
        let lastCleanLength = 0;

        const result = await contextRef.current.completion(
          {
            prompt,
            media_paths: imagePath ? [imagePath] : [],
            n_predict: 1024,
            temperature: 0.2, // Lower temp to minimize UNK_BYTE sampling
            top_p: 0.9,
            top_k: 40,
            penalty_repeat: 1.15, // Break endless repetition loops
            penalty_freq: 0.05,
            stop: [...STOP_WORDS, '<end_of_turn>', '<eos>'],
          },
          data => {
            if (data.token) {
              setStatusDetailed('Receiving tokens...');
              rawAccumulated += data.token;

              // Clean the FULL accumulated text so byte sequences spanning
              // multiple tokens (e.g. split UNK_BYTE) are decoded properly
              const cleanedFull = cleanTokenizerArtifacts(rawAccumulated);

              // Send only the new characters since last update
              if (cleanedFull.length > lastCleanLength) {
                const delta = cleanedFull.substring(lastCleanLength);
                lastCleanLength = cleanedFull.length;

                if (delta.trim()) {
                  console.log('🔤 Token:', JSON.stringify(delta));
                }

                if (delta.length > 0) {
                  onToken(delta);
                }
              }
            }
          },
        );

        console.log('✅ Generation complete');
        console.log('📥 FULL MODEL RESPONSE:');
        console.log('─'.repeat(80));
        console.log(result.text || '');
        console.log('─'.repeat(80));
        console.log(`Response length: ${(result.text || '').length} chars`);
        
        setStatusDetailed('Finished generation.');
        
        // Use accumulated raw tokens (preserves space markers) over result.text
        // which may have already lost space info during llama.rn detokenization
        const cleanText = cleanTokenizerArtifacts(rawAccumulated || result.text || '');
        
        console.log('📥 CLEANED RESPONSE:');
        console.log('─'.repeat(80));
        console.log(cleanText);
        console.log('─'.repeat(80));
        
        return cleanText;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Generation failed';
        console.error('❌ Generation error:', message);
        setError(message);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  const stopGeneration = useCallback(async () => {
    await contextRef.current?.stopCompletion();
  }, []);

  const resetContext = useCallback(async () => {
    await contextRef.current?.clearCache(false);
  }, []);

  const unloadModel = useCallback(async () => {
    if (contextRef.current) {
      await contextRef.current.releaseMultimodal();
      await contextRef.current.release();
      contextRef.current = null;
    }
    setIsModelLoaded(false);
    setLoadProgress(0);
  }, []);

  return {
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
  };
};

export const SYSTEM_PROMPT = `You are DentalGemma, an expert dental AI assistant. Provide concise, clinically accurate analysis.

X-ray analysis:
- Identify anatomy
- Note pathology
- Describe location
- Suggest diagnosis & follow-up

Disclaimer: Educational info only, not a substitute for professional evaluation.`;

export const STOP_WORDS = [
  '</s>',
  '<|end|>',
  '<|eot_id|>',
  '<|end_of_text|>',
  '<|im_end|>',
  '<|EOT|>',
  '<|END_OF_TURN_TOKEN|>',
  '<|end_of_turn|>',
  '<|endoftext|>',
];

export const MODEL_FILENAME = 'dentalgemma-4b-Q4_K_M.gguf';
export const MMPROJ_FILENAME = 'mmproj-Dentalgemma-Model-BF16.gguf';

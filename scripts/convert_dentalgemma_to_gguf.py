# ---
# jupyter:
#   jupytext:
#     text_representation:
#       extension: .py
#       format_name: percent
#       format_version: '1.3'
#       jupytext_version: 1.16.0
#   kernelspec:
#     display_name: Python 3
#     language: python
#     name: python3
# ---

# %% [markdown]
# # 🦷 DentalGemma → GGUF Conversion (Multimodal)
#
# **Converts the finetuned DentalGemma 1.5 4B IT model to GGUF format
# with multimodal (vision) support for on-device mobile deployment.**
#
# ### What this notebook does:
# 1. Installs llama.cpp and builds conversion/quantization tools
# 2. Downloads `naazimsnh02/dentalgemma-1.5-4b-it` from HuggingFace
# 3. Converts safetensors → GGUF (text model)
# 4. Extracts SigLIP vision encoder → mmproj GGUF
# 5. Quantizes to Q4_K_M (~2.5 GB) for mobile
# 6. Verifies with a test inference
# 7. Packages both files for download
#
# **Runtime:** Use a **GPU runtime** (T4 is fine — GPU is only needed for
# optional test inference, conversion itself is CPU-bound).
#
# **Time:** ~15-25 minutes total.

# %% [markdown]
# ## 1. Install Dependencies

# %%
# Install core Python dependencies
!pip install -q huggingface_hub[cli] hf_transfer sentencepiece protobuf gguf numpy torch transformers

# %%
# Enable fast HuggingFace downloads
import os
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"

# %% [markdown]
# ## 2. Clone & Build llama.cpp
#
# We need three tools from llama.cpp:
# - `convert_hf_to_gguf.py` — converts safetensors to GGUF
# - `gemma3_convert_encoder_to_gguf.py` — extracts the SigLIP vision encoder
# - `llama-quantize` — quantizes the GGUF to smaller sizes
# - `llama-mtmd-cli` — (optional) test multimodal inference

# %%
# Clone llama.cpp (latest stable)
!git clone --depth 1 https://github.com/ggml-org/llama.cpp.git /content/llama.cpp

# %%
# %%
# Determine the correct multimodal CLI target
# Modern llama.cpp uses `llama-mtmd-cli`, older experimental branches used `llama-gemma3-cli`
import os

cmake_path = "/content/llama.cpp/CMakeLists.txt"
target_cli = "llama-mtmd-cli" # Default for Feb 2026

if os.path.exists(cmake_path):
    with open(cmake_path, "r") as f:
        content = f.read()
        if "llama-mtmd-cli" in content:
            target_cli = "llama-mtmd-cli"
        elif "llama-gemma3-cli" in content:
            target_cli = "llama-gemma3-cli"
        elif "llama-llava-cli" in content:
            # Fallback for generic multimodal if specific ones aren't found
            target_cli = "llama-llava-cli"

print(f"🎯 Targeted Multimodal CLI: {target_cli}")

# %%
# Build llama.cpp with the detected target
!cd /content/llama.cpp && cmake -B build \
    -DBUILD_SHARED_LIBS=OFF \
    -DGGML_CUDA=ON \
    -DLLAMA_CURL=OFF && \
    cmake --build build -j$(nproc) --target llama-quantize {target_cli} llama-cli

# %%
# Verify builds
!ls -lh /content/llama.cpp/build/bin/llama-quantize
!ls -lh /content/llama.cpp/build/bin/{target_cli}

# %% [markdown]
# ## 3. Download DentalGemma from HuggingFace
#
# Downloads the full finetuned model (~9 GB).
# If you have a private model, set your HF token first:
# ```python
# from huggingface_hub import login
# login(token="hf_YOUR_TOKEN")
# ```

# %%
from huggingface_hub import snapshot_download

MODEL_ID = "naazimsnh02/dentalgemma-1.5-4b-it"
MODEL_DIR = "/content/dentalgemma-model"
OUTPUT_DIR = "/content/dentalgemma-gguf"

os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"📥 Downloading {MODEL_ID}...")
snapshot_download(
    repo_id=MODEL_ID,
    local_dir=MODEL_DIR,
    ignore_patterns=["*.md", ".gitattributes"],
)
print("✅ Download complete!")

# %%
# Verify downloaded files
!ls -lh {MODEL_DIR}/

# %% [markdown]
# ## 4. Convert Safetensors → GGUF (Text Model)
#
# This converts the full model weights to GGUF format in BF16 precision.
# The BF16 GGUF will be ~7.8 GB — we'll quantize it next.
#
# **Patch:** MedGemma 1.5 (Jan 2026) ships a tokenizer whose hash isn't
# registered in llama.cpp yet. We patch `convert_hf_to_gguf.py` to add it.

# %%
# Patch llama.cpp's converter to recognize DentalGemma/MedGemma 1.5 tokenizer
CONVERT_SCRIPT = "/content/llama.cpp/convert_hf_to_gguf.py"
TOKENIZER_HASH = "789696f5946cc0fc59371f39f6097cafed196b3acded6140432f26bbb1ae1669"

with open(CONVERT_SCRIPT, "r") as f:
    lines = f.readlines()

if TOKENIZER_HASH not in "".join(lines):
    # Find the line with the raise NotImplementedError about BPE pre-tokenizer
    # and insert our hash check just before it, matching the file's indentation
    new_lines = []
    patched = False
    for line in lines:
        if not patched and 'raise NotImplementedError("BPE pre-tokenizer was not recognized' in line:
            # Detect the indentation of the raise line
            indent = line[:len(line) - len(line.lstrip())]
            # Insert our hash check before the raise, turning the raise into an else
            new_lines.append(f'{indent}if chkhsh == "{TOKENIZER_HASH}":\n')
            new_lines.append(f'{indent}    # DentalGemma / MedGemma 1.5 (Gemma 3 tokenizer)\n')
            new_lines.append(f'{indent}    res = "default"\n')
            new_lines.append(f'{indent}else:\n')
            new_lines.append(f'{indent}    {line.lstrip()}')
            patched = True
        else:
            new_lines.append(line)

    if patched:
        with open(CONVERT_SCRIPT, "w") as f:
            f.writelines(new_lines)
        print(f"✅ Patched convert_hf_to_gguf.py with tokenizer hash: {TOKENIZER_HASH[:16]}...")
    else:
        print("⚠️ Could not find the raise NotImplementedError line to patch")
else:
    print("✅ Tokenizer hash already recognized — no patch needed")

# %%
!cd /content/llama.cpp && python convert_hf_to_gguf.py \
    {MODEL_DIR} \
    --outfile {OUTPUT_DIR}/dentalgemma-4b-bf16.gguf \
    --outtype bf16

# %%
!ls -lh {OUTPUT_DIR}/dentalgemma-4b-bf16.gguf

# %% [markdown]
# ## 5. Extract Vision Encoder → mmproj GGUF
#
# The SigLIP vision encoder is needed for image understanding.
# This creates a separate `mmproj.gguf` file (~860 MB).

# %%
# %%
# Find the correct vision encoder conversion script
import glob

# Search for the script in examples/llava or examples/gemma3
possible_paths = [
    "/content/llama.cpp/examples/llava/gemma3_convert_encoder_to_gguf.py",
    "/content/llama.cpp/examples/gemma3/gemma3_convert_encoder_to_gguf.py",
    "/content/llama.cpp/examples/llava/convert_image_encoder_to_gguf.py" # Fallback
]

vision_script = None
for path in possible_paths:
    if os.path.exists(path):
        vision_script = path
        break

if not vision_script:
    # Try a broader search
    found = glob.glob("/content/llama.cpp/examples/**/gemma3*convert*encoder*.py", recursive=True)
    if found:
        vision_script = found[0]

if vision_script:
    print(f"✅ Found vision conversion script: {vision_script}")
    # Install pillow if needed (the script usually needs it)
    !pip install -q pillow
    
    # Convert the vision encoder
    !python {vision_script} \
        -m {MODEL_DIR} \
        --output {OUTPUT_DIR}/dentalgemma-mmproj-bf16.gguf
else:
    print("❌ ERROR: Could not find gemma3_convert_encoder_to_gguf.py or verified equivalent.")
    print("Please check the llama.cpp version or file structure.")
    # Halt execution to prevent confusion
    raise FileNotFoundError("Vision encoder script not found")

# %%
!ls -lh {OUTPUT_DIR}/dentalgemma-mmproj-bf16.gguf

# %%
!ls -lh {OUTPUT_DIR}/dentalgemma-mmproj-bf16.gguf

# %% [markdown]
# ## 6. Quantize Text Model
#
# Quantize from BF16 (~7.8 GB) to smaller formats for mobile deployment.
# We create two variants:
# - **Q4_K_M** (~2.5 GB) — Best balance of quality vs size for flagships
# - **Q3_K_M** (~2.1 GB) — Smaller, for devices with less RAM

# %%
# Q4_K_M — Recommended for most devices (8+ GB RAM)
!/content/llama.cpp/build/bin/llama-quantize \
    {OUTPUT_DIR}/dentalgemma-4b-bf16.gguf \
    {OUTPUT_DIR}/dentalgemma-4b-Q4_K_M.gguf \
    Q4_K_M

# %%
# Q3_K_M — Smaller variant for tighter memory budgets
!/content/llama.cpp/build/bin/llama-quantize \
    {OUTPUT_DIR}/dentalgemma-4b-bf16.gguf \
    {OUTPUT_DIR}/dentalgemma-4b-Q3_K_M.gguf \
    Q3_K_M

# %%
# Also quantize the mmproj to fp16 (smaller than bf16, same quality for vision)
!/content/llama.cpp/build/bin/llama-quantize \
    {OUTPUT_DIR}/dentalgemma-mmproj-bf16.gguf \
    {OUTPUT_DIR}/dentalgemma-mmproj-f16.gguf \
    F16

# %%
# Summary of all generated files
print("=" * 60)
print("📦 Generated GGUF Files:")
print("=" * 60)
!ls -lh {OUTPUT_DIR}/*.gguf
print()
print("For mobile deployment, you need TWO files:")
print("  1. Text model:   dentalgemma-4b-Q4_K_M.gguf")
print("  2. Vision model: dentalgemma-mmproj-f16.gguf (or bf16)")
print()
print(f"Total size (Q4_K_M + mmproj): ", end="")
!du -ch {OUTPUT_DIR}/dentalgemma-4b-Q4_K_M.gguf {OUTPUT_DIR}/dentalgemma-mmproj-f16.gguf | tail -1

# %% [markdown]
# ## 7. Test Inference (Optional)
#
# Quick sanity check that the converted model works.
# Requires GPU runtime for reasonable speed.

# %% [markdown]
# ### 7a. Text-only test

# %%
!/content/llama.cpp/build/bin/llama-cli \
    -m {OUTPUT_DIR}/dentalgemma-4b-Q4_K_M.gguf \
    -p "<start_of_turn>user\nA 35-year-old patient presents with severe throbbing pain in the lower right molar. What are the possible diagnoses?<end_of_turn>\n<start_of_turn>model\n" \
    --no-conversation \
    -n 200 \
    --temp 0.7 \
    --top-k 40 \
    --top-p 0.95 \
    -ngl 99

# %% [markdown]
# ### 7b. Multimodal test (image + text)
#
# Download a sample dental X-ray and test vision inference.

# %%
# Download a sample dental X-ray for testing
!wget -q -O /content/test_xray.jpg \
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Dental_X-Ray.jpg/640px-Dental_X-Ray.jpg" \
    2>/dev/null || echo "⚠️ Could not download test image — skipping vision test"

# %%
# Test multimodal inference (text + image)
# This uses the dynamically determined multimodal CLI (llama-mtmd-cli or equivalent)
if os.path.exists("/content/test_xray.jpg"):
    print("🔍 Running multimodal inference test...")
    !echo "Analyze this dental X-ray for any abnormalities." | \
        /content/llama.cpp/build/bin/{target_cli} \
        -m {OUTPUT_DIR}/dentalgemma-4b-Q4_K_M.gguf \
        --mmproj {OUTPUT_DIR}/dentalgemma-mmproj-f16.gguf \
        --image /content/test_xray.jpg \
        -n 200 \
        -ngl 99 \
        --no-conversation \
        -p "<start_of_turn>user\nAnalyze this dental X-ray for any abnormalities.<end_of_turn>\n<start_of_turn>model\n"
else:
    print("⚠️ No test image available — skipping multimodal test")

# %% [markdown]
# ## 8. Download Converted Files
#
# Download the two files you need for your mobile app:
# 1. **Text model** (Q4_K_M) — the main LLM
# 2. **Vision model** (mmproj) — the SigLIP image encoder
#
# You can also optionally delete the large BF16 file to free up space.

# %%
# (Optional) Remove the large BF16 file to free disk space
# Uncomment the line below if you're running low on storage
# !rm {OUTPUT_DIR}/dentalgemma-4b-bf16.gguf

# %%
# Zip the files for easier download
!cd {OUTPUT_DIR} && zip -j /content/dentalgemma-gguf-Q4_K_M.zip \
    dentalgemma-4b-Q4_K_M.gguf \
    dentalgemma-mmproj-f16.gguf

!ls -lh /content/dentalgemma-gguf-Q4_K_M.zip

# %%
# Download via Colab (only works in Colab)
try:
    from google.colab import files
    print("📥 Starting download... (this may take a few minutes for ~3 GB)")
    files.download("/content/dentalgemma-gguf-Q4_K_M.zip")
except ImportError:
    print("Not running in Colab — download manually from:")
    print(f"  /content/dentalgemma-gguf-Q4_K_M.zip")

# %% [markdown]
# ## Alternative: Upload to HuggingFace Hub
#
# If the file is too large to download directly, push it to a HF repo instead.

# %%
# Uncomment and run this cell to upload to HuggingFace
# from huggingface_hub import HfApi, login
#
# # Login first (set your token)
# login(token="hf_YOUR_WRITE_TOKEN")
#
# api = HfApi()
# REPO_ID = "naazimsnh02/dentalgemma-1.5-4b-it-GGUF"
#
# # Create the repo if it doesn't exist
# api.create_repo(repo_id=REPO_ID, exist_ok=True)
#
# # Upload Q4_K_M
# api.upload_file(
#     path_or_fileobj=f"{OUTPUT_DIR}/dentalgemma-4b-Q4_K_M.gguf",
#     path_in_repo="dentalgemma-4b-Q4_K_M.gguf",
#     repo_id=REPO_ID,
# )
# # Upload mmproj
# api.upload_file(
#     path_or_fileobj=f"{OUTPUT_DIR}/dentalgemma-mmproj-f16.gguf",
#     path_in_repo="dentalgemma-mmproj-f16.gguf",
#     repo_id=REPO_ID,
# )
# # Upload Q3_K_M variant too
# api.upload_file(
#     path_or_fileobj=f"{OUTPUT_DIR}/dentalgemma-4b-Q3_K_M.gguf",
#     path_in_repo="dentalgemma-4b-Q3_K_M.gguf",
#     repo_id=REPO_ID,
# )
# print(f"✅ Uploaded to https://huggingface.co/{REPO_ID}")

# %% [markdown]
# ## ✅ Done!
#
# You now have two GGUF files ready for mobile deployment:
#
# | File | Size | Purpose |
# |------|------|---------|
# | `dentalgemma-4b-Q4_K_M.gguf` | ~2.5 GB | Main text/chat model |
# | `dentalgemma-mmproj-f16.gguf` | ~860 MB | SigLIP vision encoder for X-ray images |
#
# **Total: ~3.4 GB** — fits on modern smartphones (8+ GB RAM).
#
# ### Next Steps
# Use these files in your React Native mobile app with `llama.rn` or
# a custom native bridge to llama.cpp.

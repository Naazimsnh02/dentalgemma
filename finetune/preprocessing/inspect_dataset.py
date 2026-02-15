import argparse
from pathlib import Path
from datasets import load_from_disk
import json

def inspect(dataset_path: str, num_samples: int = 3, split: str = "train"):
    """
    Load a Hugging Face dataset from disk and print a few samples.
    """
    path = Path(dataset_path)
    if not path.exists():
        print(f"❌ Error: Dataset not found at {path}")
        return

    print(f"📂 Loading dataset from: {path}")
    try:
        dataset_dict = load_from_disk(str(path))
    except Exception as e:
        print(f"❌ Failed to load dataset: {e}")
        return

    if split not in dataset_dict:
        print(f"❌ Split '{split}' not found. Available splits: {list(dataset_dict.keys())}")
        return

    dataset = dataset_dict[split]
    print(f"✅ Loaded '{split}' split with {len(dataset)} examples.\n")

    # Determine how many samples to show
    total = len(dataset)
    indices = range(min(num_samples, total))

    for i in indices:
        example = dataset[i]
        print(f"--- Sample {i+1} ---")
        
        # Iterate through fields
        for key, value in example.items():
            print(f"[{key}]: ", end="")
            
            # Special handling for Images
            if "image" in key and value is not None:
                # If it's a PIL Image, print its details
                try:
                    print(f"<PIL.Image mode={value.mode} size={value.size}>")
                except:
                    print(str(value))
            
            # Special handling for 'messages' (pretty print JSON if it is a string)
            elif key == "messages" and isinstance(value, str):
                try:
                    parsed = json.loads(value)
                    # Pretty print the JSON structure
                    print("\n" + json.dumps(parsed, indent=2))
                except:
                    print(value)
            
            # Default print
            else:
                print(value)
        print("\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Inspect local Hugging Face Arrow datasets.")
    parser.add_argument("--path", type=str, default="../output/dentalgemma-instruct", 
                        help="Path to the saved dataset directory (e.g., ../output/dentalgemma-instruct)")
    parser.add_argument("--n", type=int, default=3, help="Number of samples to view")
    parser.add_argument("--split", type=str, default="train", help="Dataset split to view (train/validation)")

    args = parser.parse_args()
    inspect(args.path, args.n, args.split)

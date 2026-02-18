
import os
import sys
from pathlib import Path
from datasets import load_from_disk
import pandas as pd

# Set up paths
SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = SCRIPT_DIR.parent / "output"

def export_dataset_to_csv(dataset_name):
    dataset_path = OUTPUT_DIR / dataset_name
    if not dataset_path.exists():
        print(f"Dataset path not found: {dataset_path}")
        return

    print(f"Loading dataset: {dataset_name} from {dataset_path}")
    try:
        dataset_dict = load_from_disk(str(dataset_path))
    except Exception as e:
        print(f"Failed to load dataset: {e}")
        return

    for split in dataset_dict.keys():
        print(f"Processing split: {split}")
        dataset = dataset_dict[split]
        
        # Convert to pandas DataFrame
        df = dataset.to_pandas()
        
        # Drop image column if present (it's binary data not useful for CSV)
        if 'image' in df.columns:
            print("Dropping image column...")
            df = df.drop(columns=['image'])
            
        # Define output CSV path
        csv_filename = f"{dataset_name}_{split}.csv"
        csv_path = OUTPUT_DIR / csv_filename
        
        # Save to CSV
        print(f"Saving to {csv_path}")
        try:
            df.to_csv(csv_path, index=False, encoding='utf-8')
            print(f"Successfully saved {csv_filename}")
        except Exception as e:
            print(f"Failed to save CSV: {e}")

if __name__ == "__main__":
    if not OUTPUT_DIR.exists():
        print(f"Output directory does not exist: {OUTPUT_DIR}")
    else:
        export_dataset_to_csv("dentalgemma-vqa")
        export_dataset_to_csv("dentalgemma-instruct")
        print("\nAll exports complete.")

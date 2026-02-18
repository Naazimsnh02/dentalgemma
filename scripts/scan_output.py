
import sys

def scan_file(filename):
    print(f"--- Scanning {filename} ---")
    try:
        with open(filename, 'r', encoding='utf-16-le') as f:
            lines = f.readlines()
    except:
        try:
             with open(filename, 'r', encoding='utf-8') as f:
                lines = f.readlines()
        except:
             print("Could not read file")
             return

    for i, line in enumerate(lines):
        if "Findings" in line or "Recommendation" in line or "Analysis" in line or "xray_analysis" in line:
            print(f"Line {i}: {line.strip()[:200]}")

if __name__ == "__main__":
    scan_file('scripts/output.txt')
    scan_file('scripts/output1.txt')

import json
import re

def parse_output(filename):
    print(f"--- Parsing {filename} ---")
    try:
        with open(filename, 'r', encoding='utf-16-le') as f:
            content = f.read()
    except:
        try:
             with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading file: {e}")
            return

    # Try to find JSON-like structures or just print the raw content if it's not too huge
    # The user said it contains the output. 
    # Let's look for "Response:" which seems to be what test_endpoints.py prints.
    
    match = re.search(r'Response:\s*(\{.*?\})\s*(?:Time Taken|$)', content, re.DOTALL)
    if match:
        json_str = match.group(1)
        try:
            data = json.loads(json_str)
            print("Successfully parsed JSON response.")
            if 'analysis' in data:
                print("Field 'analysis' found. Content:")
                print(data['analysis'])
            if 'xray_analysis' in data:
                print("Field 'xray_analysis' found. Content:")
                print(json.dumps(data['xray_analysis'], indent=2))
        except json.JSONDecodeError as e:
            print(f"Found JSON-like block but failed to parse: {e}")
            print("Block snippet:", json_str[:500])
    else:
        print("No 'Response:' JSON block found. Printing first 1000 chars:")
        print(content[:1000])

if __name__ == "__main__":
    parse_output('scripts/output.txt')
    parse_output('scripts/output1.txt')

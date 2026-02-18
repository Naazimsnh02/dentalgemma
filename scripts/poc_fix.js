
const text = `## Clinical Findings

**Overall oral health condition:** Unhealthy
**Visible abnormalities:** dental caries, dental infection
**Severity:** Moderate
**Recommendation:** Multiple teeth affected; comprehensive treatment needed.

## Clinical Recommendations

- Schedule a follow-up`;

function extractFindings(text) {
    // New Proposed Regex
    // Stop at ## 
    // OR stop at ** followed by one of the known section keywords
    const keywords = "Findings|Recommendations|Analysis|Diagnosis|Conclusion|Clinical|Key|Priority";
    const pattern = `(?:##|\\*\\*)\\s*(?:(?:${keywords})\\s+)?Findings?(?:Details)?(?:\\*\\*)?[:\\s]*\\n([\\s\\S]*?)(?=\\n(?:##|\\*\\*\\s*(?:${keywords}))|$)`;
    
    const regex = new RegExp(pattern, 'i');
    const sectionMatch = text.match(regex);
    
    let targetText = text;
    if (sectionMatch) {
      console.log("MATCHED SECTION:", JSON.stringify(sectionMatch[0]));
      targetText = sectionMatch[1].trim();

      // Also fix the truncation regex inside
       const recStartRegex = new RegExp(`(?:##|\\*\\*)\\s*(?:(?:Clinical|Priority)\\s+)?Recommendations?`, 'i');
      const recStart = targetText.search(recStartRegex);
      if (recStart > 0) {
        targetText = targetText.substring(0, recStart);
      }
    }

    const findings = [];
    const lines = targetText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Allow bullets OR lines starting with **
      if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/) || trimmed.startsWith('**')) {
        let cleaned = trimmed;
        if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
             cleaned = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
        }
        
        // Filter out empty lines or just "**Heading**" if it was a false positive? 
        // Actually if it starts with **, we want to keep it as a finding if it's a key-value pair.
        if (cleaned.length > 5 && !cleaned.endsWith(':')) {
             findings.push(cleaned);
        }
      }
    }
    
    return findings;
}

const findings = extractFindings(text);
console.log("FINDINGS:", findings);


const text = `## Clinical Findings

**Overall oral health condition:** Unhealthy
**Visible abnormalities:** dental caries, dental infection
**Severity:** Moderate
**Recommendation:** Multiple teeth affected; comprehensive treatment needed.

## Clinical Recommendations

- Schedule a follow-up
- Daily flossing`;

function extractFindings(text) {
    // Exact logic from modal-client.ts
    const sectionKeywords = "Findings|Recommendations|Analysis|Diagnosis|Conclusion|Clinical|Key|Priority";
    const sectionMatch = text.match(new RegExp(`(?:##|\\*\\*)\\s*(?:(?:${sectionKeywords})\\s+)?Findings?(?:Details)?(?:\\*\\*)?[:\\s]*\\n([\\s\\S]*?)(?=\\n(?:##|\\*\\*\\s*(?:${sectionKeywords}))|$)`, 'i'));
    
    let targetText = text;
    if (sectionMatch) {
      targetText = sectionMatch[1].trim();
      
      const recStart = targetText.search(new RegExp(`(?:##|\\*\\*)\\s*(?:(?:Clinical|Priority)\\s+)?Recommendations?`, 'i'));
      if (recStart > 0) {
        targetText = targetText.substring(0, recStart);
      }
    } else {
      const recStart = text.search(/(?:##|\*\*)\s*(?:(?:Clinical|Priority)\s+)?Recommendations?/i);
      if (recStart > 0) {
        targetText = text.substring(0, recStart);
      }
    }

    const findings = [];
    const lines = targetText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/) || trimmed.startsWith('**')) {
        let cleaned = trimmed;
        if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
          cleaned = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
        }
        
        if (cleaned.length > 5 && !cleaned.endsWith(':')) {
          findings.push(cleaned);
        }
      }
    }
    
    // If we found specific section bullets, return them
    if (findings.length > 0) return findings;

    if (sectionMatch && targetText.length > 0) {
      return [targetText];
    }

    return [text.substring(0, 500) + '...']; 
}

const findings = extractFindings(text);
console.log("FINDINGS:", findings);
console.log("LENGTH:", findings.length);

if (findings.length >= 3 && findings[0].includes("Unhealthy")) {
    console.log("VERIFICATION PASSED");
} else {
    console.log("VERIFICATION FAILED");
}

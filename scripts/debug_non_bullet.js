
const text = `## Clinical Findings

**Overall oral health condition:** Unhealthy
**Visible abnormalities:** dental caries, dental infection
**Severity:** Moderate
**Recommendation:** Multiple teeth affected; comprehensive treatment needed.`;

function extractFindings(text) {
    // Current Regex in ModalClient.ts
    // Note: [\s\S]*? is non-greedy. It stops at the FIRST newline followed by ## or ** or end of string.
    // Wait, the lookahead is (?=\n(?:##|\*\*)|$)
    // So it should match until the next section header.
    const sectionMatch = text.match(/(?:##|\*\*)\s*(?:(?:Clinical|Key)\s+)?Findings?(?:Details)?(?:\*\*)?[:\s]*\n([\s\S]*?)(?=\n(?:##|\*\*)|$)/i);
    
    let targetText = text;
    if (sectionMatch) {
      console.log("MATCHED SECTION RAW:", JSON.stringify(sectionMatch[0]));
      console.log("CAPTURED GROUP 1:", JSON.stringify(sectionMatch[1]));
      targetText = sectionMatch[1].trim();
      
      const recStart = targetText.search(/(?:##|\*\*)\s*(?:(?:Clinical|Priority)\s+)?Recommendations?/i);
      if (recStart > 0) {
        targetText = targetText.substring(0, recStart);
      }
    }

    const findings = [];
    const lines = targetText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Current strict bullet check
      if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        const cleaned = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
        if (cleaned.length > 5 && !cleaned.startsWith('**') && !cleaned.endsWith(':')) {
          findings.push(cleaned);
        }
      }
    }
    
    // If we found specific section bullets, return them
    if (findings.length > 0) return findings;

    // Fallback: If no bullets found in section, return the whole section text as one item
    if (sectionMatch && targetText.length > 0) {
      console.log("FALLBACK USED. targetText:", JSON.stringify(targetText));
      return [targetText];
    }
    return [text.substring(0, 500) + '...']; 
}

const findings = extractFindings(text);
console.log("FINDINGS:", findings);

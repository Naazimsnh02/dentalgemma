
const text = `
## Clinical Findings

**Overall oral health condition:** Unhealthy

- Right mandibular region: dental caries visible
- Left maxillary region: potential fracture

## Clinical Recommendations

- Schedule a follow-up
- Daily flossing
`;

function extractFindings(text) {
    // New Regex in ModalClient.ts
    const sectionMatch = text.match(/(?:##|\*\*)\s*(?:(?:Clinical|Key)\s+)?Findings?(?:Details)?(?:\*\*)?[:\s]*\n([\s\S]*?)(?=\n(?:##|\*\*)|$)/i);
    
    let targetText = text;
    if (sectionMatch) {
      console.log("MATCHED SECTION:", sectionMatch[0]);
      targetText = sectionMatch[1].trim();

      const recStart = targetText.search(/(?:##|\*\*)\s*(?:(?:Clinical|Priority)\s+)?Recommendations?/i);
      if (recStart > 0) {
        targetText = targetText.substring(0, recStart);
      }
    } else {
      console.log("NO SECTION MATCH");
      const recStart = text.search(/(?:##|\*\*)\s*(?:(?:Clinical|Priority)\s+)?Recommendations?/i);
      if (recStart > 0) {
        targetText = text.substring(0, recStart);
      }
    }

    const findings = [];
    const lines = targetText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        const cleaned = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
        if (cleaned.length > 5 && !cleaned.startsWith('**') && !cleaned.endsWith(':')) {
            findings.push(cleaned);
        }
      }
    }
    return findings;
}

function extractRecommendations(text) {
    // New Regex
    const sectionMatch = text.match(/(?:##|\*\*)\s*(?:(?:Clinical|Priority)\s+)?Recommendations?\s*(?:Details)?(?:\*\*)?[:\s]*\n([\s\S]*?)(?=\n(?:##|\*\*)|$)/i);
    
    let targetText = '';
    if (sectionMatch) {
      console.log("MATCHED REC SECTION:", sectionMatch[0]);
      targetText = sectionMatch[1].trim();
    } else {
      const match = text.match(/Recommendations?[:\s]*\n([\s\S]*)/i);
      if (match) {
        targetText = match[1].trim();
      }
    }

    if (!targetText) return [];

    const recommendations = [];
    const lines = targetText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        const cleaned = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
        if (cleaned.length > 5 && !cleaned.startsWith('**') && !cleaned.endsWith(':')) {
          recommendations.push(cleaned);
        }
      }
    }
    
    return recommendations;
}

const findings = extractFindings(text);
const recommendations = extractRecommendations(text);

console.log("FINDINGS (Should have 2 items):", findings);
console.log("RECOMMENDATIONS (Should have 2 items):", recommendations);

if (findings.length === 2 && !findings.includes('Schedule a follow-up') && recommendations.length === 2) {
    console.log("VERIFICATION PASSED");
} else {
    console.log("VERIFICATION FAILED");
}

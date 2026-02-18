
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
    // Current Regex in ModalClient.ts
    const sectionMatch = text.match(/(?:##|\*\*)\s*Findings?(?:Details)?(?:\*\*)?[:\s]*\n([\s\S]*?)(?=\n(?:##|\*\*)|$)/i);
    
    let targetText = text;
    if (sectionMatch) {
      console.log("MATCHED SECTION:", sectionMatch[0]);
      targetText = sectionMatch[1].trim();
    } else {
      console.log("NO SECTION MATCH");
      // If no specific subsection, try to avoid the Recommendations section if it exists
      const recStart = text.search(/(?:##|\*\*)\s*Recommendations?/i);
      console.log("REC START:", recStart); // Should be -1 if it fails
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

const findings = extractFindings(text);
console.log("FINDINGS (Should NOT include 'Schedule a follow-up'):", findings);

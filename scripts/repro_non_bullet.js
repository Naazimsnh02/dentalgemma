
const text = `## Clinical Findings

**Overall oral health condition:** Unhealthy
**Visible abnormalities:** dental caries, dental infection
**Severity:** Moderate
**Recommendation:** Multiple teeth affected; comprehensive treatment needed.`;

function extractFindings(text) {
    // Current Regex in ModalClient.ts
    const sectionMatch = text.match(/(?:##|\*\*)\s*(?:(?:Clinical|Key)\s+)?Findings?(?:Details)?(?:\*\*)?[:\s]*\n([\s\S]*?)(?=\n(?:##|\*\*)|$)/i);
    
    let targetText = text;
    if (sectionMatch) {
      targetText = sectionMatch[1].trim();
      
      const recStart = targetText.search(/(?:##|\*\*)\s*(?:(?:Clinical|Priority)\s+)?Recommendations?/i);
      if (recStart > 0) {
        targetText = targetText.substring(0, recStart);
      }
    } else {
        // ... (fallback logic)
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
    
    if (findings.length > 0) return findings;
    if (sectionMatch && targetText.length > 0) return [targetText]; // Fallback to whole text
    return [text.substring(0, 500) + '...']; 
}

const findings = extractFindings(text);
console.log("FINDINGS:", findings);
// Expected: It mimics the current failure. 
// If it returns [targetText], then maybe it displays as one big block?
// But the user screenshot shows "Overall oral health condition: Unhealthy" as a single bullet item. 
// Wait, why did it pick up one line in the user's screenshot?
// Ah, maybe the user's actual output had a bullet for that one line? 
// Or maybe the fallback `return [targetText]` is being used, but `targetText` is somehow just that line?
// Let's see what the script outputs.

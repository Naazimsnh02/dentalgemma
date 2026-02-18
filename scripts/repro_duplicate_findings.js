
const text = `
## Clinical Findings

**Findings:**
- Right mandibular region: dental infection detected.
- Right mandibular region: dental infection detected.
- Right maxillary region: dental infection detected.
**Differential Diagnosis:**
* **Dental Caries**
* **Periapical Abscess**

## Recommendations
- Consult dentist.
`;

function extractSectionList(text, sectionNameRegex, stopKeywords) {
    // RELAXED REGEX: Match section name and then consume rest of line
    const regex = new RegExp(`(?:##|\\*\\*)\\s*${sectionNameRegex}.*?\\n([\\s\\S]*?)(?=\\n(?:##|\\*\\*\\s*(?:${stopKeywords}))|$)`, 'i');
    
    const sectionMatch = text.match(regex);
    let targetText = '';
    
    if (sectionMatch) {
      targetText = sectionMatch[1].trim();
      
      // Secondary stop check
      const stopRegex = new RegExp(`(?:##|\\*\\*)\\s*(?:${stopKeywords})`, 'i');
      const stopIndex = targetText.search(stopRegex);
      if (stopIndex > 0) {
        targetText = targetText.substring(0, stopIndex);
      }
    } else {
        const looseRegex = new RegExp(`${sectionNameRegex}[:\\s]*\\n([\\s\\S]*?)(?=\\n(?:##|\\*\\*)|$)`, 'i');
        const looseMatch = text.match(looseRegex);
        if (looseMatch) {
            targetText = looseMatch[1].trim();
        }
    }
    
    if (!targetText) return [];

    const items = [];
    const seen = new Set();
    const lines = targetText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/) || trimmed.startsWith('**')) {
        let cleaned = trimmed;
        if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
          cleaned = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
        }
        
        const plainText = cleaned.replace(/^\*\*/, '').replace(/\*\*[:\s]*$/, '').replace(/:$/, '').trim();
        
        // Validation including new keywords prevention
        const isHeaderLike = plainText.length < 30 && (plainText.match(/findings|diagnosis|analysis|recommendations/i));
        
        if (cleaned.length > 3 && !seen.has(cleaned) && !isHeaderLike && !cleaned.endsWith(':')) {
             items.push(cleaned);
             seen.add(cleaned);
        }
      }
    }
    return items;
}

function extractFindings(text) {
    // START FIX: Remove "Findings" from stop list
    const sectionKeywords = "Recommendations|Analysis|Diagnosis|Differential|Conclusion|Clinical|Key|Priority"; // Removed Findings
    // But we still want "Findings" in the sectionNameRegex prefix part?
    // The previous code used sectionKeywords for both.
    // Ideally we pass specific lists.
    
    // Adjusted: sectionNameRegex uses "Findings" literally or with prefix.
    // stopKeywords uses the list above.
    
    const prefixKeywords = "Findings|Recommendations|Analysis|Diagnosis|Conclusion|Clinical|Key|Priority"; // For prefix matching
    
    return extractSectionList(text, `(?:(?:${prefixKeywords})\\s+)?Findings?(?:Details)?`, sectionKeywords);
}

function extractDifferentialDiagnosis(text) {
    const results = extractSectionList(text, 'Differential\\s+Diagnosis', "Findings|Recommendations|Analysis|Conclusion|Clinical|Key|Priority|Plan");
    if (results.length > 0) return results;
    return undefined;
}

console.log("Findings:", extractFindings(text));
console.log("Differential Diagnosis:", extractDifferentialDiagnosis(text));

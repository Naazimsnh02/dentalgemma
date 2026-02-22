import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import type {ResearchPaper} from '../../types/research';

interface PaperCardProps {
  paper: ResearchPaper;
  onSave: (paper: ResearchPaper) => void;
  onUnsave: (pmid: string) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  onSave,
  onUnsave,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleSave = () => {
    if (paper.saved) {
      onUnsave(paper.pmid);
    } else {
      onSave(paper);
    }
  };

  const handleOpenPubMed = async () => {
    try {
      // Ensure URL is properly formatted
      const url = paper.url.startsWith('http') 
        ? paper.url 
        : `https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`;
      
      console.log('Opening URL:', url); // Debug log
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Cannot Open Link',
          `Unable to open: ${url}\n\nPlease check your browser settings.`,
        );
      }
    } catch (err) {
      console.error('Linking error:', err);
      Alert.alert(
        'Error Opening Link',
        `Failed to open PubMed link. Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
  };

  const formatAuthors = (authors: string[]): string => {
    if (authors.length === 0) return 'Unknown authors';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    return `${authors[0]} et al.`;
  };

  const truncateAbstract = (text: string, maxLength: number = 200): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={3}>
            {paper.title}
          </Text>
          <Text style={styles.authors}>{formatAuthors(paper.authors)}</Text>
        </View>
        <TouchableOpacity
          onPress={handleToggleSave}
          style={[styles.saveButton, paper.saved && styles.saveButtonActive]}>
          <Text style={styles.saveIcon}>{paper.saved ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      {/* Metadata */}
      <View style={styles.metadata}>
        {paper.journal && (
          <View style={styles.metadataItem}>
            <Text style={styles.metadataIcon}>📄</Text>
            <Text style={styles.metadataText} numberOfLines={1}>
              {paper.journal}
            </Text>
          </View>
        )}
        {paper.date && (
          <View style={styles.metadataItem}>
            <Text style={styles.metadataIcon}>📅</Text>
            <Text style={styles.metadataText}>{paper.date}</Text>
          </View>
        )}
      </View>

      {/* Abstract */}
      {paper.abstract && (
        <View style={styles.abstractContainer}>
          <Text style={styles.abstract} numberOfLines={isExpanded ? undefined : 3}>
            {isExpanded ? paper.abstract : truncateAbstract(paper.abstract)}
          </Text>
          {paper.abstract.length > 200 && (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Text style={styles.expandButton}>
                {isExpanded ? 'Show less' : 'Show more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Keywords */}
      {paper.keywords.length > 0 && (
        <View style={styles.keywordsContainer}>
          {paper.keywords.slice(0, 3).map((keyword, index) => (
            <View key={index} style={styles.keyword}>
              <Text style={styles.keywordIcon}>🏷️</Text>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
          {paper.keywords.length > 3 && (
            <Text style={styles.moreKeywords}>
              +{paper.keywords.length - 3} more
            </Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleOpenPubMed}
          style={styles.primaryButton}>
          <Text style={styles.primaryButtonIcon}>🔗</Text>
          <Text style={styles.primaryButtonText}>View on PubMed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 22,
  },
  authors: {
    fontSize: 13,
    color: '#6B7280',
  },
  saveButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  saveButtonActive: {
    backgroundColor: '#DBEAFE',
  },
  saveIcon: {
    fontSize: 20,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '48%',
  },
  metadataIcon: {
    fontSize: 12,
  },
  metadataText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  abstractContainer: {
    marginBottom: 12,
  },
  abstract: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  expandButton: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 6,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  keyword: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  keywordIcon: {
    fontSize: 10,
  },
  keywordText: {
    fontSize: 11,
    color: '#6B7280',
  },
  moreKeywords: {
    fontSize: 11,
    color: '#9CA3AF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  primaryButtonIcon: {
    fontSize: 16,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

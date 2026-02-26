import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SectionHeaderProps {
  emoji: string;
  title: string;
  onViewMore?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  emoji,
  title,
  onViewMore,
}) => (
  <View style={styles.row}>
    <Text style={styles.title}>
      {emoji} {title}
    </Text>
    {onViewMore && (
      <TouchableOpacity onPress={onViewMore}>
        <Text style={styles.viewMore}>View More</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  viewMore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
});

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ReportContent } from '@/lib/validators/report';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica' },
  title: { fontSize: 18, marginBottom: 8, fontWeight: 'bold' },
  meta: { fontSize: 10, color: '#555', marginBottom: 16 },
  section: { marginBottom: 12 },
  heading: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  body: { lineHeight: 1.4 },
  bullet: { marginLeft: 8, marginBottom: 2 },
});

export function buildReportDocument(input: {
  playerName: string;
  periodStart: string;
  periodEnd: string;
  content: ReportContent;
}) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.title }, `Rapor — ${input.playerName}`),
      React.createElement(Text, { style: styles.meta }, `Periode ${input.periodStart} s/d ${input.periodEnd}`),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.heading }, 'Ringkasan'),
        React.createElement(Text, { style: styles.body }, input.content.summary),
      ),
      React.createElement(Text, { style: styles.heading }, 'Sorotan'),
      ...input.content.highlights.map((item, index) =>
        React.createElement(Text, { key: `h-${index}`, style: styles.bullet }, `• ${item}`),
      ),
      React.createElement(Text, { style: { ...styles.heading, marginTop: 12 } }, 'Area perbaikan'),
      ...input.content.improvements.map((item, index) =>
        React.createElement(Text, { key: `i-${index}`, style: styles.bullet }, `• ${item}`),
      ),
    ),
  );
}

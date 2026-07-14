import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { QUESTION_TYPES } from '@/constants/academic';

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#111',
    lineHeight: 1.45,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  meta: {
    fontSize: 10,
    textAlign: 'center',
    color: '#333',
    marginBottom: 2,
  },
  instructionsBox: {
    marginBottom: 16,
  },
  instructionsLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 10,
    color: '#222',
  },
  section: {
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: '#999',
  },
  sectionMeta: {
    fontSize: 9,
    color: '#555',
    marginBottom: 8,
  },
  question: {
    marginBottom: 12,
  },
  questionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  questionNumber: {
    fontFamily: 'Helvetica-Bold',
    width: 22,
  },
  questionBody: {
    flex: 1,
  },
  questionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  questionText: {
    flex: 1,
  },
  marks: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  option: {
    marginTop: 3,
    paddingLeft: 4,
  },
  answerLines: {
    marginTop: 8,
    borderBottomWidth: 0.75,
    borderBottomColor: '#bbb',
    borderStyle: 'dashed',
    height: 18,
  },
  answerLinesTall: {
    marginTop: 8,
    borderBottomWidth: 0.75,
    borderBottomColor: '#bbb',
    borderStyle: 'dashed',
    height: 18,
    marginBottom: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 44,
    right: 44,
    fontSize: 9,
    color: '#666',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const SECTION_LABELS = {
  MCQ: 'Section A — Multiple Choice Questions',
  SHORT_QUESTION: 'Section B — Short Questions',
  LONG_QUESTION: 'Section C — Long Questions',
};

const letterFor = (index) => String.fromCharCode(65 + index);

const groupByType = (questions = []) =>
  QUESTION_TYPES.map((questionType) => {
    const items = questions.filter((q) => q.questionType === questionType);
    const marks = items.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    return { questionType, items, marks };
  }).filter((section) => section.items.length > 0);

const AnswerSpace = ({ lines = 1 }) => (
  <View>
    {Array.from({ length: lines }).map((_, index) => (
      <View
        key={index}
        style={index === lines - 1 ? styles.answerLines : styles.answerLinesTall}
      />
    ))}
  </View>
);

const QuestionBlock = ({ item, index }) => (
  <View style={styles.question}>
    <View style={styles.questionRow}>
      <Text style={styles.questionNumber}>{index + 1}.</Text>
      <View style={styles.questionBody}>
        <View style={styles.questionTop}>
          <Text style={styles.questionText}>{item.text}</Text>
          <Text style={styles.marks}>[{Number(item.marks)}]</Text>
        </View>

        {item.questionType === 'MCQ' && item.options?.length ? (
          <View>
            {[...item.options]
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((opt, optIndex) => (
                <Text key={opt.id || optIndex} style={styles.option}>
                  {letterFor(optIndex)}) {opt.text}
                </Text>
              ))}
          </View>
        ) : null}

        {item.questionType === 'SHORT_QUESTION' ? <AnswerSpace lines={2} /> : null}
        {item.questionType === 'LONG_QUESTION' ? <AnswerSpace lines={5} /> : null}
      </View>
    </View>
  </View>
);

const QuestionPaperDocument = ({ paper }) => {
  const questions = paper?.questions ?? [];
  const sections = groupByType(questions);
  const metaLine = [paper?.class?.name, paper?.subject?.name, paper?.testType?.name]
    .filter(Boolean)
    .join(' · ');
  const statsLine = [
    `${questions.length} questions`,
    `${Number(paper?.totalMarks || 0)} marks`,
    paper?.durationMinutes ? `Time: ${paper.durationMinutes} minutes` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Document
      title={paper?.title || 'Question Paper'}
      author="School Management System"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{paper?.title || 'Question Paper'}</Text>
          {metaLine ? <Text style={styles.meta}>{metaLine}</Text> : null}
          <Text style={styles.meta}>{statsLine}</Text>
        </View>

        {paper?.instructions ? (
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsLabel}>Instructions</Text>
            <Text style={styles.instructionsText}>{paper.instructions}</Text>
          </View>
        ) : null}

        {sections.map((section) => (
          <View key={section.questionType} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {SECTION_LABELS[section.questionType]}
            </Text>
            <Text style={styles.sectionMeta}>
              {section.items.length}{' '}
              {section.items.length === 1 ? 'question' : 'questions'} ·{' '}
              {section.marks} marks
            </Text>
            {section.items.map((item, index) => (
              <QuestionBlock key={item.id || index} item={item} index={index} />
            ))}
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text>{paper?.title || 'Question Paper'}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export default QuestionPaperDocument;

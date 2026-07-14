/**
 * Split pasted text into numbered question blocks (1. / 1) ).
 * Skips non-numbered section headers like "Difficult MCQs".
 */
export const splitNumberedBlocks = (rawText) => {
  const text = String(rawText || '').replace(/\r\n/g, '\n').trim();
  if (!text) return [];

  const starts = [];
  const pattern = /(?:^|\n)\s*(\d+)[.)]\s+/g;
  let match = pattern.exec(text);

  while (match) {
    starts.push({
      number: Number(match[1]),
      index: match.index + (match[0].startsWith('\n') ? 1 : 0),
      contentStart: match.index + match[0].length,
    });
    match = pattern.exec(text);
  }

  if (!starts.length) return [];

  return starts.map((start, i) => {
    const end = i + 1 < starts.length ? starts[i + 1].index : text.length;
    const body = text.slice(start.contentStart, end).trim();
    return {
      number: start.number,
      body,
    };
  });
};

const OPTION_SPLIT = /(?<![A-Za-z])([A-E])[.)]\s+/g;

/**
 * Parse one MCQ block:
 * "Force is defined as: A) Energy B) Power C) A push or a pull D) Work\n\nAnswer: C"
 */
export const parseMcqBlock = (body, number) => {
  // Prefer Answer: after options; do not require end-of-string so trailing
  // section headers (e.g. "Difficult MCQs") do not break parsing.
  const answerMatch = body.match(
    /\n\s*Answers?:\s*([A-Ea-e](?:\s*[,&/]\s*[A-Ea-e])*)\b/i
  );
  const answerPart = answerMatch?.[1] || '';
  const answerLetters = [
    ...new Set(
      (answerPart.toUpperCase().match(/[A-E]/g) || []).map((letter) => letter)
    ),
  ];

  const stemSource = (answerMatch ? body.slice(0, answerMatch.index) : body)
    .replace(/\n+\s*[A-Za-z][A-Za-z0-9 \-/]{2,40}\s*$/m, '')
    .trim();
  const optionMatch = stemSource.match(/(?:^|[\s:])([A-E])[.)]\s+/);

  if (!optionMatch) {
    return {
      ok: false,
      number,
      error: 'Could not find options (A) B) C) D))',
    };
  }

  const optionStart = optionMatch.index;
  let questionText = stemSource.slice(0, optionStart).trim();
  questionText = questionText.replace(/[:\-–—]\s*$/, '').trim();

  if (!questionText) {
    return { ok: false, number, error: 'Missing question text before options' };
  }

  // Drop a leading colon/space so OPTION_SPLIT sees "A) ..."
  const optionsPart = stemSource
    .slice(optionStart)
    .replace(/^[\s:]+/, '')
    .trim();
  const markers = [...optionsPart.matchAll(OPTION_SPLIT)];

  if (markers.length < 2) {
    return { ok: false, number, error: 'MCQ needs at least 2 options' };
  }

  const options = markers.map((marker, index) => {
    const letter = marker[1].toUpperCase();
    const textStart = marker.index + marker[0].length;
    const textEnd =
      index + 1 < markers.length ? markers[index + 1].index : optionsPart.length;
    const text = optionsPart.slice(textStart, textEnd).trim();

    return {
      letter,
      text,
      isCorrect: answerLetters.includes(letter),
      sortOrder: index,
    };
  });

  if (options.some((opt) => !opt.text)) {
    return { ok: false, number, error: 'One or more options are empty' };
  }

  if (!answerLetters.length) {
    return {
      ok: false,
      number,
      error: 'Missing Answer: line (e.g. Answer: C)',
      questionText,
      options,
    };
  }

  const unknown = answerLetters.filter(
    (letter) => !options.some((opt) => opt.letter === letter)
  );
  if (unknown.length) {
    return {
      ok: false,
      number,
      error: `Answer letter(s) ${unknown.join(', ')} not found in options`,
      questionText,
      options,
    };
  }

  return {
    ok: true,
    number,
    questionText,
    options: options.map(({ text, isCorrect, sortOrder }) => ({
      text,
      isCorrect,
      sortOrder,
    })),
    allowMultipleCorrect: answerLetters.length > 1,
    answerLetters,
  };
};

/**
 * Parse numbered short/long questions (no options).
 */
export const parseTextBlocks = (rawText) => {
  const blocks = splitNumberedBlocks(rawText);
  const questions = [];
  const errors = [];

  blocks.forEach((block) => {
    const text = block.body.replace(/\n+/g, ' ').trim();
    if (!text || text.length < 3) {
      errors.push({ number: block.number, error: 'Question text is empty' });
      return;
    }
    questions.push({
      number: block.number,
      text,
    });
  });

  return { questions, errors, totalBlocks: blocks.length };
};

/**
 * Parse numbered MCQ paste format with Answer: lines.
 */
export const parseMcqBlocks = (rawText) => {
  const blocks = splitNumberedBlocks(rawText);
  const questions = [];
  const errors = [];

  blocks.forEach((block) => {
    const parsed = parseMcqBlock(block.body, block.number);
    if (!parsed.ok) {
      errors.push({
        number: block.number,
        error: parsed.error,
        preview: block.body.slice(0, 80),
      });
      return;
    }

    questions.push({
      number: parsed.number,
      text: parsed.questionText,
      options: parsed.options,
      allowMultipleCorrect: parsed.allowMultipleCorrect,
    });
  });

  return { questions, errors, totalBlocks: blocks.length };
};

/**
 * Parse paste based on selected question type.
 */
export const parseBulkQuestions = (rawText, type) => {
  if (type === 'MCQ') {
    return parseMcqBlocks(rawText);
  }
  return parseTextBlocks(rawText);
};

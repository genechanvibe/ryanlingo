// Ordered list of lesson exercises. `total` drives the global progress bar.
export const QUESTIONS = [
  { id: 'q1', title: 'Fill in the blank' },
  { id: 'q2', title: 'Tap the matching pairs' },
  { id: 'q3', title: 'Choose the correct answer' },
  { id: 'q4', title: 'Complete the sentence' },
  { id: 'chat', title: 'Complete the chat' },
  { id: 'wish', title: 'Type your answer' },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

// `custom` = questions added from the admin dashboard
export const questionTitle = (id, custom = []) =>
  QUESTIONS.find((q) => q.id === id)?.title ?? custom.find((q) => q.id === id)?.prompt ?? id;

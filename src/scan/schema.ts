import { z } from 'zod';

export const Confidence = z.enum(['high', 'medium', 'low']);
export type Confidence = z.infer<typeof Confidence>;

export const Lang = z.enum(['en', 'hi', 'pa']);
export type Lang = z.infer<typeof Lang>;

/** Text in all three UI languages. Hindi/Punjabi need human review (docs/ROADMAP.md). */
export const Tri = z.object({ en: z.string(), hi: z.string().default(''), pa: z.string().default('') });
export type Tri = z.infer<typeof Tri>;

/** Normalised [x, y, w, h] in 0..1 of the image. */
export const Box = z.tuple([z.number(), z.number(), z.number(), z.number()]);
/** Location is optional help for highlighting; malformed boxes are dropped, never fatal. */
const OptBox = Box.nullable().optional().catch(null);

export const PrintedField = z.enum([
  'name', 'strength', 'ingredient', 'expiry', 'directions', 'warnings', 'batch', 'manufacturer', 'patient', 'prescriber', 'date', 'other',
]);
export type PrintedField = z.infer<typeof PrintedField>;

/** Exactly what is printed on the item. Never translated, never rewritten. */
export const PrintedDetail = z.object({
  field: PrintedField,
  value: z.string().min(1),
  confidence: Confidence,
  box: OptBox,
  /** Set on the device when the person corrects a value by hand. */
  corrected: z.boolean().optional(),
});
export type PrintedDetail = z.infer<typeof PrintedDetail>;

export const LabValue = z.object({
  test: z.string(),
  value: z.string(),
  unit: z.string().default(''),
  printedRange: z.string().default(''),
  confidence: Confidence,
  box: OptBox,
});
export type LabValue = z.infer<typeof LabValue>;

export const Explanation = z.object({ topic: z.string(), text: Tri });
export type Explanation = z.infer<typeof Explanation>;

export const ScanResult = z.object({
  kind: z.enum(['medicine', 'prescription', 'lab_report', 'other', 'unclear']),
  overallConfidence: Confidence,
  imageQuality: z.enum(['clear', 'blurry', 'partial', 'dark']).default('clear'),
  looseTablet: z.boolean().default(false),
  similarNameConflict: z.boolean().default(false),
  printed: z.array(PrintedDetail).default([]),
  labValues: z.array(LabValue).default([]),
  explanations: z.array(Explanation).default([]),
  unclear: z.array(Tri).default([]),
  doctorQuestions: z.array(Tri).default([]),
});
export type ScanResult = z.infer<typeof ScanResult>;

export const FollowUpAnswer = z.object({
  answer: Tri,
  outOfScope: z.boolean().default(false),
  confidence: Confidence.default('medium'),
});
export type FollowUpAnswer = z.infer<typeof FollowUpAnswer>;

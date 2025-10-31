// src/lib/quiz/distractors.ts
import { tokenizeEn, bigrams, jaccard, editDistance, normLenDiff, kanjiOverlap } from '@/helpers/text';

export function scoreMeaningDistractor(correctEn: string, candEn: string, sameTopic: boolean) {
  const tokC = tokenizeEn(correctEn);
  const tokD = tokenizeEn(candEn);
  const sTok  = jaccard(tokC, tokD);
  const sChar = jaccard(bigrams(correctEn), bigrams(candEn));
  const sHead = (tokC[0] && tokD[0] && tokC[0] === tokD[0]) ? 0.5 : 0;
  const lenPen = normLenDiff(correctEn.length, candEn.length);
  const topicB = sameTopic ? 0.4 : 0;
  return (2.2 * sTok + 1.2 * sChar + sHead + topicB) - 0.6 * lenPen;
}

export function scoreReadingDistractor(
  correctReading: string,
  candReading: string,
  jpCorrect?: string,
  jpCand?: string,
  sameTopic?: boolean
) {
  const dist = editDistance(correctReading, candReading);
  const maxL = Math.max((correctReading || '').length, (candReading || '').length, 1);
  const simR = 1 - (dist / maxL);
  const sKan = kanjiOverlap(jpCorrect, jpCand);
  const topicB = sameTopic ? 0.2 : 0;
  return 1.8 * simR + 0.8 * sKan + topicB;
}

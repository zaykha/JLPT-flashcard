export type JLPTLevelStr = 'N5'|'N4'|'N3'|'N2'|'N1';

export interface GrammarExample {
  jp: string;
  en: string;
  romaji?: string;
}

export interface GrammarPoint {
  id: string;
  level: JLPTLevelStr;
  title_jp: string;
  title_en: string;
  core_form: string;
  explanation: string;
  shortExplanation: string;
  longExplanation: string;
  formation: string;
  examples: GrammarExample[];
  lessonNos?: number[];
  tags?: string[];
  sourceRepo?: string;
  sourcePath?: string;
  license?: string;
  licenseNotice?: string;
  checksum?: string;
}
 

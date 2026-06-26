import type { PlayerIntent } from '@/domain/types/chat';

interface IntentPattern {
  intent: PlayerIntent;
  keywords: string[];
  weight?: number;
}

// Ordered by priority — first match wins when keywords overlap
const PATTERNS: IntentPattern[] = [
  {
    intent: 'emergency_help',
    keywords: ['被骗了', '损失', '帮帮我', '怎么办', '紧急处理', '中招了', '上当了'],
    weight: 10,
  },
  {
    intent: 'report',
    keywords: ['报警', '96110', '反诈', '举报', '警察', '诈骗电话', '诈骗'],
    weight: 9,
  },
  {
    intent: 'challenge_identity',
    keywords: ['你是谁', '怎么证明', '证明你', '你们是谁', '是不是官方', '身份证明', '核实你的身份'],
    weight: 8,
  },
  {
    intent: 'call_official',
    keywords: ['打电话', '招办电话', '致电', '拨号', '打过去', '电话号码', '联系电话', '拨打'],
    weight: 7,
  },
  {
    intent: 'search_official_site',
    keywords: ['官网', '研究生院', '学院官网', '官方网站', '正式网站', '学校网站', '去查一下', '官方公告'],
    weight: 7,
  },
  {
    intent: 'save_evidence',
    keywords: ['截图', '保存', '留证', '截一下', '证据', '拍下来', '留存'],
    weight: 6,
  },
  {
    intent: 'ask_verification',
    keywords: ['真的假的', '是不是官方', '靠谱吗', '可信吗', '是真的吗', '是假的吗', '靠不靠谱', '确认一下', '核实一下'],
    weight: 6,
  },
  {
    intent: 'ask_source',
    keywords: ['哪来的', '来源', '谁发的', '从哪', '哪里来', '怎么来的', '这是什么'],
    weight: 5,
  },
  {
    intent: 'request_link',
    keywords: ['链接', '入口', '发我', '发给我', '网址', '网站地址', '发一下', '给我发'],
    weight: 5,
  },
  {
    intent: 'open_link',
    keywords: ['打开', '进入', '进去看', '点一下', '试试'],
    weight: 4,
  },
  {
    intent: 'submit_info',
    keywords: ['填写', '提交', '身份证', '手机号', '验证码', '密码', '填了', '我填'],
    weight: 4,
  },
  {
    intent: 'share_suspicious_info',
    keywords: ['你看这个', '我收到', '有人说', '群里说', '转发给你', '这个是不是'],
    weight: 3,
  },
  {
    intent: 'ignore',
    keywords: ['不想', '算了', '以后再说', '先不管', '暂时', '等等', '不理'],
    weight: 2,
  },
];

export interface ParsedIntent {
  intent: PlayerIntent;
  confidence: 'high' | 'medium' | 'low';
  matchedKeywords: string[];
}

/**
 * Rule-based intent parser.
 * Interface designed for future replacement with LLMIntentParser:
 *   async parseIntent(text: string, context?: IntentContext): Promise<ParsedIntent>
 */
export class IntentParser {
  parseIntent(inputText: string): ParsedIntent {
    const text = inputText.toLowerCase().trim();
    if (!text) return { intent: 'small_talk', confidence: 'low', matchedKeywords: [] };

    const scored: { intent: PlayerIntent; score: number; matched: string[] }[] = [];

    for (const pattern of PATTERNS) {
      const matched = pattern.keywords.filter((kw) => text.includes(kw));
      if (matched.length > 0) {
        scored.push({
          intent: pattern.intent,
          score: matched.length * (pattern.weight ?? 1),
          matched,
        });
      }
    }

    if (scored.length === 0) {
      return { intent: 'small_talk', confidence: 'low', matchedKeywords: [] };
    }

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    return {
      intent: best.intent,
      confidence: best.score >= 10 ? 'high' : best.score >= 5 ? 'medium' : 'low',
      matchedKeywords: best.matched,
    };
  }
}

export const intentParser = new IntentParser();

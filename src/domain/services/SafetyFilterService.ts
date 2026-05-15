import type { EventCard } from '@/domain/types/game';
import type { SafetyFilterResult } from '@/domain/types/ai';

const SIMULATION_DISCLAIMER =
  '【教育模拟内容 - 请勿填写真实信息】';

const REAL_LINK_PATTERN = /https?:\/\/(?!game-simulated-link\.local)[^\s"'<>]+/gi;
const PAYMENT_ACCOUNT_PATTERN = /(?:收款账号|转账到|银行卡号)[：:\s]*[\d\-]{10,}/gi;

export class SafetyFilterService {
  filterEvent(event: EventCard): SafetyFilterResult {
    const warnings: string[] = [];
    const blockedReasons: string[] = [];

    const filtered: EventCard = structuredClone(event);

    filtered.message = this.removeRealLinks(filtered.message, warnings);
    filtered.message = this.replacePaymentDetails(filtered.message, warnings);
    filtered.message = this.ensureSimulationDisclaimer(filtered.message, filtered.channel);

    const instructionCheck = this.validateNoSensitiveInstruction(filtered);
    if (!instructionCheck.safe) {
      blockedReasons.push(...instructionCheck.reasons);
    }

    for (const action of filtered.actions) {
      if (action.description) {
        action.description = this.removeRealLinks(action.description, warnings);
      }
    }

    return {
      passed: blockedReasons.length === 0,
      filteredEvent: filtered,
      warnings,
      blockedReasons,
    };
  }

  removeRealLinks(text: string, warnings: string[] = []): string {
    const replaced = text.replace(REAL_LINK_PATTERN, (match) => {
      warnings.push(`已替换真实链接: ${match}`);
      return 'game-simulated-link.local/blocked';
    });
    return replaced;
  }

  replacePaymentDetails(text: string, warnings: string[] = []): string {
    return text.replace(PAYMENT_ACCOUNT_PATTERN, (match) => {
      warnings.push(`已替换支付信息: ${match}`);
      return '[模拟支付信息]';
    });
  }

  ensureSimulationDisclaimer(text: string, channel: string): string {
    if (channel === 'browser' && !text.includes(SIMULATION_DISCLAIMER)) {
      return `${SIMULATION_DISCLAIMER}\n\n${text}`;
    }
    return text;
  }

  validateNoSensitiveInstruction(event: EventCard): { safe: boolean; reasons: string[] } {
    const reasons: string[] = [];
    const dangerousPatterns = [
      /转账.*真实账号/,
      /真实身份证号.*发送/,
      /绕过.*风控/,
      /伪造.*证件/,
    ];
    const fullText = `${event.message} ${event.actions.map((a) => a.label).join(' ')}`;
    for (const pattern of dangerousPatterns) {
      if (pattern.test(fullText)) {
        reasons.push(`检测到不安全内容模式: ${pattern}`);
      }
    }
    return { safe: reasons.length === 0, reasons };
  }
}

export const safetyFilterService = new SafetyFilterService();

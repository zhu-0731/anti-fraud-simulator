import type {
  ISupportAgent,
  SupportAgentInput,
  SupportAgentOutput,
  SupportRole,
} from '@/domain/types/supportAgent';

const SAFE_ACTIONS = ['visit_official_site', 'call_official', 'save_evidence'];
const EMERGENCY_ACTIONS = ['stop_operation', 'change_password', 'contact_school', 'call_96110'];

export class SupportAgent implements ISupportAgent {
  async respond(input: SupportAgentInput): Promise<SupportAgentOutput> {
    switch (input.role) {
      case 'family':
        return response(input.role, '我有点担心，也不确定来源，你最好先问老师或看官网。', false, [
          'ask_source',
          'visit_official_site',
        ]);
      case 'peer':
        return response(input.role, '我听群里有人这么说，但我也没核实，还是以官网为准。', false, [
          'trace_source',
          'visit_official_site',
        ]);
      case 'group':
        return response(
          input.role,
          '群里信息比较杂，有人转发模拟链接，也有人建议等官方公告。',
          false,
          ['trace_source', 'save_evidence'],
        );
      case 'counselor':
        return response(
          input.role,
          '不要通过私信或非官方链接提交信息。请通过学校官网或官方电话核实。',
          true,
          SAFE_ACTIONS,
        );
      case 'official':
        return response(
          input.role,
          '本模拟录取确认以 game-simulated-link.local/official 官方页面为准，全程不收费。',
          true,
          SAFE_ACTIONS,
        );
      case 'anti_fraud':
        return response(
          input.role,
          '如果已经提交过模拟信息，请立即停止操作、保存证据，并按应急步骤处理。',
          true,
          EMERGENCY_ACTIONS,
        );
    }
  }
}

function response(
  role: SupportRole,
  responseText: string,
  isAuthoritative: boolean,
  recommendedActions: string[],
): SupportAgentOutput {
  return {
    role,
    responseText,
    isAuthoritative,
    recommendedActions,
    safetyFlags: validateSupportOutput(responseText, isAuthoritative),
  };
}

function validateSupportOutput(responseText: string, isAuthoritative: boolean): string[] {
  const flags: string[] = [];
  if (/https?:\/\//.test(responseText)) flags.push('real_url');
  if (isAuthoritative && /(付款|转账|私信.*密码|发送.*身份证)/.test(responseText)) {
    flags.push('authoritative_risky_instruction');
  }
  return flags;
}

export const supportAgent = new SupportAgent();

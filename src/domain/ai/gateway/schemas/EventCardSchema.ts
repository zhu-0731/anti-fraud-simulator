import { z } from 'zod';

export const PlayerActionSchema = z.object({
  id: z.string().min(1).max(80),
  label: z.string().min(1).max(80),
  category: z.enum(['risky', 'verify', 'evidence', 'ignore', 'safe', 'emergency']),
  description: z.string().max(200).optional(),
  riskScoreDelta: z.number().min(-30).max(40).optional(),
  anxietyScoreDelta: z.number().min(-25).max(25).optional(),
  setsFlag: z.string().max(80).optional(),
  requiresFlag: z.string().max(80).optional(),
  leaksInfo: z.boolean().optional(),
  loseMoney: z.number().min(0).max(1000).optional(),
  addEvidence: z.boolean().optional(),
  feedback: z.string().min(1).max(240).optional(),
  nextEventOverride: z.string().max(80).optional(),
  completesTask: z.boolean().optional(),
  triggersEmergency: z.boolean().optional(),
});

export const EventCardSchema = z
  .object({
    id: z.string().min(1).max(80),
    title: z.string().min(1).max(40),
    phase: z.enum(['playing']),
    channel: z.enum(['wechat', 'sms', 'email', 'browser', 'call', 'official_site', 'system']),
    senderName: z.string().min(1).max(40),
    senderRole: z.string().min(1).max(40),
    message: z.string().min(1).max(800),
    surfaceTrust: z.number().min(0).max(100),
    trueRiskLevel: z.enum(['none', 'low', 'medium', 'high', 'critical']),
    pressureTypes: z.array(z.string().min(1).max(80)).max(8),
    riskSignals: z.array(z.string().min(1).max(120)).min(1).max(12),
    safeActions: z.array(z.string().min(1).max(80)).max(12),
    actions: z.array(PlayerActionSchema).min(4).max(8),
    nextEventRules: z.array(
      z.object({
        condition: z.string().min(1).max(120),
        nextEventId: z.string().min(1).max(80),
      }),
    ),
    defaultNextEventId: z.string().max(80).optional(),
    teachingPoint: z.string().min(1).max(240),
    isTerminal: z.boolean().optional(),
    source: z.enum(['static', 'director', 'fallback']).optional(),
    tacticIds: z
      .array(
        z.enum([
          'authority_claim',
          'social_proof',
          'urgency_pressure',
          'loss_aversion',
          'verification_deflection',
          'channel_switch',
          'information_escalation',
          'consistency_repair',
        ]),
      )
      .optional(),
    testedCapabilities: z
      .array(
        z.enum([
          'independent_identity_verification',
          'source_tracing',
          'urgency_resistance',
          'risk_benefit_reassessment',
          'verify_before_action',
          'cross_channel_verification',
          'cross_turn_request_aggregation',
          'contradiction_checking',
          'evidence_preservation',
          'incident_response',
        ]),
      )
      .optional(),
    difficulty: z.enum(['beginner', 'standard', 'advanced']).optional(),
    schemaVersion: z.number().int().min(1).optional(),
  })
  .strict();

export type EventCardSchemaOutput = z.infer<typeof EventCardSchema>;

import { z } from 'zod';
import { ToolDefinition } from '../../agent/types';

export const sendNotificationTool: ToolDefinition = {
  name: 'send_notification',
  description: 'Sends an audit alert or notification message to internal communications channels (e.g. #finance-approvals) upon completion or exception.',
  riskLevel: 'LOW',
  parameters: {
    type: 'object',
    properties: {
      channel: {
        type: 'string',
        default: '#finance-approvals',
        description: 'Destination channel name (e.g. "#finance-approvals")'
      },
      message: {
        type: 'string',
        description: 'The alert message content with relevant transaction references'
      }
    },
    required: ['message']
  },
  execute: async (args: any, context) => {
    const schema = z.object({
      channel: z.string().optional().default('#finance-approvals'),
      message: z.string().min(1, 'message is required')
    });
    const parsed = schema.parse(args);
    const notif = context.environment.sendNotification(parsed.channel, parsed.message);
    return {
      sent: true,
      notificationId: notif.id,
      timestamp: notif.timestamp,
      channel: notif.channel
    };
  }
};

export const requestHumanApprovalTool: ToolDefinition = {
  name: 'request_human_approval',
  description: 'Explicitly requests authorization from the Finance Manager when company policy or unusual discrepancies require human approval before continuing.',
  riskLevel: 'LOW',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        description: 'The specific proposed action (e.g. "Release payment for invoice INV-2024-003")'
      },
      reason: {
        type: 'string',
        description: 'Detailed explanation of why human authorization is required based on company policy'
      },
      amount: {
        type: 'number',
        description: 'Financial value in USD associated with the action'
      }
    },
    required: ['action', 'reason']
  },
  execute: async (args: any, context) => {
    const schema = z.object({
      action: z.string().min(1, 'action is required'),
      reason: z.string().min(1, 'reason is required'),
      amount: z.number().optional()
    });
    const parsed = schema.parse(args);
    return {
      status: 'APPROVAL_REQUESTED',
      details: parsed,
      message: `Human approval request submitted to Finance Director. Reason: ${parsed.reason}`
    };
  }
};

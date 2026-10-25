import React, { useState } from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';
import { PendingApproval } from '../types';

interface ApprovalModalProps {
  approval: PendingApproval;
  onApprove: () => Promise<void>;
  onReject: (reason?: string) => Promise<void>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  approval,
  onApprove,
  onReject
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onReject("Disbursement rejected by Finance Manager.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'rgba(244, 63, 94, 0.08)',
      border: '2px solid rgba(244, 63, 94, 0.4)',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldAlert size={20} color="#f43f5e" />
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f43f5e' }}>
          Human-in-the-Loop Approval Required
        </h3>
        <span className="badge badge-deny" style={{ marginLeft: 'auto' }}>
          HIGH RISK
        </span>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.4' }}>
        <strong>Proposed Action:</strong> <code style={{ color: 'var(--accent-blue)' }}>{approval.tool}</code>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-primary)',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '12px',
        border: '1px solid var(--border-color)',
        color: 'var(--text-muted)'
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
          Policy Violation Check:
        </div>
        {approval.reason}
      </div>

      {approval.arguments?.amount && (
        <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>
          <strong>Settlement Value:</strong> ${approval.arguments.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button
          onClick={handleApprove}
          disabled={isSubmitting}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px 14px',
            backgroundColor: 'var(--accent-green)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          <Check size={14} />
          <span>Approve & Authorize Settlement</span>
        </button>

        <button
          onClick={handleReject}
          disabled={isSubmitting}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px 14px',
            backgroundColor: 'transparent',
            color: 'var(--accent-red)',
            border: '1px solid var(--accent-red)',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          <X size={14} />
          <span>Reject Action</span>
        </button>
      </div>
    </div>
  );
};

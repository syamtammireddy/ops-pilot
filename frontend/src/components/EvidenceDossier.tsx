import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileText, DollarSign, Calendar } from 'lucide-react';
import { EvidenceDossier as EvidenceDossierType } from '../types';

interface EvidenceDossierProps {
  evidence: EvidenceDossierType;
}

export const EvidenceDossier: React.FC<EvidenceDossierProps> = ({ evidence }) => {
  const isVerified = evidence.status === 'VERIFIED';

  return (
    <div style={{
      backgroundColor: isVerified ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
      border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color={isVerified ? 'var(--accent-green)' : 'var(--accent-red)'} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
            Independent Verification Dossier
          </h3>
        </div>
        <span className={`badge ${isVerified ? 'badge-success' : 'badge-failed'}`}>
          {evidence.status}
        </span>
      </div>

      {/* Summary Banner */}
      <div style={{
        fontSize: '12px',
        color: 'var(--text-main)',
        lineHeight: '1.4',
        backgroundColor: 'var(--bg-primary)',
        padding: '10px',
        borderRadius: '6px',
        border: '1px solid var(--border-color)'
      }}>
        {evidence.findingSummary}
      </div>

      {/* Metadata Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {evidence.invoiceId && (
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            fontSize: '11px'
          }}>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileText size={12} /> Invoice
            </div>
            <div style={{ fontWeight: 600, marginTop: '2px', color: 'var(--text-main)' }}>
              {evidence.invoiceId}
            </div>
          </div>
        )}

        {evidence.amount && (
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            fontSize: '11px'
          }}>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <DollarSign size={12} /> Amount
            </div>
            <div style={{ fontWeight: 600, marginTop: '2px', color: 'var(--accent-green)' }}>
              ${evidence.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        )}

        {evidence.completedAt && (
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            fontSize: '11px'
          }}>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> Audited
            </div>
            <div style={{ fontWeight: 600, marginTop: '2px', color: 'var(--text-main)' }}>
              {new Date(evidence.completedAt).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
          Ground-Truth Verification Checks ({evidence.verificationChecks.filter(c => c.passed).length}/{evidence.verificationChecks.length} Passed)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {evidence.verificationChecks.map((check, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '8px 10px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                fontSize: '11px'
              }}
            >
              {check.passed ? (
                <CheckCircle2 size={15} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '1px' }} />
              ) : (
                <XCircle size={15} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: '1px' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {check.name}
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                  {check.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

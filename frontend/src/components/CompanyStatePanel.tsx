import React, { useState } from 'react';
import { Database, FileText, MessageSquare, RefreshCw } from 'lucide-react';
import { SandboxState } from '../types';

interface CompanyStatePanelProps {
  state: SandboxState | null;
  onRefresh: () => void;
}

export const CompanyStatePanel: React.FC<CompanyStatePanelProps> = ({ state, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'erp' | 'vault' | 'comms'>('erp');

  if (!state) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '16px',
        color: 'var(--text-dim)',
        textAlign: 'center'
      }}>
        Loading Sandbox State...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '14px'
    }}>
      {/* Top Header & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('erp')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              backgroundColor: activeTab === 'erp' ? 'var(--bg-primary)' : 'transparent',
              color: activeTab === 'erp' ? 'var(--accent-blue)' : 'var(--text-muted)',
              border: `1px solid ${activeTab === 'erp' ? 'var(--border-color)' : 'transparent'}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Database size={13} />
            <span>ERP Ledger ({state.erpRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              backgroundColor: activeTab === 'vault' ? 'var(--bg-primary)' : 'transparent',
              color: activeTab === 'vault' ? 'var(--accent-blue)' : 'var(--text-muted)',
              border: `1px solid ${activeTab === 'vault' ? 'var(--border-color)' : 'transparent'}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <FileText size={13} />
            <span>Invoice Vault ({state.invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comms')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              backgroundColor: activeTab === 'comms' ? 'var(--bg-primary)' : 'transparent',
              color: activeTab === 'comms' ? 'var(--accent-blue)' : 'var(--text-muted)',
              border: `1px solid ${activeTab === 'comms' ? 'var(--border-color)' : 'transparent'}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={13} />
            <span>Slack Alerts ({state.notifications.length})</span>
          </button>
        </div>

        <button
          onClick={onRefresh}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '4px'
          }}
          title="Refresh company state"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Tab 1: ERP Ledger */}
      {activeTab === 'erp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Simulated NetSuite / Odoo Financial Ledger
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto' }}>
            {state.erpRecords.map((rec) => (
              <div
                key={rec.id}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '11px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {rec.invoiceNumber}
                  </span>
                  <span className={`badge ${rec.status === 'PAID' ? 'badge-success' : 'badge-blue'}`}>
                    {rec.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>{rec.vendor}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    ${rec.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {rec.transactionReference && (
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
                    Ref: {rec.transactionReference}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Document Vault */}
      {activeTab === 'vault' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Company Document & Invoices Repository
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto' }}>
            {state.invoices.map((inv) => (
              <div
                key={inv.id}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '11px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {inv.id}
                  </span>
                  <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : 'badge-approval'}`}>
                    {inv.status}
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  {inv.vendor} &bull; ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                  Date: {inv.date} &bull; Due: {inv.dueDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Slack Alerts */}
      {activeTab === 'comms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Internal Slack Channel: <strong>#finance-approvals</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto' }}>
            {state.notifications.map((msg) => (
              <div
                key={msg.id}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '11px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>
                    {msg.sender}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ color: 'var(--text-main)', lineHeight: '1.3' }}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

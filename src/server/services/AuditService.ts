/**
 * Production Audit Logging Service for Kisan Bhai
 * Secure traceability for administrative actions, data exports,
 * and high-value transactions.
 */

import { db } from '../db.js';

export interface AuditEntry {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  timestamp: string;
}

export class AuditService {
  private auditLogs: AuditEntry[] = [];

  public logAction(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
    const record: AuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };

    this.auditLogs.unshift(record);
    // Keep last 1000 records in memory
    if (this.auditLogs.length > 1000) {
      this.auditLogs.pop();
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUDIT LOG] ${record.actorRole} ${record.actorId} -> ${record.action} on ${record.resourceType} (${record.status})`);
    }

    return record;
  }

  public getLogs(limit = 50): AuditEntry[] {
    return this.auditLogs.slice(0, limit);
  }
}

export const auditService = new AuditService();

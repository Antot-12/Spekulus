
'use server';

import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/lib/db/schema';
import { headers } from 'next/headers';
import type { auditLogs } from '@/lib/db/schema';
import type { InferInsertModel } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export type LogPayload = Omit<InferInsertModel<typeof auditLogs>, 'id' | 'timestamp' | 'ip' | 'actor'> & { actor?: string };

export async function logAction(payload: LogPayload) {
  const ip = headers().get('x-forwarded-for') ?? headers().get('x-real-ip');
  const user = payload.actor || 'System'; // Default to system if actor not provided

  try {
    await db.insert(schema.auditLogs).values({
        ...payload,
        actor: user,
        ip: ip || 'unknown',
    });
  } catch (error) {
    console.error("Failed to write to audit log:", error);
    // In a production environment, you might want to send this error to a monitoring service.
  }
}

// You might want a function to wrap database operations with logging
export async function withAuditLogs<T>(
  actionName: string,
  target: string,
  changeType: 'CONTENT' | 'SETTINGS' | 'UI_VISIBILITY',
  operation: () => Promise<T>,
  getBeforeState?: () => Promise<any>,
  getAfterState?: (result: T) => Promise<any>
) {
  let beforeState = null;
  if (getBeforeState) {
    beforeState = await getBeforeState();
  }

  try {
    const result = await operation();
    
    let afterState = null;
    if (getAfterState) {
      afterState = await getAfterState(result);
    }

    await logAction({
      action: actionName,
      target,
      changeType,
      before: beforeState,
      after: afterState,
      status: 'SUCCESS',
      source: 'WEB_ADMIN',
    });
    return result;
  } catch (err: any) {
    await logAction({
      action: actionName,
      target,
      changeType,
      before: beforeState,
      status: 'FAILURE',
      error: err.message,
      source: 'WEB_ADMIN',
    });
    throw err; // Re-throw the error after logging
  }
}

import { prisma } from "./prisma";

export interface LogAuditParams {
  userId?: string;
  action: string;
  ipAddress?: string;
  details?: Record<string, any>;
}

/**
 * Grava um log de auditoria de forma assíncrona no banco de dados.
 */
export async function logAudit({ userId, action, ipAddress, details }: LogAuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress,
        details: details || {},
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}

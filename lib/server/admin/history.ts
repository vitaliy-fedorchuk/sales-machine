import "server-only";
import { db } from "../db";
import type { CaseAction } from "../../generated/prisma/client";

/** Правки однієї людини в межах цього вікна — один запис «редактировал» */
const MERGE_EDITS_MS = 30 * 60 * 1000;

export interface HistoryEntry {
  id: string;
  action: CaseAction;
  at: string;
  userName: string | null;
}

/** Записати дію в журнал кейсу */
export const logCaseEvent = async (caseId: string, userId: string, action: CaseAction) => {
  if (action === "EDITED") {
    const last = await db.caseEvent.findFirst({ where: { caseId }, orderBy: { at: "desc" } });
    if (last && last.action === "EDITED" && last.userId === userId && Date.now() - last.at.getTime() < MERGE_EDITS_MS) {
      await db.caseEvent.update({ where: { id: last.id }, data: { at: new Date() } });
      return;
    }
  }
  await db.caseEvent.create({ data: { caseId, userId, action } });
};

export const getCaseHistory = async (caseId: string, take = 20): Promise<HistoryEntry[]> => {
  const rows = await db.caseEvent.findMany({
    where: { caseId },
    orderBy: { at: "desc" },
    take,
    include: { user: { select: { name: true } } },
  });
  return rows.map((r) => ({ id: r.id, action: r.action, at: r.at.toISOString(), userName: r.user?.name ?? null }));
};

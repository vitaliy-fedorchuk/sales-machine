"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "../auth/session";
import { db } from "../db";

const status = z.enum(["NEW", "IN_WORK", "DONE", "SPAM"]);

export async function setLeadStatus(id: string, value: string) {
  await requireUser();
  await db.lead.update({ where: { id }, data: { status: status.parse(value) } });
  revalidatePath("/admin/leads");
}

export async function setLeadNote(id: string, note: string) {
  await requireUser();
  await db.lead.update({ where: { id }, data: { note: z.string().max(2000).parse(note) } });
}

export async function deleteLead(id: string) {
  await requireUser();
  await db.lead.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/leads");
}

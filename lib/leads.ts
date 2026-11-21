// Підписи статусів заявки — спільні для серверної сторінки й клієнтської картки
export const STATUS_LABEL = { NEW: "Новая", IN_WORK: "В работе", DONE: "Закрыта", SPAM: "Спам" } as const;
export type LeadStatusKey = keyof typeof STATUS_LABEL;

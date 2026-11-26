/** <meta> з коду для <head> (підтвердження прав у Вебмастері / Search Console) — їх треба віддати сервером. */
export function headMetas(html: string) {
  const out: Record<string, string>[] = [];
  for (const m of html.matchAll(/<meta\b([^>]*)>/gi)) {
    const attrs: Record<string, string> = {};
    for (const a of m[1].matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
      const k = a[1].toLowerCase();
      if (k === "name" || k === "content" || k === "property") attrs[k] = a[3] ?? a[4];
    }
    if ((attrs.name || attrs.property) && attrs.content) out.push(attrs);
  }
  return out;
}

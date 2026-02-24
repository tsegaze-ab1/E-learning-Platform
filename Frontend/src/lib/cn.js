export function cn(...parts) {
  return parts
    .flatMap((p) => {
      if (!p) return [];
      if (Array.isArray(p)) return p;
      return [p];
    })
    .filter(Boolean)
    .join(' ');
}

export function formatDateShort(iso?: string | null) {
  if (!iso) return '';

  // Las fechas sin hora se interpretan directamente para evitar que la zona
  // horaria las desplace al día anterior.
  const dateOnly = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return `${day}-${month}-${year}`;
  }

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear());

  return `${day}-${month}-${year}`;
}

export function formatDateTimeShort(iso?: string | null) {
  if (!iso) return '';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${formatDateShort(iso)} ${hours}:${minutes}`;
}

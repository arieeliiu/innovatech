export function getTaskStatusLabel(status?: string) {
  switch (status) {
    case 'TODO':
      return 'Por hacer';
    case 'IN_PROGRESS':
      return 'En progreso';
    case 'DONE':
      return 'Finalizada';
    default:
      return status || 'Sin estado';
  }
}

export function formatTaskStatusText(value?: string) {
  if (!value) return '';

  return value
    .replaceAll('IN_PROGRESS', 'En progreso')
    .replaceAll('TODO', 'Por hacer')
    .replaceAll('DONE', 'Finalizada');
}

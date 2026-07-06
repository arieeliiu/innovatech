const FLASH_NOTICE_KEY = 'innovatech:flash-notice';

export function setFlashNotice(message: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(FLASH_NOTICE_KEY, message);
}

export function takeFlashNotice() {
  if (typeof window === 'undefined') return '';
  const message = window.sessionStorage.getItem(FLASH_NOTICE_KEY) ?? '';
  window.sessionStorage.removeItem(FLASH_NOTICE_KEY);
  return message;
}

export function isUserActive(user: {
  app_metadata?: Record<string, unknown>;
}) {
  return (
    user.app_metadata?.is_active !== false &&
    !user.app_metadata?.deleted_at
  );
}

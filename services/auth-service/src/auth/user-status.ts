import type { User } from "@supabase/supabase-js";

export function isUserActive(user: Pick<User, "app_metadata">) {
  return (
    user.app_metadata?.is_active !== false &&
    !user.app_metadata?.deleted_at
  );
}

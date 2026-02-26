#!/usr/bin/env bash
set -euo pipefail

# Auto-resolve frequent App Router conflicts by restoring thin route wrappers
# and keeping large implementations in components/pages/*.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

write_wrapper() {
  local target="$1"
  local component="$2"
  cat > "$ROOT_DIR/$target" <<EOT
import ${component} from '@/components/pages/${component}';

export default function Page() {
  return <${component} />;
}
EOT
}

write_wrapper "packages/web/app/builder/page.tsx" "BuilderPage"
write_wrapper "packages/web/app/templates/page.tsx" "TemplatesPage"
write_wrapper "packages/web/app/dashboard/page.tsx" "DashboardPage"
write_wrapper "packages/web/app/api-test/page.tsx" "ApiTestPage"

# Verify no merge markers remain in these route wrappers
if rg -n "^<<<<<<<|^=======|^>>>>>>>" \
  "$ROOT_DIR/packages/web/app/builder/page.tsx" \
  "$ROOT_DIR/packages/web/app/templates/page.tsx" \
  "$ROOT_DIR/packages/web/app/dashboard/page.tsx" \
  "$ROOT_DIR/packages/web/app/api-test/page.tsx" >/dev/null; then
  echo "Conflict markers still detected in route wrappers." >&2
  exit 1
fi

echo "Route wrappers refreshed and conflict markers cleared."

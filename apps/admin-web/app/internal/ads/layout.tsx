// Layout placeholder — ADR-011 dormant.
// M18 트리거 도달 시 active=true 토글 후 본 layout에 sidebar/탭 추가.

import type { ReactNode } from "react";

export default function AdsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

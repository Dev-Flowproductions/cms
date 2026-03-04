"use client";

import { Link } from "@/lib/navigation";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link>;

export function IntlLink(props: Props) {
  return <Link {...props} />;
}

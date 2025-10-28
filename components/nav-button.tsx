"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import type { LucideIcon } from "lucide-react";
import { memo } from "react";

interface NavButtonProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  color: string;
  textColor: string;
  testId?: string;
}

export const NavButton = memo(function NavButton({ icon: Icon, label, href, color, textColor, testId }: NavButtonProps) {
  const content = (
    <Button
      variant="ghost"
      size="sm"
      className="flex flex-col items-center gap-0.5 h-auto py-2 px-2 min-w-0 flex-shrink"
      data-testid={testId}
    >
      <Icon className="h-5 w-5 flex-shrink-0" style={{ color }} />
      <span className="text-[10px] font-medium whitespace-nowrap" style={{ color: textColor }}>{label}</span>
    </Button>
  );

  return href ? <Link href={href}>{content}</Link> : content;
});

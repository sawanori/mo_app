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
      className="flex flex-col items-center gap-1.5 h-auto py-3 px-4"
      data-testid={testId}
    >
      <Icon className="h-7 w-7" style={{ color }} />
      <span className="text-sm font-medium" style={{ color: textColor }}>{label}</span>
    </Button>
  );

  return href ? <Link href={href}>{content}</Link> : content;
});

"use client";

interface HeroDotsProps {
  count: number;
  current: number;
  onSelect: (index: number) => void;
}

export function HeroDots({ count, current, onSelect }: HeroDotsProps) {
  return (
    <div className="flex justify-center gap-2 mt-3">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          className={`h-2 w-2 rounded-full transition-all ${
            index === current ? "bg-orange-500" : "bg-muted-foreground/30"
          }`}
          onClick={() => onSelect(index)}
          aria-label={`Go to slide ${index + 1}`}
          data-testid={`hero-dot-${index}`}
        />
      ))}
    </div>
  );
}


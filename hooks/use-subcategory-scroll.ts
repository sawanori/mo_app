"use client";

export function useSubcategoryScroll(
  subCategoryRefs: React.MutableRefObject<{ [key: string]: HTMLButtonElement | null }>,
  subCategoryContainerRef: React.RefObject<HTMLDivElement>,
  subCategoryTitleRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>
) {
  const scrollToSubCategory = (subCategoryName: string) => {
    setTimeout(() => {
      const titleElement = subCategoryTitleRefs.current[subCategoryName];
      if (titleElement) {
        titleElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      }

      const button = subCategoryRefs.current[subCategoryName];
      const sidebarContainer = subCategoryContainerRef.current;
      if (button && sidebarContainer) {
        const buttonTop = button.offsetTop;
        const buttonHeight = button.offsetHeight;
        const containerHeight = sidebarContainer.offsetHeight;
        const scrollTop = buttonTop - containerHeight / 2 + buttonHeight / 2;
        sidebarContainer.scrollTo({ top: scrollTop, behavior: "smooth" });
      }
    }, 100);
  };

  return { scrollToSubCategory } as const;
}


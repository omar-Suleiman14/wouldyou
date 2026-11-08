"use client";

import { Experience } from "@/components/experience/Experience";
import { TEMPLATES, templateExperience } from "@/lib/templates";

const demo = { ...templateExperience(TEMPLATES[0]), recipientName: "Sam", senderName: "Alex" };

export function LiveDemo() {
  return (
    <div className="h-[540px] overflow-hidden rounded-[18px] border border-line-strong shadow-[0_4px_8px_-6px_#0002,0_24px_64px_-36px_#0005] sm:h-[600px]">
      <Experience data={demo} mode="preview" embedded />
    </div>
  );
}

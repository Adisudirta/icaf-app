"use client";

import Image from "next/image";

const PlusIcon =
  "https://www.figma.com/api/mcp/asset/1837a696-b458-43c8-a6fe-d1767dfa39fc";

interface Step {
  number: string;
  label: string;
}

interface StepperComponentProps {
  steps: Step[];
  activeIndex?: number;
  showAddButton?: boolean;
}

export default function StepperComponent({
  steps,
  activeIndex = 0,
  showAddButton = true,
}: StepperComponentProps) {
  return (
    <div className="flex gap-4 bg-white p-2 rounded-2xl">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3">
          {/* Step */}
          <div className="flex gap-3 px-4 py-2 rounded-xl">
            <div
              className={`size-6 rounded-full flex items-center justify-center text-[12px] font-semibold ${
                index === activeIndex
                  ? "bg-[#3b82f6] text-white"
                  : "bg-[#dce4e8] text-[#596064]"
              }`}
            >
              {step.number}
            </div>
            <span
              className={`text-[12px] font-semibold whitespace-nowrap ${
                index === activeIndex ? "text-[#3b82f6]" : "text-[#596064]"
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Divider */}
          {index < steps.length - 1 && (
            <div className="h-px w-8 bg-[rgba(172,179,183,0.3)]" />
          )}
        </div>
      ))}

      {/* Add New Case Button */}
      {showAddButton && (
        <>
          {steps.length > 0 && (
            <div className="h-px w-8 bg-[rgba(172,179,183,0.3)]" />
          )}
          <button className="flex gap-3 items-center bg-[#3b82f6] text-white px-5 py-3 rounded-xl cursor-pointer hover:bg-blue-600">
            {/* <Image src={PlusIcon} alt="Add" width={24} height={24} /> */}
            <span className="text-[16px] font-['Poppins']">Add New Case</span>
          </button>
        </>
      )}
    </div>
  );
}

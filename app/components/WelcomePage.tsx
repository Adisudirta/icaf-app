"use client";

import AsideSideNavBar from "./AsideSideNavBar";
import StepperComponent from "./StepperComponent";

const steps = [
  { number: "1", label: "Create Case" },
  { number: "2", label: "Legal Analysis" },
  { number: "3", label: "Review Docs" },
];

export default function WelcomePage() {
  return (
    <div className="flex bg-[#f7f9fc] min-h-screen">
      {/* Sidebar */}
      <AsideSideNavBar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
        {/* ICAF Label */}
        <span className="text-[14px] text-black font-['Crimson_Text'] not-italic">ICAF</span>

        {/* Heading */}
        <div className="flex flex-col items-center">
          <h1 className="text-[36px] font-semibold text-[#191c1e] text-center tracking-[-0.9px] font-['Manrope']">
            Create New Case
          </h1>
        </div>

        {/* Stepper */}
        <StepperComponent steps={steps} activeIndex={0} showAddButton={true} />
      </main>
    </div>
  );
}

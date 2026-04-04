"use client";

import Image from "next/image";

const Logo = "";
const PlusIcon = "";
const SearchIcon = "";

const recentCases = [
  "BP/45/IV/2026/Reskrim",
  "BP/44/IV/2026/Reskrim",
  "BP/43/IV/2026/Reskrim",
  "BP/42/IV/2026/Reskrim",
];

interface AsideSideNavBarComponentProps {
  className?: string;
}

export default function AsideSideNavBarComponent({
  className,
}: AsideSideNavBarComponentProps) {
  return (
    <aside
      className={`flex flex-col gap-6 h-256 p-6 bg-white shadow-[4px_0px_24px_0px_rgba(0,0,0,0.02)] w-[256px] ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between w-52">
        <div className="bg-[#0058be] flex items-center justify-center rounded-xs size-6">
          {/* <Image src={Logo} alt="ICAF Logo" width={15} height={14.25} /> */}
        </div>
        <button className="size-6 cursor-pointer overflow-hidden">
          {/* <Image
            src={Logo}
            alt="Menu"
            width={12}
            height={12}
            className="ml-1.5 mt-1.5"
          /> */}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-1 w-full">
        <button className="flex gap-1 items-center py-1 px-0 w-full rounded-[80px] cursor-pointer hover:bg-gray-50">
          <Image src={PlusIcon} alt="Plus" width={24} height={24} />
          <span className="text-[14px] text-[#333] font-['Manrope']">
            Create New Case
          </span>
        </button>
        <button className="flex gap-1 items-center py-1 px-0 w-full rounded-[80px] cursor-pointer hover:bg-gray-50">
          <Image
            src={SearchIcon}
            alt="Search"
            width={16}
            height={16}
            className="ml-1"
          />
          <span className="text-[14px] text-[#333] font-['Manrope']">
            Search Case
          </span>
        </button>
      </div>

      {/* Recent Cases */}
      <div className="flex flex-col gap-4 flex-1 min-h-0">
        <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[2px] font-['Manrope']">
          Recent Cases
        </div>
        <div className="flex flex-col gap-2 w-full overflow-y-auto">
          {recentCases.map((caseNumber, index) => (
            <div
              key={index}
              className="flex flex-col pl-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer"
            >
              <span className="text-[14px] font-medium text-[#475569] font-['Manrope']">
                {caseNumber}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex gap-3">
        <div className="bg-[#0058be] flex items-center justify-center rounded-xs size-6 cursor-pointer">
          {/* <Image src={Logo} alt="ICAF" width={15} height={14.25} /> */}
        </div>
      </div>
    </aside>
  );
}

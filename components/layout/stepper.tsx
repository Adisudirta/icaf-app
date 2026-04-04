import { Plus } from "lucide-react";
import { Button } from "../ui/button";

type StepStatus = "active" | "completed" | "inactive";
type StepItem = {
  id: number;
  label: string;
};

const steps: StepItem[] = [
  { id: 1, label: "Create Case" },
  { id: 2, label: "Legal Analysis" },
  { id: 3, label: "Review Docs" },
];

function StepItem({ step, status }: { step: StepItem; status: StepStatus }) {
  const isActive = status === "active";
  const isCompleted = status === "completed";

  return (
    <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2">
      {/* Bubble / pill */}
      <div
        className={`
          flex items-center justify-center font-semibold transition-all duration-300 shrink-0
          ${
            isActive
              ? "bg-blue-500 text-white rounded-full px-3 py-1.5 sm:px-4 sm:py-2 gap-1.5 sm:gap-2 shadow-md text-xs sm:text-sm"
              : isCompleted
                ? "bg-blue-500 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm"
                : "bg-gray-100 text-gray-400 rounded-full w-7 h-7 sm:w-8 sm:h-8 border border-gray-200 text-xs sm:text-sm"
          }
        `}
      >
        {isActive ? (
          <>
            <span className="font-bold">{step.id}</span>
            <span className="font-semibold whitespace-nowrap">
              {step.label}
            </span>
          </>
        ) : isCompleted ? (
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <span>{step.id}</span>
        )}
      </div>

      {/* Label — below bubble on mobile, beside it on sm+ */}
      {!isActive && (
        <span
          className={`
            text-[10px] sm:text-sm font-medium text-center sm:text-left transition-colors duration-300 whitespace-nowrap
            ${isCompleted ? "text-blue-500" : "text-gray-400"}
          `}
        >
          {step.label}
        </span>
      )}
    </div>
  );
}

function Connector({ filled }: { filled: boolean }) {
  return (
    <>
      {/* Horizontal — sm+ */}
      <div className="hidden sm:block flex-1 mx-2 h-px min-w-4">
        <div
          className={`w-full h-full transition-colors duration-500 ${filled ? "bg-blue-400" : "bg-gray-200"}`}
        />
      </div>
      {/* Vertical — mobile */}
      <div className="block sm:hidden w-px h-5 my-0.5 self-center">
        <div
          className={`w-full h-full transition-colors duration-500 ${filled ? "bg-blue-400" : "bg-gray-200"}`}
        />
      </div>
    </>
  );
}

export default function Stepper({
  currentStep = 1,
  isOnboarding = false,
}: {
  currentStep?: number;
  isOnboarding?: boolean;
}) {
  const getStatus = (stepId: number): StepStatus => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "active";
    return "inactive";
  };

  return (
    <div className="bg-white rounded-2xl gap-16 items-center flex flex-col md:flex-row shadow-sm border border-gray-100 w-full md:w-fit px-4 py-5 sm:px-8">
      <div className="flex flex-col sm:flex-row items-center">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className="flex flex-col sm:flex-row items-center sm:flex-1 last:sm:flex-none w-full sm:w-auto"
          >
            <StepItem step={step} status={getStatus(step.id)} />
            {idx < steps.length - 1 && (
              <Connector filled={step.id < currentStep} />
            )}
          </div>
        ))}
      </div>

      {isOnboarding && (
        <Button className="p-5 rounded-xl">
          <Plus />
          <span className="font-bold">Add New Case</span>
        </Button>
      )}
    </div>
  );
}

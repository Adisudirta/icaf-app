import Stepper from "@/components/layout/stepper";

const HomePage = () => {
  return (
    <div className="flex flex-col gap-y-8 justify-center items-center h-full">
      <h3 className="font-crimson-text text-black text-sm md:text-lg">
        Integrated Criminal Assessment Framework
      </h3>

      <h2 className="text-lg md:text-[36px] font-semibold text-[#191C1E]">
        Create New Case
      </h2>

      <Stepper isOnboarding />
    </div>
  );
};

export default HomePage;

import Stepper from "@/components/layout/stepper";
import LegalCaseForm from "@/components/analysis/legal-case-form";

const CreatePage = () => {
  return (
    <>
      <h2 className="text-[36px] font-semibold text-[#191C1E] mb-6">
        Create New Case
      </h2>

      <Stepper />

      <LegalCaseForm />
    </>
  );
};

export default CreatePage;

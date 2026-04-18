import { Card, CardContent } from "@/components/ui/card";
import Stepper from "@/components/layout/stepper";

const ReviewPage = () => {
  return (
    <>
      <h2 className="text-[36px] font-semibold text-[#191C1E] mb-6">
        Review Document
      </h2>

      <Stepper currentStep={3} />

      <Card className="h-250 mt-6">
        <CardContent className="h-full">
          <div className="border-card-foreground/10 h-full rounded-md border bg-[repeating-linear-gradient(45deg,color-mix(in_oklab,var(--card-foreground)10%,transparent),color-mix(in_oklab,var(--card-foreground)10%,transparent)_1px,var(--card)_2px,var(--card)_15px)]" />
        </CardContent>
      </Card>
    </>
  );
};

export default ReviewPage;

import BaseLayout from "@/components/layout/base-layout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BaseLayout>{children}</BaseLayout>;
}

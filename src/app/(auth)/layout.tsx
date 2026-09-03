export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="field-theme min-h-[100dvh]">
      {children}
    </div>
  );
}

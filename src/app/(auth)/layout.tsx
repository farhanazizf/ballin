export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-telemetry field-theme relative min-h-[100dvh]">
      <div aria-hidden className="telemetry-scanlines" />
      <div aria-hidden className="telemetry-noise" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold mb-3">{title}</h2>
      {subtitle && (
        <p className="text-gray-900 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}

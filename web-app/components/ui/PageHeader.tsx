export default function PageHeader({ title, lastUpdated }: { title: string, lastUpdated: string | null }) {
  return (
    <header className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
      {lastUpdated && (
        <p className="text-sm text-gray-500">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </p>
      )}
    </header>
  );
}

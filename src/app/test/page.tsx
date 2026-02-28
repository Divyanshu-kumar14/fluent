import { prisma } from "@/lib/db";

export default async function TestPage() {
  const voices = await prisma.voice.findMany();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test</h1>
      <ul>
        {voices.map((voice) => (
          <li key={voice.id}>
            {voice.name} - {voice.variant}
          </li>
        ))}
      </ul>
    </div>
  );
}
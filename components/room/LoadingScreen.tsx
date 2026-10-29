import Marker from "@/components/ui/Marker";

// Full-page wait while entering or leaving a lesson: a heading and the marker's wavy line,
// the only marker stroke that loops (docs/DESIGN.md).
export default function LoadingScreen({ title }: { title: string }) {
  return (
    <main
      role="status"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-paper p-4 text-center"
    >
      <h1 className="text-3xl">{title}</h1>
      <Marker shape="wave" width={7} play="loop" className="h-6 w-40" />
    </main>
  );
}

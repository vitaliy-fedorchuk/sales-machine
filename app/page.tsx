import Spiral from "@/components/spiral/Spiral";
import { DIRECTIONS } from "@/lib/directions";

export default function Home() {
  return (
    <main>
      <h1 className="sr-only">Sales Machine — иммерсивный маркетинг</h1>
      <Spiral items={DIRECTIONS} />
    </main>
  );
}

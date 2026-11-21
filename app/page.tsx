import Spiral from "@/components/spiral/Spiral";
import { getContent } from "@/lib/content";

export default async function Home() {
  const { items } = await getContent("home");
  return (
    <main>
      <h1 className="sr-only">Sales Machine — иммерсивный маркетинг</h1>
      <Spiral items={items} />
    </main>
  );
}

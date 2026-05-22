import { TranslationWorkbench } from "@/components/TranslationWorkbench";
import { samplePatients } from "@/lib/patients";

export default function Home() {
  return <TranslationWorkbench patients={samplePatients} />;
}

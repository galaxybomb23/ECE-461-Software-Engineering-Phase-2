import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";

export default function Home() {
  const count = useSignal(3);
  return (
    <div>
      <div>
        <img
          src="/Acme-corp.jpg"
          width="256"
          height="256"
          alt="ACME Corporation Logo, red letters that spell ACME, and black letters below that spell Corporation"
        />
        <h1>ACME Corporation's Module Registry</h1>
      </div>
    </div>
  );
}

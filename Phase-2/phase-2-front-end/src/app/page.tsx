"use client";

import { useEffect, useState } from "react";
import { Dino } from "./types";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const [dinosaurs, setDinosaurs] = useState<Dino[]>([]);

  useEffect(() => {
    (async () => {
      const response = await fetch(`/api/dinosaurs`);
      const allDinosaurs = await response.json() as Dino[];
      setDinosaurs(allDinosaurs);
    })();
  }, []);

  return (
    <main className={styles.main}>
      <h1>Welcome to the Dinosaur app</h1>
      <p>Click on a dinosaur below to learn more.</p>
      {dinosaurs.map((dinosaur: Dino) => {
        return (
          <Link key="dinosaur.name" href={`/${dinosaur.name.toLowerCase()}`}>
            {dinosaur.name}
          </Link>
        );
      })}
    </main>
  );  
}
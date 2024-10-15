"use client";

import { useEffect, useState } from "react";
import { Dino } from "../types";
import Link from "next/link";
import styles from "../page.module.css";

type RouteParams = { params: { dinosaur: string } };

export default function Dinosaur(request: RouteParams) {
    const selectedDinosaur = request.params.dinosaur;
    const [dinosaur, setDino] = useState<Dino>({ name: "", description: "" });

    useEffect(() => {
    (async () => {
        const resp = await fetch(`/api/dinosaurs/${selectedDinosaur}`);
        const dino = await resp.json() as Dino;
        setDino(dino);
    })();
    }, []);

    return (
        <main className={styles.main}>
          <h1>{dinosaur.name}</h1>
          <p>{dinosaur.description}</p>
          <Link href="/">Back to all dinosaurs</Link>
        </main>
      );      
}

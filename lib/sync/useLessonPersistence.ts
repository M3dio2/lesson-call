"use client";

import { useEffect } from "react";
import * as Y from "yjs";
import { createClient } from "@/lib/supabase/client";
import { toBase64 } from "./base64";

const SAVE_INTERVAL_MS = 30_000;

// Teacher only: saves the lesson Y.Doc to Supabase every 30 s (if it changed), when the tab
// is hidden, and when leaving the lesson. RLS makes sure only the lesson's teacher can write.
// The snapshot is loaded again by app/lesson/[id]/page.tsx.
export function useLessonPersistence(doc: Y.Doc, lessonId: string | undefined) {
  useEffect(() => {
    if (!lessonId) return;
    const supabase = createClient();
    let dirty = false;

    const markDirty = () => {
      dirty = true;
    };
    const save = () => {
      if (!dirty) return;
      dirty = false;
      const snapshot = toBase64(Y.encodeStateAsUpdate(doc));
      supabase
        .from("lessons")
        .update({ doc_snapshot: snapshot, last_active_at: new Date().toISOString() })
        .eq("id", lessonId)
        .then(({ error }) => {
          if (error) {
            dirty = true;
            console.error("Saving the lesson failed:", error.message);
          }
        });
    };
    const saveWhenHidden = () => {
      if (document.visibilityState === "hidden") save();
    };

    doc.on("update", markDirty);
    const interval = setInterval(save, SAVE_INTERVAL_MS);
    document.addEventListener("visibilitychange", saveWhenHidden);

    return () => {
      doc.off("update", markDirty);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", saveWhenHidden);
      save(); // leaving the lesson (navigating back to the dashboard)
    };
  }, [doc, lessonId]);
}

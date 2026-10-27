"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Short, unguessable invite code for the student link.
function newSlug() {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

// A regular student: fixed invite link, board kept until their next lesson.
export async function addStudent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  if (!title) return;

  const supabase = await createClient();
  const { error } = await supabase.from("lessons").insert({ title, invite_slug: newSlug() });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

// One-off call: created and opened straight away; ended from the dashboard (or after 12 h).
export async function startQuickCall() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .insert({ title: "Quick call", kind: "quick", invite_slug: newSlug() })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  redirect(`/lesson/${data.id}`);
}

// Removes a student or ends a quick call. RLS limits this to the teacher's own rows.
export async function removeLesson(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("lessons").delete().eq("id", String(formData.get("id")));
  revalidatePath("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

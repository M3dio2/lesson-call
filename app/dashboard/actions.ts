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

export async function createLesson(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  if (!title) return;

  const supabase = await createClient();
  const { error } = await supabase.from("lessons").insert({ title, invite_slug: newSlug() });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function deleteLesson(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("lessons").delete().eq("id", String(formData.get("id")));
  revalidatePath("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

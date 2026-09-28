"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function createFaqAction(formData: FormData): Promise<void> {
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!question || !answer) {
    redirect("/admin/faq/new?error=required");
  }

  const { error } = await getSupabaseServerClient()
    .from("faq")
    .insert({ question, answer, category: category || null });

  if (error) {
    console.error("Failed to create FAQ", error);
    redirect("/admin/faq/new?error=save");
  }

  revalidatePath("/admin/faq");
  redirect("/admin/faq");
}

export async function updateFaqAction(id: string, formData: FormData): Promise<void> {
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!question || !answer) {
    redirect(`/admin/faq/${id}/edit?error=required`);
  }

  const { error } = await getSupabaseServerClient()
    .from("faq")
    .update({ question, answer, category: category || null })
    .eq("id", id);

  if (error) {
    console.error("Failed to update FAQ", error);
    redirect(`/admin/faq/${id}/edit?error=save`);
  }

  revalidatePath("/admin/faq");
  redirect("/admin/faq");
}

export async function deleteFaqAction(id: string): Promise<void> {
  const { error } = await getSupabaseServerClient().from("faq").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete FAQ", error);
    return;
  }

  revalidatePath("/admin/faq");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase";

function parsePrice(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed);
}

export async function createMenuAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = parsePrice(formData.get("price"));

  if (!name || price === null) {
    redirect("/admin/menus/new?error=required");
  }

  const { error } = await getSupabaseServerClient()
    .from("menus")
    .insert({ name, price, description: description || null });

  if (error) {
    console.error("Failed to create menu", error);
    redirect("/admin/menus/new?error=save");
  }

  revalidatePath("/admin/menus");
  redirect("/admin/menus");
}

export async function updateMenuAction(id: string, formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = parsePrice(formData.get("price"));

  if (!name || price === null) {
    redirect(`/admin/menus/${id}/edit?error=required`);
  }

  const { error } = await getSupabaseServerClient()
    .from("menus")
    .update({ name, price, description: description || null })
    .eq("id", id);

  if (error) {
    console.error("Failed to update menu", error);
    redirect(`/admin/menus/${id}/edit?error=save`);
  }

  revalidatePath("/admin/menus");
  redirect("/admin/menus");
}

export async function deleteMenuAction(id: string): Promise<void> {
  const { error } = await getSupabaseServerClient().from("menus").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete menu", error);
    return;
  }

  revalidatePath("/admin/menus");
}

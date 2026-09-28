import { getSupabaseServerClient } from "@/lib/supabase";

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
};

export async function getFaqCategories(): Promise<string[]> {
  const { data, error } = await getSupabaseServerClient()
    .from("faq")
    .select("category")
    .not("category", "is", null);

  if (error) {
    throw error;
  }

  const categories = new Set<string>();
  for (const row of data ?? []) {
    if (row.category) {
      categories.add(row.category);
    }
  }

  return [...categories];
}

export async function searchFaq(category: string | null): Promise<FaqRow[]> {
  let query = getSupabaseServerClient().from("faq").select("id, question, answer, category");

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

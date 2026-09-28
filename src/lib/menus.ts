import { getSupabaseServerClient } from "@/lib/supabase";

export type MenuRow = {
  id: string;
  name: string;
  price: number;
  description: string | null;
};

export async function getAllMenus(): Promise<MenuRow[]> {
  const { data, error } = await getSupabaseServerClient()
    .from("menus")
    .select("id, name, price, description")
    .order("name");

  if (error) {
    throw error;
  }

  return data ?? [];
}

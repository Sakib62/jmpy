import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../utils/supabaseClient";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Find the URL row (id, original_url, click_count)
  const { data } = await supabase
    .from("urls")
    .select("id, original_url, click_count")
    .or(`short_code.eq.${code},custom_alias.eq.${code}`)
    .maybeSingle();

  if (data && data.original_url) {
    // Update analytics
    await supabase
      .from("urls")
      .update({
        click_count: (data.click_count || 0) + 1,
        last_accessed: new Date().toISOString(),
      })
      .eq("id", data.id);
    return NextResponse.redirect(data.original_url, 302);
  } else {
    return NextResponse.json({ error: "Short URL not found" }, { status: 404 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../utils/supabaseClient";
import { rateLimit } from "./rateLimit";

function generateShortCode(length = 6) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  const { url, customAlias, userId } = await req.json();
  // Rate limiting (pass userId to get different limits)
  const rate = await rateLimit(req, userId);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: `Rate limit exceeded. Try again in ${Math.ceil(
          rate.reset - Date.now() / 1000
        )}s.`,
      },
      { status: 429 }
    );
  }
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  let code;
  if (customAlias) {
    // Validate custom alias: only a-z, A-Z, 0-9, - and _ allowed
    const aliasRegex = /^[a-zA-Z0-9_-]+$/;
    if (!aliasRegex.test(customAlias)) {
      return NextResponse.json(
        {
          error:
            "Invalid alias format. Only letters, numbers, dashes (-), and underscores (_) are allowed.",
        },
        { status: 400 }
      );
    }
    if (typeof customAlias !== "string" || customAlias.length < 6) {
      return NextResponse.json(
        { error: "Alias must be at least 6 characters" },
        { status: 400 }
      );
    }
    if (customAlias.length > 32) {
      return NextResponse.json(
        { error: "Alias must be at most 32 characters" },
        { status: 400 }
      );
    }
    // Check if custom alias is taken
    const { data: aliasExists } = await supabase
      .from("urls")
      .select("id")
      .eq("short_code", customAlias)
      .maybeSingle();
    if (aliasExists) {
      return NextResponse.json(
        { error: "Alias is already taken" },
        { status: 409 }
      );
    }
    code = customAlias;
  } else {
    // Generate a unique short code
    let unique = false;
    while (!unique) {
      code = generateShortCode();
      const { data: codeExists } = await supabase
        .from("urls")
        .select("id")
        .eq("short_code", code)
        .maybeSingle();
      if (!codeExists) unique = true;
    }
  }

  // Insert the new short URL
  const { error: insertError } = await supabase.from("urls").insert({
    original_url: url,
    short_code: code,
    custom_alias: customAlias || null,
    user_id: userId || null,
  });
  if (insertError) {
    return NextResponse.json({ error: "Failed to save URL" }, { status: 500 });
  }

  return NextResponse.json({ code });
}

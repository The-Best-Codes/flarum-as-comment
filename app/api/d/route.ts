import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force_dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing id parameter" },
      { status: 400 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_FLARUM_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_FLARUM_BASE_URL is not defined" },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(`${baseUrl}/discussions/${id}`);

    if (!response.ok) {
      console.error(
        `Flarum API request failed: ${response.status} ${response.statusText}`,
      );
      return NextResponse.json(
        {
          error: `Flarum API request failed: ${response.status} ${response.statusText}`,
        },
        { status: response.status },
      );
    }

    // Return the raw response from the Flarum API
    return NextResponse.json(await response.json());
  } catch (error: any) {
    console.error("Error fetching data from Flarum API:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from Flarum API", details: error.message },
      { status: 500 },
    );
  }
}

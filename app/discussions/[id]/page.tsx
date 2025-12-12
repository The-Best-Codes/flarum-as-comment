import { Skeleton } from "@/components/ui/skeleton";
import { ApiResponse, Post, User } from "@/types/discussion";
import { Suspense } from "react";
import DiscussionPageClient from "./DiscussionPageClient";

export const dynamicParams = true;
export const revalidate = 60;

function parseSSGPostIds(): string[] {
  const envValue = process.env.NEXT_PUBLIC_SSG_POST_IDS;

  if (!envValue) {
    return [];
  }

  try {
    const parsedArray = JSON.parse(envValue);

    if (!Array.isArray(parsedArray)) {
      console.warn(
        "NEXT_PUBLIC_SSG_POST_IDS is not a valid array. Using default empty array.",
      );
      return [];
    }

    const validatedArray = parsedArray.map(String);
    return validatedArray;
  } catch (error) {
    console.error(
      "Error parsing NEXT_PUBLIC_SSG_POST_IDS. Using default empty array.",
      error,
    );
    return [];
  }
}

export async function generateStaticParams() {
  const idsToGenerate = parseSSGPostIds();

  return idsToGenerate.map((id) => ({
    id: id,
  }));
}

interface Props {
  params: { id: string };
}

async function fetchData(id: string): Promise<{
  posts: Post[] | null;
  discussion: ApiResponse["data"] | null;
  users: User[] | null;
  error: string | null;
}> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const apiUrl = `${baseUrl}/api/d?id=${id}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Forum post does not exist.");
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }
    const data: ApiResponse = await response.json();

    const postData = data.included?.filter(
      (item): item is Post => item.type === "posts",
    );
    const posts = postData || null;

    const userData = data.included?.filter(
      (item): item is User => item.type === "users",
    );
    const users = userData || null;

    return {
      posts: posts,
      discussion: data.data,
      users: users,
      error: null,
    };
  } catch (e: any) {
    console.error("Failed to fetch posts:", e);
    return {
      posts: null,
      discussion: null,
      users: null,
      error: e.message || "Failed to load comments.",
    };
  }
}

export default async function DiscussionPage({ params }: Props) {
  const id = params.id;
  const { posts, users, error } = await fetchData(id);

  return (
    <Suspense fallback={<Skeleton className="h-10 w-full" />}>
      <DiscussionPageClient
        idParam={id}
        posts={posts}
        users={users}
        error={error}
      />
    </Suspense>
  );
}

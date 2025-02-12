import { Skeleton } from "@/components/ui/skeleton";
import { ApiResponse, Post, User } from "@/types/discussion";
import { Suspense } from "react";
import DiscussionPageClient from "./DiscussionPageClient";

export const dynamicParams = true;
export const revalidate = 60;
export const experimental_ppr = true;

export async function generateStaticParams() {
  const idsToGenerate = ["9"];

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
    // Construct the absolute URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const apiUrl = `${baseUrl}/api/d?id=${id}`; // use absolute URL
    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Forum post does not exist.");
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }
    const data: ApiResponse = await response.json();

    // Extract posts from included data
    const postData = data.included?.filter(
      (item): item is Post => item.type === "posts",
    );
    const posts = postData || null;

    // Extract users from included data
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

// This is the Server Component
export default async function DiscussionPage({ params }: Props) {
  // We MUST await the params. Next.js 15.2 experimental requires this.
  const id = (await params).id;
  const { posts, discussion, users, error } = await fetchData(id);

  return (
    <Suspense fallback={<Skeleton className="h-10 w-full" />}>
      <DiscussionPageClient
        idParam={id}
        posts={posts}
        discussion={discussion}
        users={users}
        error={error}
      />
    </Suspense>
  );
}

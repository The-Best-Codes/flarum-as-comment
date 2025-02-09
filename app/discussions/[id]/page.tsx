"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ApiResponse,
  DiscussionPageProps,
  Post,
  User,
} from "@/types/discussion";
import { format } from "date-fns";
import { Loader2, MessageCircle, XCircle } from "lucide-react";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";

const DiscussionPage: React.FC<DiscussionPageProps> = ({
  params,
}: {
  params: { id: string };
}) => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [discussion, setDiscussion] = useState<ApiResponse["data"] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const unwrappedParams: { id: string } = use(params as any);
  const idParam = unwrappedParams.id;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/d?id=${idParam}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Forum post does not exist.");
          } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        }
        const data: ApiResponse = await response.json();
        setDiscussion(data.data);

        // Extract posts from included data
        const postData = data.included?.filter(
          (item): item is Post => item.type === "posts",
        );
        setPosts(postData || null);

        // Extract users from included data
        const userData = data.included?.filter(
          (item): item is User => item.type === "users",
        );
        setUsers(userData || null);
      } catch (e: any) {
        console.error("Failed to fetch posts:", e);
        setError(e.message || "Failed to load comments.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [idParam]);

  const findUserById = (userId: string): User | undefined => {
    return users?.find((user) => user.id === userId);
  };

  const getFirstPost = (): Post | undefined => {
    return posts ? posts[0] : undefined;
  };

  if (loading) {
    return (
      <main className="w-full min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-32 w-32 animate-spin mb-2 text-blue-500" />
        <p className="text-lg text-black">Loading comments...</p>
        <span className="text-sm text-gray-600">
          Those big, beautiful comments...
        </span>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-h-screen flex flex-col items-center justify-center">
        <XCircle className="h-32 w-32 mb-2 text-red-500" />
        <p className="text-base text-red-600">{error}</p>
      </main>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <main className="w-full min-h-screen flex flex-col items-center justify-center">
        <MessageCircle className="h-32 w-32 mb-2 text-gray-500" />
        <p className="text-lg text-black">Be the first to comment!</p>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen">
      <Link
        className="p-4 bg-gray-100 border-b flex flex-col md:flex-row md:items-center md:justify-between"
        href={`${process.env.NEXT_PUBLIC_FLARUM_PUBLIC_URL}/d/${idParam}`}
      >
        <div>
          <span className="text-4xl font-bold block">Conversation</span>
          <span className="text-lg ml-2 block">
            {posts?.length} Comment{posts?.length === 1 ? "" : "s"}
          </span>
        </div>
        <Button
          variant="outline"
          asChild
          className="mt-2 md:mt-0 w-fit bg-sky-600 hover:bg-sky-700 text-white hover:text-white border-none"
        >
          <Link
            href={`${process.env.NEXT_PUBLIC_FLARUM_PUBLIC_URL}/d/${idParam}`}
          >
            Login to Comment
          </Link>
        </Button>
      </Link>
      <div className="overflow-y-auto h-full">
        {posts.map((post) => {
          const user = findUserById(post.relationships.user.data.id);

          const username = user?.attributes?.username || "";
          const avatarAlt = username.trim() || "?";

          const fallbackInitial = username.trim()
            ? username.trim().charAt(0).toUpperCase()
            : "?";

          return (
            <Card
              key={post.id}
              className="mb-2 w-full border-none shadow-none bg-transparent"
            >
              <CardContent className="p-4">
                <div className="flex flex-col bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      {user?.attributes?.avatarUrl ? (
                        <AvatarImage
                          src={user?.attributes?.avatarUrl}
                          alt={avatarAlt}
                        />
                      ) : (
                        <AvatarFallback>{fallbackInitial}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="text-sm font-bold">
                        {user?.attributes?.username || "Unknown User"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(
                          new Date(post.attributes.createdAt),
                          "MMM dd, yyyy hh:mm a",
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className="mt-2 max-w-full break-words [&_a]:text-sky-600 [&_a]:hover:text-sky-700"
                    dangerouslySetInnerHTML={{
                      __html: post.attributes.contentHtml,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
};

export default DiscussionPage;

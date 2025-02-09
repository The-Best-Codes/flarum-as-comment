"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  ApiResponse,
  DiscussionPageProps,
  Post,
  User,
} from "@/types/discussion";
import { format } from "date-fns";
import { Loader2, MessageCircle, XCircle } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center h-full w-full">
        <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
        <p className="text-sm text-gray-600">Fetching comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <XCircle className="h-8 w-8 mb-2 text-red-500" />
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <MessageCircle className="h-8 w-8 mb-2 text-gray-500" />
        <p className="text-sm text-gray-600">Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-full">
      <div className="p-4 bg-gray-100 border-b flex flex-col">
        <span className="text-4xl font-bold">Conversation</span>
        <span className="text-lg ml-2">
          {posts?.length} Comment{posts?.length === 1 ? "" : "s"}
        </span>
      </div>
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
                <div className="flex space-x-4">
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
                    <div
                      className="mt-2 break-words"
                      dangerouslySetInnerHTML={{
                        __html: post.attributes.contentHtml,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DiscussionPage;

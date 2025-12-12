"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiResponse, Post, User } from "@/types/discussion";
import { format } from "date-fns";
import { MessageCircle, XCircle } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

interface DiscussionPageClientProps {
  idParam: string;
  posts: Post[] | null;
  users: User[] | null;
  error: string | null;
}

const DiscussionPageClient: React.FC<DiscussionPageClientProps> = ({
  idParam,
  posts,
  users,
  error,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const links = contentRef.current.querySelectorAll("a");
      links.forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });
    }
  }, [posts]);

  const findUserById = (userId: string): User | undefined => {
    return users?.find((user) => user.id === userId);
  };

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
      <div className="p-4 bg-gray-100 border-b flex flex-col md:flex-row md:items-center md:justify-between">
        <Link
          target="_blank"
          href={`${process.env.NEXT_PUBLIC_FLARUM_PUBLIC_URL}/d/${idParam}`}
        >
          <span className="text-4xl font-bold block">Conversation</span>
          <span className="text-lg ml-2 block">
            {posts?.length} Comment{posts?.length === 1 ? "" : "s"}
          </span>
        </Link>
        <Button
          variant="outline"
          asChild
          className="mt-2 md:mt-0 w-fit bg-sky-600 hover:bg-sky-700 text-white hover:text-white border-none"
        >
          <Link
            href={`${process.env.NEXT_PUBLIC_FLARUM_PUBLIC_URL}/d/${idParam}`}
            target="_blank"
          >
            Login to Comment
          </Link>
        </Button>
      </div>
      <div className="overflow-y-auto h-full">
        {posts.map((post) => {
          const user = findUserById(post.relationships.user.data.id);

          const username = user?.attributes?.username || "";

          const fallbackInitial = username.trim()
            ? username.trim().charAt(0).toUpperCase()
            : "?";

          return (
            <Card
              key={post.id}
              className="w-full border-none shadow-none bg-transparent"
            >
              <CardContent className="p-4 pb-0">
                <div className="flex flex-col bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar
                      src={user?.attributes?.avatarUrl}
                      alt={user?.attributes?.username || "Unknown User"}
                      fallback={fallbackInitial}
                    />
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
                    className="mt-2 max-w-full wrap-break-word [&_a]:text-sky-600 [&_a]:hover:text-sky-700"
                    ref={contentRef}
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

export default DiscussionPageClient;

export interface Post {
  type: string;
  id: string;
  attributes: {
    number: number;
    createdAt: string;
    contentType: string;
    contentHtml: string;
    renderFailed: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canHide: boolean;
    mentionedByCount: number;
    canFlag: boolean;
    isApproved: boolean;
    canApprove: boolean;
    canLike: boolean;
    likesCount: number;
  };
  relationships: {
    discussion: {
      data: {
        type: string;
        id: string;
      };
    };
    user: {
      data: {
        type: string;
        id: string;
      };
    };
    mentionedBy: {
      data: [];
    };
    likes: {
      data: [];
    };
  };
}

export interface User {
  type: string;
  id: string;
  attributes: {
    username: string;
    avatarUrl: string;
  };
}

export interface ApiResponse {
  data: {
    type: string;
    id: string;
    attributes: {
      title: string;
      slug: string;
      commentCount: number;
      participantCount: number;
      createdAt: string;
      lastPostedAt: string;
      lastPostNumber: number;
      canReply: boolean;
      canRename: boolean;
      canDelete: boolean;
      canHide: boolean;
      isApproved: boolean;
      canTag: boolean;
      subscription: string | null;
      isSticky: boolean;
      canSticky: boolean;
      isLocked: boolean;
      canLock: boolean;
    };
    relationships: {
      user: {
        data: {
          type: string;
          id: string;
        };
      };
      posts: {
        data: {
          type: string;
          id: string;
        }[];
      };
      tags: {
        data: {
          type: string;
          id: string;
        }[];
      };
    };
  };
  included?: (User | Post)[];
}

export interface DiscussionPageProps {
  params: { id: string };
}

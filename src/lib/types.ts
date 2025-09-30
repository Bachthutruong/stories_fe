export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthenticatedUser {
  token: string;
  user: User;
}

export interface Post {
  _id: string;
  id?: string; // For compatibility
  postId: string;
  title: string;
  description: string;
  images?: { url: string; public_id: string }[];
  likes: number;
  shares: number;
  commentsCount: number;
  isFeatured: boolean;
  isHidden: boolean;
  luckyNumber: string;
  userId: {
    _id: string;
    name: string;
    phoneNumber: string;
    email?: string;
  };
  contactInfo?: {
    phoneNumber: string;
    email?: string;
  };
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  userId: User;
  postId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  _id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Report {
  _id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'rejected';
  userId: User;
  postId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Keyword {
  _id: string;
  word: string;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lottery {
  _id: string;
  lotteryNumber: string;
  status: 'active' | 'completed';
  winners?: string[];
  createdAt: string;
  updatedAt: string;
}

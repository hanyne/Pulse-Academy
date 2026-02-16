export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    bio?: string;
  };
  image: string;
  rating: number;
  duration: string;
  price: number;
  createdAt: Date;
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
    date?: string; // New field for specific date (e.g., "2025-05-05")
  }[];
}
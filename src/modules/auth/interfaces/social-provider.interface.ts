export interface ISocialAuthProvider {
  verify(token: string): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePic?: string;
  }>;
} 
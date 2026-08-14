export type AuthActionResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
};

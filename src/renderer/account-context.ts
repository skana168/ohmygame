import { createContext, useContext } from "react";

export type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; user: AuthUser };

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface AuthContextValue {
  state: AuthState;
  openSignIn: () => void;
  requestAccessToken: () => Promise<string | undefined>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function useOptionalAccount(): AuthContextValue | undefined {
  return useContext(AuthContext);
}

import type { DefaultSession } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    id?: number;
  }
}

export type ProjectTrackerSession = Omit<DefaultSession, "user"> & {
  user: Omit<NonNullable<DefaultSession["user"]>, "id"> & {
    id: number;
  };
};

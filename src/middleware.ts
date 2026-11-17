import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((request) => {
  if (request.auth?.user) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: [
    "/((?!login(?:/|$)|api/auth(?:/|$)|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Do NOT redirect logged-in users here: server redirect drops Set-Cookie and
  // client redirect (RedirectToAdmin) causes admin layout to run without cookies
  // in same request, redirecting back to login → loop.
  return <>{children}</>;
}

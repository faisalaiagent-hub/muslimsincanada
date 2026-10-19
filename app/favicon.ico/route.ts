export function GET(request: Request) {
  return Response.redirect(new URL('/favicon.png', request.url), 307);
}

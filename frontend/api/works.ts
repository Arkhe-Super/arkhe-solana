export default async function handler(request: Request) {
  if (request.method === "GET") {
    return Response.json({
      status: "ok",
      endpoint: "works",
      message: "Works API is running",
    });
  }

  return Response.json(
    {
      status: "error",
      message: "Method not allowed",
    },
    { status: 405 }
  );
}
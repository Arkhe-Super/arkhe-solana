export default function handler() {
  return Response.json({
    status: "ok",
    endpoint: "works",
    message: "Works API is running",
  });
}
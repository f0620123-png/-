export async function GET() {
  return Response.json({
    ok: true,
    message: "API is working",
    time: new Date().toISOString()
  });
}

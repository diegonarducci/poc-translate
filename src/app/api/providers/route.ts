import { listProviderStatuses } from "@/lib/translation/provider-config";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    providers: listProviderStatuses()
  });
}

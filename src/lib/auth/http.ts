import { NextResponse } from "next/server";

export function unauthorizedResponse(): NextResponse { return NextResponse.json({ error: "未解锁，无法访问私人数据" }, { status: 401 }); }
export function badRequestResponse(message: string): NextResponse { return NextResponse.json({ error: message }, { status: 400 }); }
export function serverErrorResponse(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : "服务器暂时无法处理请求";
  return NextResponse.json({ error: message }, { status: 500 });
}

import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5500";

function buildBackendUrl(path: string[], request: NextRequest) {
  const targetUrl = new URL(`/api/${path.join("/")}`, backendBaseUrl);
  targetUrl.search = request.nextUrl.search;
  return targetUrl;
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const targetUrl = buildBackendUrl(path, request);
  const requestHeaders = new Headers();
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");

  if (contentType) {
    requestHeaders.set("content-type", contentType);
  }

  if (authorization) {
    requestHeaders.set("authorization", authorization);
  }

  if (cookie) {
    requestHeaders.set("cookie", cookie);
  }

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers: requestHeaders,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
    cache: "no-store",
    redirect: "manual"
  });

  const responseHeaders = new Headers();
  const responseContentType = upstreamResponse.headers.get("content-type");
  const setCookie = upstreamResponse.headers.get("set-cookie");
  const location = upstreamResponse.headers.get("location");

  if (responseContentType) {
    responseHeaders.set("content-type", responseContentType);
  }

  if (setCookie) {
    responseHeaders.append("set-cookie", setCookie);
  }

  if (location) {
    responseHeaders.set("location", location);
  }

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

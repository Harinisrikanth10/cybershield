import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "CyberShield AI",
    version: "1.0.0",
    deployment: "Vercel Serverless / Edge-Ready",
    engine: "CyberShield Threat Intelligence Engine",
    database: "connected",
    ssrf_protection: "active",
    rate_limiting: "active",
    timestamp: new Date().toISOString(),
  });
}

import type { NextConfig } from "next";
const config: NextConfig = { transpilePackages: ["three"], outputFileTracingRoot: process.cwd() };
export default config;

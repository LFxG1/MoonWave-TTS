import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  [
    "connect-src 'self'",
    'https://*.azurewebsites.net',
    'http://127.0.0.1:*',
    'http://localhost:*',
    'ws://127.0.0.1:*',
    'ws://localhost:*',
  ].join(' '),
].join('; ');

const securityHeaders = {
  'Content-Security-Policy': contentSecurityPolicy,
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

const devSecurityHeaders = {
  'Permissions-Policy': securityHeaders['Permissions-Policy'],
  'Referrer-Policy': securityHeaders['Referrer-Policy'],
  'X-Content-Type-Options': securityHeaders['X-Content-Type-Options'],
  'X-Frame-Options': securityHeaders['X-Frame-Options'],
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    headers: devSecurityHeaders,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7071',
        changeOrigin: true,
      },
    },
  },
  preview: {
    headers: securityHeaders,
  },
});

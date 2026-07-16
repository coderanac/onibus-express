"use client";

import Script from "next/script";
import { useRef } from "react";

const SWAGGER_UI_VERSION = "5.17.14";

declare global {
  interface Window {
    SwaggerUIBundle?: (config: { url: string; dom_id: string }) => void;
  }
}

export default function ApiDocsPage() {
  const hasInitialized = useRef(false);

  function initializeSwaggerUi() {
    if (hasInitialized.current || !window.SwaggerUIBundle) return;
    hasInitialized.current = true;
    window.SwaggerUIBundle({ url: "/openapi.json", dom_id: "#swagger-ui" });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Documentação da API</h1>
      <p className="mt-1 text-slate-600">
        Endpoints do backend do OniBus Express, descritos em OpenAPI 3.0.
      </p>
      <link
        rel="stylesheet"
        href={`https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css`}
      />
      <div id="swagger-ui" className="mt-6" />
      <Script
        src={`https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js`}
        strategy="afterInteractive"
        onReady={initializeSwaggerUi}
        onLoad={initializeSwaggerUi}
      />
    </div>
  );
}

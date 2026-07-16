"use client";

import { useEffect } from "react";

export default function GlobalErrorScreen({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            padding: "0 1rem",
          }}
        >
          <div style={{ fontSize: "3rem" }}>🔧</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>
            Estamos trocando os pneus.
          </h1>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error replaces the root layout, so next/link's router context is not guaranteed to be available */}
          <a
            href="/"
            style={{
              marginTop: "0.5rem",
              borderRadius: "0.5rem",
              backgroundColor: "#1d4ed8",
              color: "#fff",
              padding: "0.625rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Voltar para tela principal
          </a>
        </div>
      </body>
    </html>
  );
}

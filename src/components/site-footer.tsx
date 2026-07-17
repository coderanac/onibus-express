import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="bg-[#0c103c]">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row">
        <p className="text-sm text-white">Esse é um teste para o Grupo JCA</p>
        <a
          href="https://jcaholding.com.br/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <Image src="/logo-jca.png" alt="Grupo JCA" width={100} height={41} />
        </a>
      </div>
    </footer>
  );
}

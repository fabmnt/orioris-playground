import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-5xl font-bold tracking-tight">
        Orioris{" "}
        <Image
          className="inline-block"
          src="/oriorisai.svg"
          alt="Orioris logo"
          width={100}
          height={100}
        />
      </h1>
    </div>
  );
}

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-[80vh] grid place-items-center px-6">
      <div className="text-center max-w-2xl">
        <h1 className="font-display text-6xl tracking-tight">Mercury</h1>
        <p className="mt-2 text-xl opacity-90 italic">For Your Insight.</p>
        <p className="mt-6 opacity-90 leading-relaxed">
          Speak what you’re trying to say — to anyone, about anything.
          Mercury explores with you, finds your true wording, and helps you express it with calm clarity.
        </p>
        <div className="mt-10">
          <Link
            href="/chat"
            className="inline-block rounded-md bg-white/10 px-6 py-3 hover:bg-white/20 transition"
          >
            Begin
          </Link>
        </div>
        <p className="mt-12 text-sm opacity-70">
          $19/month • unlimited recalibrations • support@mercury.fyi
        </p>
      </div>
    </main>
  );
}

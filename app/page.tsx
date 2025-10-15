import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-[80vh] grid place-items-center px-6">
      <div className="text-center max-w-2xl">
        <h1 className="font-display text-6xl tracking-tight">Mercury</h1>
        <p className="mt-2 text-xl opacity-90 italic">For Your Insight.</p>
        <p className="mt-6 opacity-90 leading-relaxed">
          Type what you’re trying to say — to anyone, about anything.
          Mercury helps you find the words that match what you really mean.
          Whether it’s a message, a meeting, or a moment that matters —
          he helps you align your tone, truth, and timing.
        </p>
        <div className="mt-10">
          <Link
            href="/chat"
            className="inline-block rounded-md bg-white/10 px-6 py-3 hover:bg-white/20 transition"
          >
            Begin recalibration
          </Link>
        </div>
        <p className="mt-12 text-sm opacity-70">
          $19/month • unlimited recalibrations • support@mercury.fyi
        </p>
      </div>
    </main>
  );
}

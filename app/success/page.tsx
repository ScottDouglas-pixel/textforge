import Link from "next/link";
import { CheckCircle, ArrowRight, Zap } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-forge-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
          <CheckCircle size={36} className="text-green-400" />
        </div>

        <h1 className="font-display text-4xl font-bold mb-3">
          You&apos;re all set! 🎉
        </h1>
        <p className="text-forge-muted mb-8 leading-relaxed">
          Your subscription is active. Start creating unlimited blog posts and podcast scripts right now.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/convert/blog" className="btn-gold py-4 text-base inline-flex items-center justify-center gap-2">
            <Zap size={18} />
            Write Your First Blog Post
          </Link>
          <Link href="/convert/podcast" className="btn-outline py-4 text-base inline-flex items-center justify-center gap-2">
            Write a Podcast Script
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

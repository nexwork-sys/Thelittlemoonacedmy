export default function GoToLiveLink() {
  return (
    <a
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-xl border border-navy-400 px-3.5 py-1.5 text-sm text-navy transition-colors hover:bg-navy hover:text-ivory"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 14 20 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Go to Live Page
    </a>
  );
}

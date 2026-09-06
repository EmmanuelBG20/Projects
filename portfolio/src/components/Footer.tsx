import { CONTACT } from "@/lib/data";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-8">
      <div className="container-xl flex flex-col items-center justify-between gap-3 text-xs text-paper-400 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Emmanuel Bermúdez.</p>
        <a href={CONTACT.github} target="_blank" rel="noopener noreferrer" className="hover:text-paper-50">
          {CONTACT.githubHandle}
        </a>
      </div>
    </footer>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";

const navItems = [
  { name: "Home", href: "/" },
  { 
    name: "Projects", 
    href: "/#work",
    dropdown: [
      { name: "Web Development", slug: "web-dev", sectionId: "work" },
      { name: "UI/UX Design", slug: "ui-ux", sectionId: "work" },
      { name: "AI & Machine Learning", slug: "ai-ml", sectionId: "work" },
      { name: "Photography", slug: "photography", sectionId: "work" },
      { name: "Video Editing", slug: "video-editing", sectionId: "work" },
      { name: "Graphic Design", slug: "graphic-design", sectionId: "work" },
    ]
  },
  {
    name: "Gallery",
    href: "/#gallery",
    dropdown: [
      { name: "Photography", slug: "photography", sectionId: "gallery" },
      { name: "Video Editing", slug: "video-editing", sectionId: "gallery" },
      { name: "Graphic Design", slug: "graphic-design", sectionId: "gallery" },
    ]
  },
  { name: "Credentials", href: "/#credentials" },
  { name: "Achievements", href: "/#achievements" },
  { name: "About", href: "/#about" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleDropdownItemClick = (slug: string, sectionId: string) => {
    // 1. Scroll smoothly to target section if present
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      // Fallback redirect to home page with hash
      window.location.href = `/#${sectionId}`;
      return;
    }

    // 2. Dispatch custom event to update category/tab states
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("filter-change", { detail: { slug, sectionId } }));
    }, 100);
  };

  const handleHashLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      const targetId = href.substring(2);
      const element = document.getElementById(targetId);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
              <span className="text-white">Wardan</span>
              <span className="text-violet-500 ml-1.5">Nugraha</span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                
                if (item.dropdown) {
                  return (
                    <div key={item.name} className="relative group py-2">
                      <button
                        className={`text-sm font-medium transition-colors duration-200 hover:text-white flex items-center gap-1 cursor-pointer outline-none ${
                          isActive ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {item.name}
                        <svg className="w-3.5 h-3.5 transition-transform duration-250 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Glassmorphic Dropdown Menu */}
                      <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-2xl bg-zinc-950/95 border border-white/5 p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 backdrop-blur-xl z-50">
                        {item.dropdown.map((subItem) => (
                          <button
                            key={subItem.name}
                            onClick={() => handleDropdownItemClick(subItem.slug, subItem.sectionId)}
                            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-150 flex items-center justify-between cursor-pointer"
                          >
                            {subItem.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleHashLinkClick(e, item.href)}
                    className={`text-sm font-medium transition-colors duration-200 hover:text-white ${
                      isActive ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <Link
                href="/#contact"
                onClick={(e) => handleHashLinkClick(e, "/#contact")}
                className="flex items-center gap-1 text-sm font-medium bg-white/10 hover:bg-white/15 text-white py-1.5 px-4 rounded-full border border-white/5 transition-all"
              >
                Hire Me <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-zinc-400 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-white/5 bg-zinc-950/95 backdrop-blur-lg max-h-[85vh] overflow-y-auto">
          <div className="px-2 pt-2 pb-4 space-y-2 sm:px-3">
            {navItems.map((item) => (
              <div key={item.name} className="space-y-1">
                {item.dropdown ? (
                  <>
                    <span className="block px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-500">
                      {item.name} Fields
                    </span>
                    {item.dropdown.map((subItem) => (
                      <button
                        key={subItem.name}
                        onClick={() => {
                          setIsOpen(false);
                          handleDropdownItemClick(subItem.slug, subItem.sectionId);
                        }}
                        className="w-full text-left block px-6 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                      >
                        {subItem.name}
                      </button>
                    ))}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      setIsOpen(false);
                      handleHashLinkClick(e, item.href);
                    }}
                    className="block px-3 py-2.5 rounded-md text-base font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            <Link
              href="/#contact"
              onClick={(e) => {
                setIsOpen(false);
                handleHashLinkClick(e, "/#contact");
              }}
              className="flex items-center justify-between w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white px-4 py-3 rounded-xl font-medium text-center transition-colors"
            >
              <span>Hire Me</span>
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

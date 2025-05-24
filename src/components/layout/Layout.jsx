import React, {useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";
import {Outlet} from "react-router-dom";
import {db} from "@/lib/db";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (e) => setMatches(e.matches);
    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export default function Layout() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      const result = await db.getAllCategories();
      setCategories(result);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
      <div className="flex h-screen  overflow-hidden">
        {isDesktop ? (
            <aside className="w-64 bg-zinc-900 text-white border-r shadow-lg flex-shrink-0">
              <Sidebar categories={categories} onClose={() => {}} />
            </aside>
        ) : (
            <AnimatePresence>
              {sidebarOpen && (
                  <>
                    <motion.aside
                        key="sidebar"
                        initial={{ x: -250 }}
                        animate={{ x: 0 }}
                        exit={{ x: -250 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-0 left-0 z-50 h-full w-64 bg-zinc-900 text-white shadow-lg"
                    >
                      <Sidebar categories={categories} onClose={() => setSidebarOpen(false)} />
                    </motion.aside>
                    <div
                        className="fixed inset-0 z-40 bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                    />
                  </>
              )}
            </AnimatePresence>
        )}

        <div className="flex flex-col flex-1 overflow-hidden">
          <Header
              sidebarOpen={sidebarOpen}
              toggleSidebar={toggleSidebar}
              showHamburger={!isDesktop}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
  );
}

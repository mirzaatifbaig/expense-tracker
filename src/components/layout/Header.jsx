import { BellIcon, SearchIcon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "../ThemeToggle";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
export default function Header({ sidebarOpen, toggleSidebar }) {
  const [settings, setSettings] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const loadSettings = async () => {
      const appSettings = await db.getSettings();
      setSettings(appSettings || null);
    };
    loadSettings();
  }, []);
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search for:", searchQuery);
  };
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center gap-2 min-w-0 flex-1 max-w-lg"
          role="search"
        >
          <div className="relative flex-grow min-w-0">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search expenses..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search expenses"
              spellCheck="false"
            />
          </div>
          <Button type="submit" variant="ghost" size="icon" aria-label="Search">
            <SearchIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
      <h1 className="font-semibold truncate">Expense Tracker</h1>{" "}
      <div className="flex items-center gap-4 min-w-0">
        {settings && (
          <div className="hidden md:flex items-center px-3 py-1 rounded-md bg-muted whitespace-nowrap min-w-max">
            <span className="text-sm font-medium truncate">
              {formatCurrency(0, settings.currency, settings.locale)}
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}

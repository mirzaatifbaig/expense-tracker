import {useEffect, useState} from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import {AnimatePresence, motion} from "framer-motion";
import {db} from "./lib/db";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import SettingsComponent from "./pages/Settings";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import {Skeleton} from "./components/ui/skeleton";
import {Toaster} from "sonner";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const appSettings = await db.getSettings();
        if (appSettings) {
          setSettings(appSettings);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    };
    loadInitialData().then((response) => console.log(response.data));
  }, []);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Toaster />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsComponent />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
export default App;

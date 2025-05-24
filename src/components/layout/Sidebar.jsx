import {useLocation, useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";
import {motion} from "framer-motion";
import {BarChart3, Home, Plus, ReceiptText, Settings, Tags, Wallet,} from "lucide-react";

export default function Sidebar({ onClose, categories }) {
  const navigate = useNavigate();
  const location = useLocation();
  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Expenses",
      href: "/expenses",
      icon: <ReceiptText className="h-5 w-5" />,
    },
    {
      title: "Categories",
      href: "/categories",
      icon: <Tags className="h-5 w-5" />,
    },
    {
      title: "Budgets",
      href: "/budgets",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      title: "Reports",
      href: "/reports",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];
  const renderNavItems = (items) =>
    items.map((item) => (
      <Button
        key={item.href}
        variant={location.pathname === item.href ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => {
          navigate(item.href);
          onClose();
        }}
      >
        {item.icon}
        <span className="ml-3 truncate">{item.title}</span>
      </Button>
    ));
  const rootCategories = categories
    .filter((category) => !category.parentId)
    .sort((a, b) => a.order - b.order);
  return (
    <div className="flex flex-col h-full min-w-[250px] max-w-[280px]">
      <div className="flex items-center h-16 px-4 border-b shrink-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <div className="flex items-center justify-center w-16 h-8 rounded-full bg-primary shrink-0">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
        </motion.div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 flex flex-col gap-4">
            <Button
              className="w-full flex-shrink-0"
              onClick={() => {
                console.log("Add expense");
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>{" "}
            <nav className="grid gap-1">
              {renderNavItems(mainNavItems)}
            </nav>{" "}
            {rootCategories.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="mb-2">
                  <h3 className="px-4 text-xs font-semibold text-muted-foreground truncate">
                    Categories
                  </h3>
                </div>
                <div className="grid gap-1">
                  {rootCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className="w-full justify-start truncate"
                      onClick={() => {
                        navigate(`/expenses?category=${category.id}`);
                        onClose();
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="truncate">{category.name}</span>
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

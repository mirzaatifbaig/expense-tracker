import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  Search,
  CalendarIcon,
  RefreshCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
const ExpenseTable = React.memo(
  ({
    expenses,
    categories,
    tags,
    paymentMethods,
    settings,
    viewType,
    handleDeleteExpense,
    handleRestoreExpense,
    handlePermanentDelete,
  }) => {
    const getCategoryById = (id) => {
      return categories.find((cat) => cat.id === id);
    };
    const getPaymentMethodById = (id) => {
      return paymentMethods.find((method) => method.id === id);
    };
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            {viewType === "active" && <TableHead>Tags</TableHead>}
            {viewType === "active" && <TableHead>Payment</TableHead>}
            {viewType === "deleted" && <TableHead>Deleted</TableHead>}
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length > 0 ? (
            expenses.map((expense) => {
              const category = getCategoryById(expense?.categoryId);
              const paymentMethod = getPaymentMethodById(expense.paymentMethod);
              return (
                <TableRow
                  key={expense.id}
                  className={viewType === "deleted" ? "opacity-70" : ""}
                >
                  <TableCell className="font-medium">
                    {formatDate(expense.date, settings?.locale || "en-US", {
                      day: "numeric",
                      month: "short",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {expense.description || "No description"}
                      {expense?.isRecurring && (
                        <Badge variant="outline" className="text-xs">
                          <RefreshCcw className="h-3 w-3 mr-1" />
                          Recurring
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {category && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    )}
                  </TableCell>
                  {viewType === "active" && (
                    <>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {expense.tags.length > 0 ? (
                            expense.tags.slice(0, 2).map((tagId) => {
                              const tag = tags.find((t) => t.id === tagId);
                              if (!tag) return null;
                              return (
                                <Badge
                                  key={tag.id}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag.name}
                                </Badge>
                              );
                            })
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              No tags
                            </span>
                          )}
                          {expense.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{expense.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {paymentMethod?.name || expense.paymentMethod}
                      </TableCell>
                    </>
                  )}
                  {viewType === "deleted" && (
                    <TableCell>
                      {expense.deletedAt &&
                        formatDate(
                          expense.deletedAt,
                          settings?.locale || "en-US",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                    </TableCell>
                  )}
                  <TableCell className="text-right font-medium">
                    {formatCurrency(
                      expense.amount,
                      expense.currency || settings?.currency || "USD",
                      settings?.locale || "en-US",
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {viewType === "active" && (
                          <>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        {viewType === "deleted" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleRestoreExpense(expense.id)}
                            >
                              <RefreshCcw className="mr-2 h-4 w-4" />
                              <span>Restore</span>
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete Permanently</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you absolutely sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the expense and remove it
                                    from our database.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() =>
                                      handlePermanentDelete(expense.id)
                                    }
                                  >
                                    Delete Permanently
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={viewType === "active" ? 7 : 6}
                className="h-24 text-center"
              >
                No expenses found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  },
);
const ExpenseFilters = React.memo(
  ({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedPayment,
    setSelectedPayment,
    selectedDate,
    setSelectedDate,
    categories,
    paymentMethods,
    clearFilters,
  }) => {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search expenses..."
            className="pl-8 w-full sm:w-[200px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>{" "}
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={selectedDate ? "default" : "outline"}
                className={cn(
                  "justify-start text-left font-normal",
                  selectedDate && "text-primary-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>{" "}
          <Select
            value={selectedCategory || ""}
            onValueChange={(value) => setSelectedCategory(value || null)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              {categories
                .filter((category) => !category.parentId)
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>{" "}
          <Select
            value={selectedPayment || ""}
            onValueChange={(value) => setSelectedPayment(value || null)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-methods">All Methods</SelectItem>
              {paymentMethods.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>{" "}
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            title="Clear filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  },
);
export default function Expenses() {
  const [searchParams] = useSearchParams();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewType, setViewType] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [
          allExpenses,
          allCategories,
          allTags,
          allPaymentMethods,
          appSettings,
        ] = await Promise.all([
          db.getAllExpenses(),
          db.getAllCategories(),
          db.getAllTags(),
          db.getAllPaymentMethods(),
          db.getSettings(),
        ]);
        setExpenses(allExpenses);
        setCategories(allCategories);
        setTags(allTags);
        setPaymentMethods(allPaymentMethods);
        setSettings(appSettings || null);
        const categoryParam = searchParams.get("category");
        if (categoryParam) {
          setSelectedCategory(categoryParam);
        }
      } catch (error) {
        console.error("Error loading expense data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [searchParams]);
  const filteredExpenses = React.useMemo(() => {
    return expenses
      .filter((expense) => {
        if (viewType === "active" && expense.deletedAt) return false;
        if (viewType === "deleted" && !expense.deletedAt) return false;
        if (
          searchQuery &&
          !expense.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        if (selectedCategory && expense?.categoryId !== selectedCategory) {
          return false;
        }
        if (selectedPayment && expense.paymentMethod !== selectedPayment) {
          return false;
        }
        if (selectedDate) {
          const expenseDate = new Date(expense.date);
          const selected = new Date(selectedDate);
          if (
            expenseDate.getDate() !== selected.getDate() ||
            expenseDate.getMonth() !== selected.getMonth() ||
            expenseDate.getFullYear() !== selected.getFullYear()
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [
    expenses,
    viewType,
    searchQuery,
    selectedCategory,
    selectedPayment,
    selectedDate,
  ]);
  const handleDeleteExpense = async (id) => {
    try {
      await db.deleteExpense(id, true);
      setExpenses(
        expenses.map((expense) =>
          expense.id === id ? { ...expense, deletedAt: new Date() } : expense,
        ),
      );
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };
  const handleRestoreExpense = async (id) => {
    try {
      await db.restoreExpense(id);
      setExpenses(
        expenses.map((expense) =>
          expense.id === id ? { ...expense, deletedAt: undefined } : expense,
        ),
      );
    } catch (error) {
      console.error("Error restoring expense:", error);
    }
  };
  const handlePermanentDelete = async (id) => {
    try {
      await db.deleteExpense(id, false);
      setExpenses(expenses.filter((expense) => expense.id !== id));
    } catch (error) {
      console.error("Error permanently deleting expense:", error);
    }
  };
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedPayment(null);
    setSelectedDate(null);
  };
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Manage and track your expense transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              console.log("Add expense");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                <span>Export</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="mr-2 h-4 w-4" />
                <span>Import</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>{" "}
      <Tabs
        defaultValue="active"
        className="w-full"
        value={viewType}
        onValueChange={setViewType}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="deleted">Deleted</TabsTrigger>
          </TabsList>{" "}
          <ExpenseFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedPayment={selectedPayment}
            setSelectedPayment={setSelectedPayment}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            categories={categories}
            paymentMethods={paymentMethods}
            clearFilters={clearFilters}
          />
        </div>{" "}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <ExpenseTable
                expenses={filteredExpenses}
                categories={categories}
                tags={tags}
                paymentMethods={paymentMethods}
                settings={settings}
                viewType={viewType}
                handleDeleteExpense={handleDeleteExpense}
                handleRestoreExpense={handleRestoreExpense}
                handlePermanentDelete={handlePermanentDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>{" "}
        <TabsContent value="deleted" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <ExpenseTable
                expenses={filteredExpenses}
                categories={categories}
                tags={tags}
                paymentMethods={paymentMethods}
                settings={settings}
                viewType={viewType}
                handleDeleteExpense={handleDeleteExpense}
                handleRestoreExpense={handleRestoreExpense}
                handlePermanentDelete={handlePermanentDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

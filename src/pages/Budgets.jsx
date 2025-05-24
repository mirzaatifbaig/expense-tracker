import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
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
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [allBudgets, allCategories, allExpenses, appSettings] =
          await Promise.all([
            db.getAllBudgets(),
            db.getAllCategories(),
            db.getAllExpenses(),
            db.getSettings(),
          ]);
        setBudgets(allBudgets);
        setCategories(allCategories);
        setExpenses(allExpenses.filter((expense) => !expense.deletedAt));
        setSettings(appSettings || null);
      } catch (error) {
        console.error("Error loading budget data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  const handleDeleteBudget = async (id) => {
    try {
      await db.deleteBudget(id);
      setBudgets(budgets.filter((budget) => budget.id !== id));
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };
  const getBudgetProgress = (budgetsToProcess) => {
    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      if (period === "weekly" && expenseDate >= startOfWeek) {
        return true;
      } else if (period === "monthly" && expenseDate >= startOfMonth) {
        return true;
      } else if (period === "yearly" && expenseDate >= startOfYear) {
        return true;
      }
      return false;
    });
    return budgetsToProcess
      .filter((budget) => budget.period === period)
      .map((budget) => {
        const category = categories.find((cat) => cat.id === budget.categoryId);
        if (!category) {
          return null;
        }
        const subcategoryIds = categories
          .filter((cat) => cat.parentId === budget.categoryId)
          .map((cat) => cat.id);
        const spent = filteredExpenses
          .filter(
            (expense) =>
              expense.categoryId === budget.categoryId ||
              subcategoryIds.includes(expense.categoryId),
          )
          .reduce((total, expense) => total + expense.amount, 0);
        const remaining = Math.max(budget.amount - spent, 0);
        const progress = (spent / budget.amount) * 100;
        let status;
        if (progress >= 100) {
          status = "over";
        } else if (progress >= 75) {
          status = "warning";
        } else {
          status = "under";
        }
        return {
          ...budget,
          category,
          spent,
          remaining,
          progress,
          status,
        };
      })
      .filter(Boolean);
  };
  const budgetsWithProgress = getBudgetProgress(budgets);
  const totalBudget = budgetsWithProgress.reduce(
    (total, budget) => total + budget.amount,
    0,
  );
  const totalSpent = budgetsWithProgress.reduce(
    (total, budget) => total + budget.spent,
    0,
  );
  const totalProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const underBudget = budgetsWithProgress.filter(
    (budget) => budget.status === "under",
  );
  const warningBudget = budgetsWithProgress.filter(
    (budget) => budget.status === "warning",
  );
  const overBudget = budgetsWithProgress.filter(
    (budget) => budget.status === "over",
  );
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Set and track your spending limits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(value) => setPeriod(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Budget Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              console.log("Add budget");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </div>
      </div>{" "}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Overall Budget</CardTitle>
          <CardDescription>
            Your total {period} budget across all categories
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="grid gap-1">
              <p className="text-sm font-medium">
                {formatCurrency(
                  totalSpent,
                  settings?.currency || "USD",
                  settings?.locale || "en-US",
                )}{" "}
                <span className="text-muted-foreground">of</span>{" "}
                {formatCurrency(
                  totalBudget,
                  settings?.currency || "USD",
                  settings?.locale || "en-US",
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {totalProgress > 100
                  ? `${(totalProgress - 100).toFixed(1)}% over budget`
                  : `${(100 - totalProgress).toFixed(1)}% remaining`}
              </p>
            </div>
            <p className="text-sm font-medium">{totalProgress.toFixed(0)}%</p>
          </div>
          <Progress
            value={totalProgress}
            className={cn(
              "h-2",
              totalProgress >= 100 ? "bg-destructive/20" : "bg-primary/20",
            )}
            indicatorClassName={cn(
              totalProgress >= 100
                ? "bg-destructive"
                : totalProgress >= 75
                  ? "bg-amber-500"
                  : "bg-primary",
            )}
          />
        </CardContent>
      </Card>{" "}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Under Budget</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{underBudget.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                (underBudget.length / budgetsWithProgress.length) * 100 || 0
              ).toFixed(0)}
              % of budgets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Near Limit</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningBudget.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                (warningBudget.length / budgetsWithProgress.length) * 100 || 0
              ).toFixed(0)}
              % of budgets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Over Budget</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overBudget.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                (overBudget.length / budgetsWithProgress.length) * 100 || 0
              ).toFixed(0)}
              % of budgets
            </p>
          </CardContent>
        </Card>
      </div>{" "}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Budgets</TabsTrigger>
          <TabsTrigger value="over">Over Budget</TabsTrigger>
          <TabsTrigger value="warning">Near Limit</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetsWithProgress.length > 0 ? (
                    budgetsWithProgress.map((budget) => (
                      <TableRow key={budget.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: budget.category.color }}
                            />
                            <span>{budget.category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            budget.amount,
                            settings?.currency || "USD",
                            settings?.locale || "en-US",
                          )}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            budget.spent,
                            settings?.currency || "USD",
                            settings?.locale || "en-US",
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              budget.status === "over" ? "text-destructive" : ""
                            }
                          >
                            {budget.status === "over"
                              ? "-" +
                                formatCurrency(
                                  budget.spent - budget.amount,
                                  settings?.currency || "USD",
                                  settings?.locale || "en-US",
                                )
                              : formatCurrency(
                                  budget.remaining,
                                  settings?.currency || "USD",
                                  settings?.locale || "en-US",
                                )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">
                                {budget.progress.toFixed(0)}%
                              </span>
                              {budget.status === "warning" && (
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                              )}
                              {budget.status === "over" && (
                                <AlertCircle className="h-3 w-3 text-destructive" />
                              )}
                            </div>
                            <Progress
                              value={budget.progress}
                              className={cn(
                                "h-2",
                                budget.status === "over"
                                  ? "bg-destructive/20"
                                  : "bg-primary/20",
                              )}
                              indicatorClassName={cn(
                                budget.status === "over"
                                  ? "bg-destructive"
                                  : budget.status === "warning"
                                    ? "bg-amber-500"
                                    : "bg-primary",
                              )}
                            />
                          </div>
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
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteBudget(budget.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No {period} budgets found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="over">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Overspent</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overBudget.length > 0 ? (
                    overBudget.map((budget) => (
                      <TableRow key={budget.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: budget.category.color }}
                            />
                            <span>{budget.category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            budget.amount,
                            settings?.currency || "USD",
                            settings?.locale || "en-US",
                          )}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            budget.spent,
                            settings?.currency || "USD",
                            settings?.locale || "en-US",
                          )}
                        </TableCell>
                        <TableCell className="text-destructive">
                          {formatCurrency(
                            budget.spent - budget.amount,
                            settings?.currency || "USD",
                            settings?.locale || "en-US",
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">
                                {budget.progress.toFixed(0)}%
                              </span>
                              <AlertCircle className="h-3 w-3 text-destructive" />
                            </div>
                            <Progress
                              value={100}
                              className="h-2 bg-destructive/20"
                              indicatorClassName="bg-destructive"
                            />
                          </div>
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
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteBudget(budget.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No over-budget items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="warning">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warningBudget.length > 0 ? (
                    warningBudget.map((budget) => (
                      <TableRow key={budget.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: budget.category.color }}
                            />
                            <span>{budget.category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            budget.amount,
                            settings?.currency || "USD",
                            settings?.locale || "en-US",
                          )}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            budget.spent,
                            settings?.currency || "USD",
                            settings?.locale || "en-US",
                          )}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            budget.remaining,
                            settings?.currency || "USD",
                            settings?.locale || "en-US",
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">
                                {budget.progress.toFixed(0)}%
                              </span>
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                            </div>
                            <Progress
                              value={budget.progress}
                              className="h-2 bg-primary/20"
                              indicatorClassName="bg-amber-500"
                            />
                          </div>
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
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteBudget(budget.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No near-limit budget items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {db} from "@/lib/db";
import {formatCurrency} from "@/lib/format";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {ArrowDownCircleIcon, ArrowUpCircleIcon, CalendarIcon, WalletIcon,} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {SkeletonCard} from "@/components/ui/skeleton";

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [settings, setSettings] = useState(null);
  const [timeframe, setTimeframe] = useState("month");
  const [isLoading, setIsLoading] = useState(true);
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisWeek = new Date(now);
  thisWeek.setDate(now.getDate() - now.getDay());
  const thisYear = new Date(now.getFullYear(), 0, 1);
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [allExpenses, allCategories, allBudgets, appSettings] =
          await Promise.all([
            db.getAllExpenses(),
            db.getAllCategories(),
            db.getAllBudgets(),
            db.getSettings(),
          ]);
        const activeExpenses = allExpenses.filter((exp) => !exp.deletedAt);
        setExpenses(activeExpenses);
        setCategories(allCategories);
        setBudgets(allBudgets);
        setSettings(appSettings || null);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    if (timeframe === "week") {
      return expenseDate >= thisWeek;
    } else if (timeframe === "month") {
      return expenseDate >= thisMonth;
    } else if (timeframe === "year") {
      return expenseDate >= thisYear;
    }
    return true;
  });
  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const totalBudget = budgets
    .filter((budget) => {
      if (timeframe === "week" && budget.period === "weekly") return true;
      if (timeframe === "month" && budget.period === "monthly") return true;
      return timeframe === "year" && budget.period === "yearly";
    })
    .reduce((sum, budget) => sum + budget.amount, 0);
  const expensesByCategory = categories
    .map((category) => {
      const amount = filteredExpenses
        .filter((expense) => expense.categoryId === category.id)
        .reduce((sum, expense) => sum + expense.amount, 0);
      return {
        name: category.name,
        value: amount,
        color: category.color,
        id: category.id,
      };
    })
    .filter((category) => category.value > 0)
    .sort((a, b) => b.value - a.value);
  const topCategories = [...expensesByCategory].slice(0, 5);
  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getTimeSeriesData = () => {
    if (timeframe === "week") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days.map((day, index) => {
        const dayStart = new Date(thisWeek);
        dayStart.setDate(thisWeek.getDate() + index);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        const dayExpenses = filteredExpenses.filter((expense) => {
          const expDate = new Date(expense.date);
          return expDate >= dayStart && expDate <= dayEnd;
        });
        const amount = dayExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0,
        );
        return {
          name: day,
          amount: amount,
        };
      });
    } else if (timeframe === "month") {
      const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
      const daysInMonth = getDaysInMonth(now.getFullYear(), now.getMonth());
      return weeks
        .map((week, index) => {
          const weekStart = new Date(thisMonth);
          weekStart.setDate(1 + index * 7);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          if (weekEnd.getMonth() !== thisMonth.getMonth()) {
            weekEnd.setMonth(thisMonth.getMonth());
            weekEnd.setDate(daysInMonth);
          }
          const weekExpenses = filteredExpenses.filter((expense) => {
            const expDate = new Date(expense.date);
            return expDate >= weekStart && expDate <= weekEnd;
          });
          const amount = weekExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0,
          );
          if (weekStart > now) {
            return null;
          }
          return {
            name: `W${index + 1}`,
            amount: amount,
          };
        })
        .filter(Boolean);
    } else if (timeframe === "year") {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months
        .map((month, index) => {
          const monthStart = new Date(now.getFullYear(), index, 1);
          const monthEnd = new Date(now.getFullYear(), index + 1, 0);
          const monthExpenses = filteredExpenses.filter((expense) => {
            const expDate = new Date(expense.date);
            return expDate >= monthStart && expDate <= monthEnd;
          });
          const amount = monthExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0,
          );
          if (monthStart > now) {
            return null;
          }
          return {
            name: month,
            amount: amount,
          };
        })
        .filter(Boolean);
    }
    return [];
  };
  const timeSeriesData = getTimeSeriesData();
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <div className="md:col-span-2 lg:col-span-3">
          <SkeletonCard className="h-[400px]" />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your expenses and stay on budget
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <Select
            defaultValue={timeframe}
            onValueChange={(value) => setTimeframe(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              console.log("Add expense");
            }}
          >
            Add Expense
          </Button>
        </div>
      </div>{" "}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                totalExpenses,
                settings?.currency || "USD",
                settings?.locale || "en-US",
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {timeframe === "week"
                ? "This week"
                : timeframe === "month"
                  ? "This month"
                  : "This year"}
            </p>
            {totalBudget > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Budget</span>
                  <span>
                    {formatCurrency(
                      totalBudget,
                      settings?.currency || "USD",
                      settings?.locale || "en-US",
                    )}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${totalExpenses > totalBudget ? "bg-destructive" : "bg-primary"}`}
                    style={{
                      width: `${Math.min((totalExpenses / totalBudget) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Income vs Expenses
            </CardTitle>
            <div className="flex items-center gap-1">
              <ArrowUpCircleIcon className="h-4 w-4 text-emerald-500" />
              <ArrowDownCircleIcon className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                0,
                settings?.currency || "USD",
                settings?.locale || "en-US",
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Net balance for{" "}
              {timeframe === "week"
                ? "this week"
                : timeframe === "month"
                  ? "this month"
                  : "this year"}
            </p>
            <div className="mt-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="flex items-center">
                    <ArrowUpCircleIcon className="h-3 w-3 mr-1 text-emerald-500" />
                    <span>Income</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(
                      0,
                      settings?.currency || "USD",
                      settings?.locale || "en-US",
                    )}
                  </span>
                </div>
                <div>
                  <div className="flex items-center">
                    <ArrowDownCircleIcon className="h-3 w-3 mr-1 text-destructive" />
                    <span>Expenses</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(
                      totalExpenses,
                      settings?.currency || "USD",
                      settings?.locale || "en-US",
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Categories
            </CardTitle>
            <ArrowDownCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topCategories.length > 0 ? (
                topCategories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <div
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-xs">{category.name}</span>
                      <span className="text-xs font-medium">
                        {formatCurrency(
                          category.value,
                          settings?.currency || "USD",
                          settings?.locale || "en-US",
                        )}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No expenses yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>{" "}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Trends</CardTitle>
              <CardDescription>
                Your spending over{" "}
                {timeframe === "week"
                  ? "this week"
                  : timeframe === "month"
                    ? "this month"
                    : "this year"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timeSeriesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis
                      className="text-xs"
                      tickFormatter={(value) =>
                        formatCurrency(
                          value,
                          settings?.currency || "USD",
                          settings?.locale || "en-US",
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                            notation: "compact",
                          },
                        )
                      }
                    />
                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(
                          value,
                          settings?.currency || "USD",
                          settings?.locale || "en-US",
                        )
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    No expense data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>
                How your spending is distributed across categories
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="h-[300px] w-full md:w-1/2">
                {expensesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={1}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelLine={false}
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          formatCurrency(
                            value,
                            settings?.currency || "USD",
                            settings?.locale || "en-US",
                          )
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      No expense data available
                    </p>
                  </div>
                )}
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                {expensesByCategory.length > 0 ? (
                  expensesByCategory.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-sm">{category.name}</span>
                        <span className="font-medium">
                          {formatCurrency(
                            category.value,
                            settings?.currency || "USD",
                            settings?.locale || "en-US",
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No categories with expenses
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>
                Compare your spending month by month
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeSeriesData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) =>
                      formatCurrency(
                        value,
                        settings?.currency || "USD",
                        settings?.locale || "en-US",
                        {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                          notation: "compact",
                        },
                      )
                    }
                  />
                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(
                        value,
                        settings?.currency || "USD",
                        settings?.locale || "en-US",
                      )
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="amount"
                    name="Expenses"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

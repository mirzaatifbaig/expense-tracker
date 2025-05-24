import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {db} from "@/lib/db";
import {formatCurrency, formatDate} from "@/lib/format";
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
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {CalendarIcon, Download, TrendingDown, TrendingUp} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {endOfMonth, endOfYear, format, isWithinInterval, startOfMonth, startOfYear, subDays,} from "date-fns";
import {Skeleton} from "@/components/ui/skeleton";

export default function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("30days");
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [allExpenses, allCategories, appSettings] = await Promise.all([
          db.getAllExpenses(),
          db.getAllCategories(),
          db.getSettings(),
        ]);
        const activeExpenses = allExpenses.filter((exp) => !exp.deletedAt);
        setExpenses(activeExpenses);
        setCategories(allCategories);
        setSettings(appSettings || null);
      } catch (error) {
        console.error("Error loading report data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  useEffect(() => {
    const now = new Date();
    if (timeframe === "7days") {
      setDateRange({
        from: subDays(now, 6),
        to: now,
      });
    } else if (timeframe === "30days") {
      setDateRange({
        from: subDays(now, 29),
        to: now,
      });
    } else if (timeframe === "month") {
      setDateRange({
        from: startOfMonth(now),
        to: endOfMonth(now),
      });
    } else if (timeframe === "year") {
      setDateRange({
        from: startOfYear(now),
        to: endOfYear(now),
      });
    }
  }, [timeframe]);
  const filteredExpenses = expenses.filter((expense) => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const expenseDate = new Date(expense.date);
    return isWithinInterval(expenseDate, {
      start: dateRange.from,
      end: dateRange.to,
    });
  });
  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const categoryData = categories
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
  const createTimeSeriesData = () => {
    if (!dateRange?.from || !dateRange?.to) return [];
    const diffTime = dateRange.to.getTime() - dateRange.from.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays <= 31) {
      const dailyData = [];
      for (let i = 0; i < diffDays; i++) {
        const currentDate = new Date(dateRange.from);
        currentDate.setDate(dateRange.from.getDate() + i);
        const dayExpenses = filteredExpenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          return (
            expenseDate.getDate() === currentDate.getDate() &&
            expenseDate.getMonth() === currentDate.getMonth() &&
            expenseDate.getFullYear() === currentDate.getFullYear()
          );
        });
        const amount = dayExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0,
        );
        dailyData.push({
          date: format(currentDate, "MMM dd"),
          amount,
        });
      }
      return dailyData;
    } else if (diffDays <= 90) {
      const weeklyData = [];
      let weekStart = new Date(dateRange.from);
      let weekNumber = 1;
      while (weekStart <= dateRange.to) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        if (weekEnd > dateRange.to) {
          weekEnd.setTime(dateRange.to.getTime());
        }
        const weekExpenses = filteredExpenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= weekStart && expenseDate <= weekEnd;
        });
        const amount = weekExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0,
        );
        weeklyData.push({
          date: `W${weekNumber}`,
          amount,
          tooltip: `${format(weekStart, "MMM dd")} - ${format(weekEnd, "MMM dd")}`,
        });
        weekStart.setDate(weekStart.getDate() + 7);
        weekNumber++;
      }
      return weeklyData;
    } else {
      const monthlyData = [];
      let currentMonth = new Date(
        dateRange.from.getFullYear(),
        dateRange.from.getMonth(),
        1,
      );
      while (currentMonth <= dateRange.to) {
        const monthEnd = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          0,
        );
        const monthExpenses = filteredExpenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          return (
            expenseDate.getMonth() === currentMonth.getMonth() &&
            expenseDate.getFullYear() === currentMonth.getFullYear()
          );
        });
        const amount = monthExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0,
        );
        monthlyData.push({
          date: format(currentMonth, "MMM yy"),
          amount,
        });
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
      return monthlyData;
    }
  };
  const timeSeriesData = createTimeSeriesData();
  const currencyFormatter = (value) =>
    formatCurrency(
      value,
      settings?.currency || "USD",
      settings?.locale || "en-US",
    );
  const getPreviousPeriodData = () => {
    if (!dateRange?.from || !dateRange?.to)
      return { current: 0, previous: 0, change: 0 };
    const currentTotal = filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const currentDuration = dateRange.to.getTime() - dateRange.from.getTime();
    const previousPeriodStart = new Date(
      dateRange.from.getTime() - currentDuration,
    );
    const previousPeriodEnd = new Date(dateRange.from.getTime() - 1);
    const previousPeriodExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate >= previousPeriodStart && expenseDate <= previousPeriodEnd
      );
    });
    const previousTotal = previousPeriodExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const change =
      previousTotal === 0
        ? 100
        : ((currentTotal - previousTotal) / previousTotal) * 100;
    return {
      current: currentTotal,
      previous: previousTotal,
      change,
    };
  };
  const comparisonData = getPreviousPeriodData();
  const getAveragePerDay = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const diffTime = dateRange.to.getTime() - dateRange.from.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return totalAmount / diffDays;
  };
  const averagePerDay = getAveragePerDay();
  const exportDataToCSV = () => {
    if (filteredExpenses.length === 0) return;
    const headers = [
      "Date",
      "Amount",
      "Category",
      "Description",
      "Payment Method",
      "Tags",
    ];
    const rows = filteredExpenses.map((expense) => {
      const category =
        categories.find((cat) => cat.id === expense.categoryId)?.name || "";
      const formattedDate = formatDate(
        expense.date,
        settings?.locale || "en-US",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        },
      );
      return [
        formattedDate,
        expense.amount,
        category,
        expense.description || "",
        expense.paymentMethod,
        expense.tags.join(", "),
      ];
    });
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `expense-report-${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
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
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analyze and export your spending data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={timeframe}
            onValueChange={(value) => setTimeframe(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>{" "}
          {timeframe === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}{" "}
          <Button
            variant="outline"
            onClick={exportDataToCSV}
            disabled={filteredExpenses.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>{" "}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                totalAmount,
                settings?.currency || "USD",
                settings?.locale || "en-US",
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dateRange?.from && dateRange?.to
                ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
                : "All time"}
            </p>
            <div className="flex items-center mt-3">
              <div
                className={cn(
                  "mr-2 rounded-full p-1",
                  comparisonData.change > 0
                    ? "bg-destructive/20 text-destructive"
                    : "bg-green-500/20 text-green-500",
                )}
              >
                {comparisonData.change > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </div>
              <span className="text-sm">
                {comparisonData.change > 0 ? "+" : ""}
                {comparisonData.change.toFixed(0)}% from previous period
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base">Average Per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                averagePerDay,
                settings?.currency || "USD",
                settings?.locale || "en-US",
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dateRange?.from && dateRange?.to
                ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                : "All time"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <>
                <div className="text-2xl font-bold">{categoryData[0].name}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(
                    categoryData[0].value,
                    settings?.currency || "USD",
                    settings?.locale || "en-US",
                  )}{" "}
                  ({((categoryData[0].value / totalAmount) * 100).toFixed(0)}%
                  of total)
                </p>
                <div
                  className="w-full h-2 rounded-full mt-3"
                  style={{ backgroundColor: categoryData[0].color + "40" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(categoryData[0].value / totalAmount) * 100}%`,
                      backgroundColor: categoryData[0].color,
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                No expenses in this period
              </div>
            )}
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
              <CardTitle>Spending Over Time</CardTitle>
              <CardDescription>
                Your expense pattern for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {timeSeriesData.length > 0 ? (
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
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(value) => currencyFormatter(value)}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        currencyFormatter(value),
                        "Amount",
                      ]}
                      labelFormatter={(label, payload) => {
                        if (payload[0]?.payload?.tooltip) {
                          return payload[0].payload.tooltip;
                        }
                        return label;
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      fill="hsl(var(--primary))"
                      name="Expenses"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    No expense data available for this period
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
            <CardContent className="min-h-[350px]">
              {categoryData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={1}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => currencyFormatter(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    {categoryData.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        />
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between">
                            <span>{category.name}</span>
                            <span className="font-medium">
                              {currencyFormatter(category.value)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted mt-1">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(category.value / totalAmount) * 100}%`,
                                backgroundColor: category.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">
                    No expense data available for this period
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>
                View your spending patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
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
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(value) => currencyFormatter(value)}
                    />
                    <Tooltip formatter={(value) => currencyFormatter(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      name="Expenses"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    No expense data available for this period
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

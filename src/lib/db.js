import { openDB } from "idb";
const DB_VERSION = 1;
const DB_NAME = "expense-tracker-db";
class DatabaseService {
  db;
  static instance;
  constructor() {
    this.db = this.initDatabase();
  }
  static getInstance() {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }
  async initDatabase() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("expenses")) {
          const expenseStore = db.createObjectStore("expenses", {
            keyPath: "id",
          });
          expenseStore.createIndex("by-date", "date");
          expenseStore.createIndex("by-category", "categoryId");
          expenseStore.createIndex("by-tags", "tags", { multiEntry: true });
          expenseStore.createIndex("by-payment", "paymentMethod");
          expenseStore.createIndex("by-deleted", "deletedAt");
        }
        if (!db.objectStoreNames.contains("categories")) {
          const categoryStore = db.createObjectStore("categories", {
            keyPath: "id",
          });
          categoryStore.createIndex("by-parent", "parentId");
          categoryStore.createIndex("by-order", "order");
        }
        if (!db.objectStoreNames.contains("tags")) {
          db.createObjectStore("tags", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("budgets")) {
          const budgetStore = db.createObjectStore("budgets", {
            keyPath: "id",
          });
          budgetStore.createIndex("by-category", "categoryId");
          budgetStore.createIndex("by-period", "period");
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("paymentMethods")) {
          db.createObjectStore("paymentMethods", { keyPath: "id" });
        }
        void initializeDefaultData(db);
      },
    });
  }
  async getAllExpenses() {
    return (await this.db).getAll("expenses");
  }
  async getExpense(id) {
    return (await this.db).get("expenses", id);
  }
  async addExpense(expense) {
    const id = crypto.randomUUID();
    const now = new Date();
    const newExpense = {
      ...expense,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await (await this.db).add("expenses", newExpense);
    return id;
  }
  async updateExpense(id, expense) {
    const db = await this.db;
    const existingExpense = await db.get("expenses", id);
    if (!existingExpense) {
      throw new Error(`Expense with id ${id} not found`);
    }
    const updatedExpense = {
      ...existingExpense,
      ...expense,
      updatedAt: new Date(),
    };
    await db.put("expenses", updatedExpense);
  }
  async deleteExpense(id, soft = true) {
    const db = await this.db;
    if (soft) {
      const expense = await db.get("expenses", id);
      if (expense) {
        expense.deletedAt = new Date();
        expense.updatedAt = new Date();
        await db.put("expenses", expense);
      }
    } else {
      await db.delete("expenses", id);
    }
  }
  async restoreExpense(id) {
    const db = await this.db;
    const expense = await db.get("expenses", id);
    if (expense && expense.deletedAt) {
      expense.deletedAt = undefined;
      expense.updatedAt = new Date();
      await db.put("expenses", expense);
    }
  }
  async getAllCategories() {
    return (await this.db).getAll("categories");
  }
  async getCategory(id) {
    return (await this.db).get("categories", id);
  }
  async addCategory(category) {
    const id = crypto.randomUUID();
    const now = new Date();
    const newCategory = {
      ...category,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await (await this.db).add("categories", newCategory);
    return id;
  }
  async updateCategory(id, category) {
    const db = await this.db;
    const existingCategory = await db.get("categories", id);
    if (!existingCategory) {
      throw new Error(`Category with id ${id} not found`);
    }
    const updatedCategory = {
      ...existingCategory,
      ...category,
      updatedAt: new Date(),
    };
    await db.put("categories", updatedCategory);
  }
  async deleteCategory(id) {
    await (await this.db).delete("categories", id);
  }
  async getAllTags() {
    return (await this.db).getAll("tags");
  }
  async getTag(id) {
    return (await this.db).get("tags", id);
  }
  async addTag(tag) {
    const id = crypto.randomUUID();
    const now = new Date();
    const newTag = {
      ...tag,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await (await this.db).add("tags", newTag);
    return id;
  }
  async updateTag(id, tag) {
    const db = await this.db;
    const existingTag = await db.get("tags", id);
    if (!existingTag) {
      throw new Error(`Tag with id ${id} not found`);
    }
    const updatedTag = {
      ...existingTag,
      ...tag,
      updatedAt: new Date(),
    };
    await db.put("tags", updatedTag);
  }
  async deleteTag(id) {
    await (await this.db).delete("tags", id);
  }
  async getAllBudgets() {
    return (await this.db).getAll("budgets");
  }
  async getBudget(id) {
    return (await this.db).get("budgets", id);
  }
  async getBudgetsByCategory(categoryId) {
    return (await this.db).getAllFromIndex(
      "budgets",
      "by-category",
      categoryId,
    );
  }
  async addBudget(budget) {
    const id = crypto.randomUUID();
    const now = new Date();
    const newBudget = {
      ...budget,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await (await this.db).add("budgets", newBudget);
    return id;
  }
  async updateBudget(id, budget) {
    const db = await this.db;
    const existingBudget = await db.get("budgets", id);
    if (!existingBudget) {
      throw new Error(`Budget with id ${id} not found`);
    }
    const updatedBudget = {
      ...existingBudget,
      ...budget,
      updatedAt: new Date(),
    };
    await db.put("budgets", updatedBudget);
  }
  async deleteBudget(id) {
    await (await this.db).delete("budgets", id);
  }
  async getSettings() {
    return (await this.db).get("settings", "app-settings");
  }
  async updateSettings(settings) {
    const db = await this.db;
    const existingSettings = await db.get("settings", "app-settings");
    const updatedSettings = {
      ...(existingSettings || {
        id: "app-settings",
        currency: "USD",
        locale: "en-US",
        defaultPaymentMethod: "cash",
        theme: "system",
        retentionYears: 3,
      }),
      ...settings,
      updatedAt: new Date(),
    };
    await db.put("settings", updatedSettings);
  }
  async getAllPaymentMethods() {
    return (await this.db).getAll("paymentMethods");
  }
  async getPaymentMethod(id) {
    return (await this.db).get("paymentMethods", id);
  }
  async addPaymentMethod(method) {
    const id = crypto.randomUUID();
    const now = new Date();
    const newMethod = {
      ...method,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await (await this.db).add("paymentMethods", newMethod);
    return id;
  }
  async updatePaymentMethod(id, method) {
    const db = await this.db;
    const existingMethod = await db.get("paymentMethods", id);
    if (!existingMethod) {
      throw new Error(`Payment method with id ${id} not found`);
    }
    const updatedMethod = {
      ...existingMethod,
      ...method,
      updatedAt: new Date(),
    };
    await db.put("paymentMethods", updatedMethod);
  }
  async deletePaymentMethod(id) {
    await (await this.db).delete("paymentMethods", id);
  }
}
async function initializeDefaultData(db) {
  const defaultSettings = {
    id: "app-settings",
    currency: "USD",
    locale: "en-US",
    defaultPaymentMethod: "cash",
    theme: "system",
    retentionYears: 3,
    updatedAt: new Date(),
  };
  await db.put("settings", defaultSettings);
  const paymentMethods = [
    {
      id: "cash",
      name: "Cash",
      icon: "banknote",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "credit",
      name: "Credit Card",
      icon: "credit-card",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "debit",
      name: "Debit Card",
      icon: "credit-card",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: "building-bank",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  for (const method of paymentMethods) {
    await db.put("paymentMethods", method);
  }
  const categories = [
    {
      id: "food",
      name: "Food & Dining",
      color: "#FF5722",
      icon: "utensils",
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "groceries",
      name: "Groceries",
      parentId: "food",
      color: "#FF7043",
      icon: "shopping-cart",
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "restaurants",
      name: "Restaurants",
      parentId: "food",
      color: "#FF8A65",
      icon: "cookie",
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "housing",
      name: "Housing",
      color: "#03A9F4",
      icon: "home",
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "rent",
      name: "Rent/Mortgage",
      parentId: "housing",
      color: "#29B6F6",
      icon: "building",
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "utilities",
      name: "Utilities",
      parentId: "housing",
      color: "#4FC3F7",
      icon: "lightbulb",
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "transportation",
      name: "Transportation",
      color: "#4CAF50",
      icon: "car",
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "entertainment",
      name: "Entertainment",
      color: "#9C27B0",
      icon: "film",
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "healthcare",
      name: "Healthcare",
      color: "#F44336",
      icon: "heart-pulse",
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "shopping",
      name: "Shopping",
      color: "#E91E63",
      icon: "shopping-bag",
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "personal",
      name: "Personal Care",
      color: "#673AB7",
      icon: "smile",
      order: 6,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "education",
      name: "Education",
      color: "#00BCD4",
      icon: "graduation-cap",
      order: 7,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "gifts",
      name: "Gifts & Donations",
      color: "#CDDC39",
      icon: "gift",
      order: 8,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "travel",
      name: "Travel",
      color: "#FFC107",
      icon: "plane",
      order: 9,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "income",
      name: "Income",
      color: "#8BC34A",
      icon: "trending-up",
      order: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  for (const category of categories) {
    await db.put("categories", category);
  }
  const tags = [
    {
      id: "essential",
      name: "Essential",
      color: "#4CAF50",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "work",
      name: "Work",
      color: "#2196F3",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "personal",
      name: "Personal",
      color: "#9C27B0",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "discretionary",
      name: "Discretionary",
      color: "#FF9800",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "subscription",
      name: "Subscription",
      color: "#F44336",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  for (const tag of tags) {
    await db.put("tags", tag);
  }
}
export const db = DatabaseService.getInstance();

export interface FoodSearchAlias {
  query: string;
  displayName: string;
}

const aliasEntries: Array<[string, FoodSearchAlias]> = [
  ["米饭", { query: "rice cooked", displayName: "白米饭（熟）" }],
  ["白米饭", { query: "rice cooked", displayName: "白米饭（熟）" }],
  ["糙米饭", { query: "brown rice cooked", displayName: "糙米饭（熟）" }],
  ["鸡蛋", { query: "egg boiled", displayName: "鸡蛋（煮）" }],
  ["蛋清", { query: "egg white cooked", displayName: "蛋清（熟）" }],
  ["鸡胸肉", { query: "chicken breast cooked", displayName: "鸡胸肉（熟）" }],
  ["鸡腿肉", { query: "chicken thigh cooked", displayName: "鸡腿肉（熟）" }],
  ["牛肉", { query: "beef cooked", displayName: "牛肉（熟）" }],
  ["猪肉", { query: "pork cooked", displayName: "猪肉（熟）" }],
  ["虾", { query: "shrimp cooked", displayName: "虾（熟）" }],
  ["三文鱼", { query: "salmon cooked", displayName: "三文鱼（熟）" }],
  ["燕麦", { query: "oats", displayName: "燕麦" }],
  ["面条", { query: "noodles cooked", displayName: "面条（熟）" }],
  ["全麦面包", { query: "whole wheat bread", displayName: "全麦面包" }],
  ["土豆", { query: "potato cooked", displayName: "土豆（熟）" }],
  ["红薯", { query: "sweet potato cooked", displayName: "红薯（熟）" }],
  ["玉米", { query: "sweet corn cooked", displayName: "玉米（熟）" }],
  ["牛奶", { query: "milk", displayName: "牛奶" }],
  ["酸奶", { query: "yogurt plain", displayName: "原味酸奶" }],
  ["奶酪", { query: "cheese", displayName: "奶酪" }],
  ["花生", { query: "peanuts", displayName: "花生" }],
  ["杏仁", { query: "almonds", displayName: "杏仁" }],
  ["蛋白粉", { query: "protein powder", displayName: "蛋白粉" }],
  ["西兰花", { query: "broccoli cooked", displayName: "西兰花（熟）" }],
  ["菠菜", { query: "spinach cooked", displayName: "菠菜（熟）" }],
  ["香蕉", { query: "banana", displayName: "香蕉" }],
  ["苹果", { query: "apple with skin", displayName: "苹果" }],
];

const aliasMap = new Map(aliasEntries);

export function resolveFoodSearchAlias(value: string): FoodSearchAlias {
  const normalized = value.trim().toLowerCase();
  return aliasMap.get(normalized) ?? { query: value.trim(), displayName: value.trim() };
}

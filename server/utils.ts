import bcrypt from "bcrypt";

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Compare a password with a hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate a random string
export function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Format a date
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// Format a file size
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Validate an email address
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate a phone number
export function validatePhoneNumber(phone: string): boolean {
  const re = /^\+?[1-9]\d{1,14}$/;
  return re.test(phone);
}

// Validate a password
export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
}

// Sanitize a string for HTML
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Truncate a string
export function truncateString(str: string, length: number): string {
  if (str.length <= length) {
    return str;
  }
  return str.slice(0, length) + "...";
}

// Generate a slug from a string
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Parse a query string
export function parseQueryString(query: string): Record<string, string> {
  const params = new URLSearchParams(query);
  const result: Record<string, string> = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
}

// Build a query string
export function buildQueryString(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

// Debounce a function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle a function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Deep clone an object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Check if an object is empty
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

// Get a random item from an array
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Shuffle an array
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Group an array by a key
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// Sort an array by a key
export function sortBy<T>(array: T[], key: keyof T, direction: "asc" | "desc" = "asc"): T[] {
  return [...array].sort((a, b) => {
    if (direction === "asc") {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
}

// Filter an array by a predicate
export function filterBy<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}

// Map an array by a function
export function mapBy<T, U>(array: T[], fn: (item: T) => U): U[] {
  return array.map(fn);
}

// Reduce an array by a function
export function reduceBy<T, U>(array: T[], fn: (acc: U, item: T) => U, initialValue: U): U {
  return array.reduce(fn, initialValue);
}

// Find an item in an array by a predicate
export function findBy<T>(array: T[], predicate: (item: T) => boolean): T | undefined {
  return array.find(predicate);
}

// Check if all items in an array satisfy a predicate
export function every<T>(array: T[], predicate: (item: T) => boolean): boolean {
  return array.every(predicate);
}

// Check if some items in an array satisfy a predicate
export function some<T>(array: T[], predicate: (item: T) => boolean): boolean {
  return array.some(predicate);
}

// Check if an array includes an item
export function includes<T>(array: T[], item: T): boolean {
  return array.includes(item);
}

// Get the first item in an array
export function first<T>(array: T[]): T | undefined {
  return array[0];
}

// Get the last item in an array
export function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

// Get a slice of an array
export function slice<T>(array: T[], start: number, end?: number): T[] {
  return array.slice(start, end);
}

// Get a chunk of an array
export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// Get unique items in an array
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// Get the intersection of two arrays
export function intersection<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => array2.includes(item));
}

// Get the difference of two arrays
export function difference<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => !array2.includes(item));
}

// Get the union of two arrays
export function union<T>(array1: T[], array2: T[]): T[] {
  return [...new Set([...array1, ...array2])];
}

// Get the symmetric difference of two arrays
export function symmetricDifference<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => !array2.includes(item))
    .concat(array2.filter(item => !array1.includes(item)));
}

// Get the cartesian product of two arrays
export function cartesianProduct<T, U>(array1: T[], array2: U[]): [T, U][] {
  return array1.flatMap(item1 => array2.map(item2 => [item1, item2] as [T, U]));
}

// Get the power set of an array
export function powerSet<T>(array: T[]): T[][] {
  const result: T[][] = [[]];
  for (const item of array) {
    const currentLength = result.length;
    for (let i = 0; i < currentLength; i++) {
      result.push([...result[i], item]);
    }
  }
  return result;
}

// Get the permutations of an array
export function permutations<T>(array: T[]): T[][] {
  if (array.length <= 1) {
    return [array];
  }
  
  const result: T[][] = [];
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    const rest = array.slice(0, i).concat(array.slice(i + 1));
    const perms = permutations(rest);
    for (const perm of perms) {
      result.push([item, ...perm]);
    }
  }
  return result;
}

// Get the combinations of an array
export function combinations<T>(array: T[], size: number): T[][] {
  if (size <= 0) {
    return [[]];
  }
  
  if (array.length < size) {
    return [];
  }
  
  const result: T[][] = [];
  for (let i = 0; i <= array.length - size; i++) {
    const item = array[i];
    const rest = array.slice(i + 1);
    const combs = combinations(rest, size - 1);
    for (const comb of combs) {
      result.push([item, ...comb]);
    }
  }
  return result;
}

// Get the combinations with repetition of an array
export function combinationsWithRepetition<T>(array: T[], size: number): T[][] {
  if (size <= 0) {
    return [[]];
  }
  
  const result: T[][] = [];
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    const rest = array.slice(i);
    const combs = combinationsWithRepetition(rest, size - 1);
    for (const comb of combs) {
      result.push([item, ...comb]);
    }
  }
  return result;
}

// Get the permutations with repetition of an array
export function permutationsWithRepetition<T>(array: T[], size: number): T[][] {
  if (size <= 0) {
    return [[]];
  }
  
  const result: T[][] = [];
  for (const item of array) {
    const perms = permutationsWithRepetition(array, size - 1);
    for (const perm of perms) {
      result.push([item, ...perm]);
    }
  }
  return result;
}

// Get the combinations of an array with a predicate
export function combinationsWithPredicate<T>(
  array: T[], 
  size: number, 
  predicate: (items: T[]) => boolean
): T[][] {
  return combinations(array, size).filter(predicate);
}

// Get the permutations of an array with a predicate
export function permutationsWithPredicate<T>(
  array: T[], 
  predicate: (items: T[]) => boolean
): T[][] {
  return permutations(array).filter(predicate);
}

// Get the combinations with repetition of an array with a predicate
export function combinationsWithRepetitionWithPredicate<T>(
  array: T[], 
  size: number, 
  predicate: (items: T[]) => boolean
): T[][] {
  return combinationsWithRepetition(array, size).filter(predicate);
}

// Get the permutations with repetition of an array with a predicate
export function permutationsWithRepetitionWithPredicate<T>(
  array: T[], 
  size: number, 
  predicate: (items: T[]) => boolean
): T[][] {
  return permutationsWithRepetition(array, size).filter(predicate);
}

// Get the combinations of an array with a key
export function combinationsBy<T, U>(
  array: T[], 
  size: number, 
  key: (item: T) => U
): U[][] {
  return combinations(array, size).map(items => items.map(key));
}

// Get the permutations of an array with a key
export function permutationsBy<T, U>(
  array: T[], 
  key: (item: T) => U
): U[][] {
  return permutations(array).map(items => items.map(key));
}

// Get the combinations with repetition of an array with a key
export function combinationsWithRepetitionBy<T, U>(
  array: T[], 
  size: number, 
  key: (item: T) => U
): U[][] {
  return combinationsWithRepetition(array, size).map(items => items.map(key));
}

// Get the permutations with repetition of an array with a key
export function permutationsWithRepetitionBy<T, U>(
  array: T[], 
  size: number, 
  key: (item: T) => U
): U[][] {
  return permutationsWithRepetition(array, size).map(items => items.map(key));
}

// Get the combinations of an array with a key and a predicate
export function combinationsByWithPredicate<T, U>(
  array: T[], 
  size: number, 
  key: (item: T) => U,
  predicate: (items: U[]) => boolean
): U[][] {
  return combinationsBy(array, size, key).filter(predicate);
}

// Get the permutations of an array with a key and a predicate
export function permutationsByWithPredicate<T, U>(
  array: T[], 
  key: (item: T) => U,
  predicate: (items: U[]) => boolean
): U[][] {
  return permutationsBy(array, key).filter(predicate);
}

// Get the combinations with repetition of an array with a key and a predicate
export function combinationsWithRepetitionByWithPredicate<T, U>(
  array: T[], 
  size: number, 
  key: (item: T) => U,
  predicate: (items: U[]) => boolean
): U[][] {
  return combinationsWithRepetitionBy(array, size, key).filter(predicate);
}

// Get the permutations with repetition of an array with a key and a predicate
export function permutationsWithRepetitionByWithPredicate<T, U>(
  array: T[], 
  size: number, 
  key: (item: T) => U,
  predicate: (items: U[]) => boolean
): U[][] {
  return permutationsWithRepetitionBy(array, size, key).filter(predicate);
} 
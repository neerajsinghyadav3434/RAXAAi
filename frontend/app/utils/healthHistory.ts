"use client";

import { HealthReportData, REPORT_STORAGE_KEY } from "./reportStorage";

const HISTORY_STORAGE_KEY = "raxa_health_history";
const MAX_HISTORY_ENTRIES = 10;

export interface HistoryEntry {
  id: string;
  savedAt: string;
  report: HealthReportData;
}

export function saveToHistory(report: HealthReportData): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadHistory();
    const newEntry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      savedAt: new Date().toISOString(),
      report,
    };
    const updated = [newEntry, ...existing].slice(0, MAX_HISTORY_ENTRIES);
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // silent — history is non-critical
  }
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function deleteHistoryEntry(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const updated = loadHistory().filter((entry) => entry.id !== id);
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // silent
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    // silent
  }
}

export function restoreFromHistory(entry: HistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(entry.report));
  } catch {
    // silent
  }
}

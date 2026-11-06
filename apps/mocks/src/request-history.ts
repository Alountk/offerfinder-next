import {type MockCallHistoryEntry} from './types.js'

const MAX_ENTRIES = 50

export class RequestHistoryStore {
  private entries: MockCallHistoryEntry[] = []

  add(entry: MockCallHistoryEntry): void {
    this.entries = [entry, ...this.entries].slice(0, MAX_ENTRIES)
  }

  getAll(): MockCallHistoryEntry[] {
    return [...this.entries]
  }

  clear(): void {
    this.entries = []
  }
}

// Client-side storage utilities for static export
export class StaticStorage {
  private static instance: StaticStorage
  private storage: Storage | null = null

  private constructor() {
    // Only initialize localStorage on client side
    if (typeof window !== "undefined") {
      this.storage = window.localStorage
    }
  }

  public static getInstance(): StaticStorage {
    if (!StaticStorage.instance) {
      StaticStorage.instance = new StaticStorage()
    }
    return StaticStorage.instance
  }

  public setItem(key: string, value: string): void {
    try {
      if (this.storage) {
        this.storage.setItem(key, value)
      }
    } catch (error) {
      console.warn("Failed to save to localStorage:", error)
    }
  }

  public getItem(key: string): string | null {
    try {
      if (this.storage) {
        return this.storage.getItem(key)
      }
    } catch (error) {
      console.warn("Failed to read from localStorage:", error)
    }
    return null
  }

  public removeItem(key: string): void {
    try {
      if (this.storage) {
        this.storage.removeItem(key)
      }
    } catch (error) {
      console.warn("Failed to remove from localStorage:", error)
    }
  }

  public clear(): void {
    try {
      if (this.storage) {
        this.storage.clear()
      }
    } catch (error) {
      console.warn("Failed to clear localStorage:", error)
    }
  }
}

// Export singleton instance
export const storage = StaticStorage.getInstance()

export interface ReferenceEntry {
  readonly oldRef: string;
  readonly newRef: string;
}

export class ReferenceTracker {
  private map = new Map<string, ReferenceEntry>();

  public getReference(ref: string): ReferenceEntry | undefined {
    return this.map.get(ref);
  }

  public addReference(oldRef: string, newRef: string) {
    this.map.set(oldRef, { oldRef, newRef });
  }
}

export class CrossFileReferenceTracker {
  private map = new Map<string, ReferenceTracker>();

  public constructor(files: string[]) {
    for (const file of files) {
      this.map.set(file, new ReferenceTracker());
    }
  }

  public getForFile(name: string): ReferenceTracker | undefined {
    return this.map.get(name);
  }
}

// import { Type } from './type'; // Assuming Type is a class in the same directory

export class EntryIndex {
  private entries: any[] = [];
  private index: Set<any> = new Set();
  private types: { [key: string]: any } = {};

  add(entry: any) {
    if (Array.isArray(entry)) {
      entry.forEach(e => this.add(e));
    } else {
      this.addEntry(entry);
    }
  }

  isEmpty(): boolean {
    return this.entries.length === 0;
  }

  length(): number {
    return this.entries.length;
  }

  asJson() {
    return { entries: this.entriesAsJson(), types: this.typesAsJson() };
  }

  toJson(): string {
    return JSON.stringify(this.asJson());
  }

  private addEntry(entry: any) {
    if (this.index.add(JSON.stringify(entry))) {
      this.entries.push({ ...entry });
      if (entry.type) {
        // this.types[entry.type] = this.types[entry.type] || new Type(entry.type);
        this.types[entry.type].count += 1;
      }
    }
  }

  private entriesAsJson() {
    return this.entries.sort((a, b) => this.sortFn(a.name, b.name)).map(e => e.asJson());
  }

  private typesAsJson() {
    return Object.values(this.types).sort((a, b) => this.sortFn(a.name, b.name)).map(t => t.asJson());
  }

  private sortFn(a: string, b: string): number {
    const SPLIT_INTS = /(?<=\d)\.(?=[\s\d])/;
    if ((a.charCodeAt(0) >= 49 && a.charCodeAt(0) <= 57) || (b.charCodeAt(0) >= 49 && b.charCodeAt(0) <= 57)) {
      const aSplt = a.split(SPLIT_INTS);
      const bSplt = b.split(SPLIT_INTS);

      if (aSplt.length === 1 && bSplt.length === 1) {
        return a.localeCompare(b);
      }
      if (aSplt.length === 1) {
        return 1;
      }
      if (bSplt.length === 1) {
        return -1;
      }

      let aSplit = aSplt.map((s, i) => i === aSplt.length - 1 ? s : parseInt(s, 10));
      let bSplit = bSplt.map((s, i) => i === bSplt.length - 1 ? s : parseInt(s, 10));

      if (bSplit.length > aSplit.length) {
        aSplit = [...aSplit, ...new Array(bSplit.length - aSplit.length).fill(0)];
      } else if (aSplit.length > bSplit.length) {
        bSplit = [...bSplit, ...new Array(aSplit.length - bSplit.length).fill(0)];
      }

      for (let i = 0; i < aSplit.length; i++) {
        if (aSplit[i] !== bSplit[i]) {
          return aSplit[i] < bSplit[i] ? -1 : 1;
        }
      }
      return 0;
    } else {
      return a.localeCompare(b);
    }
  }
}

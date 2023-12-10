import { EntriesFilter, Entry } from "../core/filters";

interface AssocType {
  name: string;
  kind?: string;
  typIdentifier?: string;
  typ?: string;
}

export class PythonEntriesFilter extends EntriesFilter {
  parseTypes(parts: string[]): AssocType[] {
    const types: AssocType[] = [];
    parts.forEach((part) => {
      const x: AssocType = { name: "" };

      const [a, b] = part.split("#");
      if (b !== undefined) {
        const [typ, typeIdentifier] = b.split(".");
        x.typ = typ;
        x.typIdentifier = typeIdentifier;
      }

      const [kind, name] = a.split(".");
      if (name !== undefined) {
        x.name = name;
        x.kind = kind;
      } else {
        x.name = kind;
      }

      return types.push(x);
    });

    return types;
  }

  getEntries(): Entry[] {
    const entries: Entry[] = [];

    const structuralTypeClasses = [
      ".class",
      ".exception",
      ".data",
      ".attribute",
    ];
    structuralTypeClasses.forEach((typeClass) => {
      this.doc.querySelectorAll(typeClass).forEach((typeNode) => {
        const titleNode = typeNode.querySelector("dt");
        const path = titleNode.querySelector("a")?.getAttribute("href");
        if (path === null) {
          return;
        }

        entries.push({
          name: titleNode.getAttribute("id"),
          html: typeNode.querySelector("dd").outerHTML,
          path,
          scipSymbol: "",
        });
      });
    });

    const methodTypeClasses = [
      ".function",
      ".method",
      ".staticmethod",
      "classmethod",
    ];
    methodTypeClasses.forEach((typeClass) => {
      this.doc.querySelectorAll(typeClass).forEach((typeNode) => {
        const titleNode = typeNode.querySelector("dt");
        const path = titleNode.querySelector("a")?.getAttribute("href");
        if (path === null) {
          return;
        }
        entries.push({
          name: titleNode.getAttribute("id"),
          html: typeNode.querySelector("dd").outerHTML,
          path,
          scipSymbol: "",
        });
      });
    });

    return entries;
  }
}

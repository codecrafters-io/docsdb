import assert from "assert";
import { EntriesFilter, Entry } from "../core/filters";
import { HTMLElement } from "node-html-parser";

interface AssocType {
  name: string;
  kind?: string;
  typIdentifier?: string;
  typ?: string;
}

export class RustEntriesFilter extends EntriesFilter {
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

  getScipSymbol(path: string): string {
    try {
      const scheme = "rust-analyzer";
      const parts = path.replace(".html", "").split("/").slice(1);
      const packageName = parts[0];
      if (!["core", "std"].includes(packageName)) {
        return "";
      }
      const pkg = `cargo ${packageName} https://github.com/rust-lang/rust/library/${packageName}`;

      const types = this.parseTypes(parts);
      let descs = "";
      types.forEach((type) => {
        if (type.kind === undefined) {
          descs += `${type.name}/`;
        } else if (["struct", "enum", "trait", "union", "type"].includes(type.kind)) {
          descs += `${type.name}#`;
        } else {
          throw Error(`unkonwn kind ${type.kind}`);
        }

        if (["tymethod", "method"].includes(type.typ)) {
          descs += `${type.typIdentifier}().`;
        } else {
          if (type.typ !== undefined) throw Error(`unknown typ ${type.typ}`);
        }
      });

      return `${scheme} ${pkg} ${descs}`;
    } catch (e) {
      console.log(path);
      throw e;
    }
  }

  getEntries(): Entry[] {
    const entries: Entry[] = [];

    let name = this.doc
      .querySelector("main h1")
      ?.innerText.replace(/^.+\s/, "")
      .replace("⎘", "");
    let path = new URL(this.currentUrl()).pathname;
    const itemDecl = this.doc.querySelector("pre.item-decl");
    const topDoc = this.doc.querySelector("details.top-doc");

    if (!name || !itemDecl || !topDoc) {
      return [];
    }

    this.doc.querySelectorAll(".method-toggle").forEach((methodNode) => {
      const nameNode = methodNode.querySelector("a.fn");
      const fnName = name + "::" + nameNode.innerText;
      let methodPath = new URL(
        nameNode.getAttribute("href"),
        this.currentUrl()
      );
      const path = methodPath.pathname + methodPath.hash;
      const html = methodNode.outerHTML;
      entries.push({
        name: fnName,
        html,
        path,
        scipSymbol: this.getScipSymbol(path),
      });
    });

    return entries;
  }
}

import { EntriesFilter, Entry } from "../core/filters";

interface AssocType {
  name: string;
  kind?: string;
  typIdentifier?: string;
  typ?: string;
}

export class GoEntriesFilter extends EntriesFilter {
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

    let pkgName = "";

    if (this.doc.querySelector(".go-Main-headerTitle .go-Chip") === null)
      return;

    pkgName = this.doc.querySelector("h1").innerText;
    const html =
      this.doc.querySelector("section.Documentation-overview")?.innerHTML || "";
    entries.push({
      name: pkgName,
      html,
      path: this.currentUrl(),
      scipSymbol: "",
    });

    const constantsPath = this.doc
      .querySelector("h3.Documentation-constantsHeader > a")
      ?.getAttribute("href");

    if (constantsPath) {
      this.doc
        .querySelectorAll("section.Documentation-constants pre > span")
        .forEach((constantNode) => {
          const constantName = constantNode.getAttribute("id");
          entries.push({
            name: constantName,
            html: constantNode.querySelector(".comment")?.innerText || "",
            path: constantsPath,
            scipSymbol: "",
          });
        });
    }

    const variablesPath = this.doc
      .querySelector("h3.Documentation-variablesHeader > a")
      ?.getAttribute("href");

    if (variablesPath) {
      const variablesCont = this.doc.querySelector(
        "section.Documentation-variables"
      );
      const variablesCount = variablesCont.querySelectorAll(
        ".Documentation-declaration"
      ).length;

      for (let i = 0; i < variablesCount; i++) {
        const varName = variablesCont
          .querySelector(`.Documentation-declaration:nth-child(${i})`)
          ?.querySelector("pre > span")
          ?.getAttribute("id");
        const varHtml = variablesCont.querySelector(
          `.Documentation-declaration:nth-child(${i}) + p`
        )?.outerHTML;

        if (varName && varHtml)
          entries.push({
            name: varName,
            html: varHtml,
            path: variablesPath,
            scipSymbol: "",
          });
      }
    }

    this.doc
      .querySelectorAll("div.Documentation-function")
      .forEach((funcNode) => {
        const idNode = funcNode.querySelector(".Documentation-idLink");
        const name = funcNode.querySelector("h4")?.getAttribute("id");
        if (!idNode || !name) return;
        entries.push({
          name,
          html: funcNode.outerHTML,
          path: idNode.getAttribute("href"),
          scipSymbol: "",
        });
      });

    this.doc.querySelectorAll("div.Documentation-type").forEach((typeNode) => {
      const idNode = typeNode.querySelector(".Documentation-idLink");
      const name = typeNode.querySelector("h4")?.getAttribute("id");
      if (!idNode || !name) return;
      entries.push({
        name,
        html: typeNode.outerHTML,
        path: idNode.getAttribute("href"),
        scipSymbol: "",
      });
    });

    this.doc
      .querySelectorAll("div.Documentation-typeMethod")
      .forEach((methodNode) => {
        const idNode = methodNode.querySelector(".Documentation-idLink");
        const name = methodNode.querySelector("h4")?.getAttribute("id");
        if (!idNode || !name) return;
        entries.push({
          name,
          html: methodNode.outerHTML,
          path: idNode.getAttribute("href"),
          scipSymbol: "",
        });
      });

    this.doc
      .querySelectorAll("div.Documentation-typeFunc")
      .forEach((typeFuncNode) => {
        const idNode = typeFuncNode.querySelector(".Documentation-idLink");
        const name = typeFuncNode.querySelector("h4")?.getAttribute("id");
        if (!idNode || !name) return;
        entries.push({
          name,
          html: typeFuncNode.outerHTML,
          path: idNode.getAttribute("href"),
          scipSymbol: "",
        });
      });

    return entries;
  }
}

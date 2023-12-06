import {
  CleanHtmlFilter,
  NormalizeUrlsFilter,
} from "../../../../../src/lib/docs/filters/core/filters";
import { parse, HTMLElement } from "node-html-parser";

describe("CleanHtmlFilter", () => {
  test("removes scripts and styles", () => {
    const html = `
        <div>
            <head>
                <script></script>
                <style></style>
            </head>
            <body>
                <script></script>
                <style></style>
            </body>
        </div>
        `;

    const doc = parse(html);

    const filter = new CleanHtmlFilter(doc, { url: "" });

    filter.filter();

    expect(doc.querySelector("script")).toBeNull();
    expect(doc.querySelector("style")).toBeNull();
  });
});

describe("NormalizeUrlsFilter", () => {
    const SAMPLE_URL = 'http://example.com/dir/file';

  const applyFilter = (path: string): string => {
    const content = '<a href="' + path + '"></a>';
    const doc: HTMLElement = parse(content);
    const filter = new NormalizeUrlsFilter(doc, { url: SAMPLE_URL });
    filter.filter();
    return doc.querySelector("a")!.getAttribute("href")!;
  };

  test("rewrites relative urls", () => {
    const content = expect(applyFilter("./path")).toBe('http://example.com/dir/path');
  });

  test("rewrites root-relative urls", () => {
    expect(applyFilter("/path")).toBe('http://example.com/path');
  });

  test("rewrites relative image urls", () => {
    const content = '<img src="/image.png">';
    const doc: HTMLElement = parse(content);
    const filter = new NormalizeUrlsFilter(doc, { url: SAMPLE_URL });
    filter.filter();
    expect(doc.querySelector("img")!.getAttribute("src")).toBe('http://example.com/image.png');
  });

  test("rewrites relative iframe urls", () => {
    const content = '<iframe src="/path"></iframe>';
    const doc: HTMLElement = parse(content);
    const filter = new NormalizeUrlsFilter(doc, { url: SAMPLE_URL });
    filter.filter();
    expect(doc.querySelector("iframe")!.getAttribute("src")).toBe('http://example.com/path');
  });

  test("rewrites protocol-less urls", () => {
    expect(applyFilter("//example.com/")).toBe('http://example.com/');
  });

  test("rewrites empty urls", () => {
    expect(applyFilter("")).toBe(SAMPLE_URL);
  });

  test("repairs un-encoded spaces", () => {
    expect(applyFilter("http://example.com/#foo bar ")).toBe('http://example.com/#foo%20bar');
  });

  test("retains query strings", () => {
    expect(applyFilter("path?query")).toBe('http://example.com/dir/path?query');
  });

  test("retains fragments", () => {
    expect(applyFilter("path#frag")).toBe('http://example.com/dir/path#frag');
  });

  test("normalizes fragments", () => {
    expect(applyFilter("#frag")).toBe('http://example.com/dir/file#frag');
  })

  test("doesn't rewrite absolute urls", () => {
    const absoluteUrl = 'http://not.example.com/path';
    expect(applyFilter(absoluteUrl)).toBe(absoluteUrl);
  });

  // test("doesn't rewrite fragment-only urls", () => {
  //   const fragmentUrl = '#frag';
  //   expect(applyFilter(fragmentUrl)).toBe(fragmentUrl);
  // });

  test("doesn't rewrite email urls", () => {
    const emailUrl = 'mailto:test@example.com';
    expect(applyFilter(emailUrl)).toBe(emailUrl);
  });

 

  test("doesn't rewrite data image urls", () => {
    const dataImageUrl = '<img src="data:image/gif;base64,aaaa">';
    const doc: HTMLElement = parse(dataImageUrl);
    const filter = new NormalizeUrlsFilter(doc, { url: SAMPLE_URL });
    filter.filter();
    expect(doc.querySelector("img")!.getAttribute("src")).toBe('data:image/gif;base64,aaaa');
  });
});

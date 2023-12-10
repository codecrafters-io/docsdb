// import { Set } from 'typescript-collections';
// import { AutoloadHelper } from './autoloadHelper';
// import { FilterStack } from './filterStack';
// import { Instrumentable } from './instrumentable';
// import { Parser } from './parser';
// import { Typhoeus } from './typhoeus';
// import { URL, Url } from 'url';
// import { deepDup } from './deepDup';
// import { inheritableCopy } from './inheritableCopy';

import { Ctx } from "../filters/core/filters";
import { Doc } from "./doc";
import { Parser } from "./parser";
import { FilterImpl, Pipeline } from "./pipeline";
import { UrlScraperOptions } from "./scrapers/url_scraper";
import fs from "fs-extra";
import { join } from "path";
import ScraperQueue from "./scraper_queue";

export abstract class Scraper extends Doc {
  abstract lang: string;
  abstract baseUrl: string;
  abstract initial_paths: string[];
  abstract options: UrlScraperOptions;
  // static html_filters: FilterStack;
  // static text_filters: FilterStack;
  // static stubs: any;

  // private base_url: URL;
  // private root_url: URL;
  // private pipeline: any;
  // private options: any;
  // private initial_urls: string[];

  constructor() {
    super();
    // FIXME: Get filters here.
  }

  // static inherited(subclass: any) {
  //   super.inherited(subclass);

  //   subclass.extend(AutoloadHelper);
  //   subclass.autoload_all(`docs/filters/${this.toString().demodulize().underscore()}`, 'filter');

  //   subclass.base_url = this.base_url;
  //   subclass.root_path = this.root_path;
  //   subclass.initial_paths = [...this.initial_paths];
  //   subclass.options = deepDup(this.options);
  //   subclass.html_filters = inheritableCopy(this.html_filters);
  //   subclass.text_filters = inheritableCopy(this.text_filters);
  //   subclass.stubs = {...this.stubs};
  // }

  static filters() {
    // return [...this.html_filters.toArray(), ...this.text_filters.toArray()];
  }

  // static stub(path: string, block: Function) {
  //   this.stubs[path] = block;
  //   return this.stubs;
  // }

  // initialize_stubs() {
  //   for (let path in Scraper.stubs) {
  //     let block = Scraper.stubs[path];
  //     Typhoeus.stub(this.url_for(path)).and_return(() => {
  //       return new Typhoeus.Response(
  //         this.url_for(path),
  //         200,
  //         { 'Content-Type': 'text/html' },
  //         this.instance_exec(block)
  //       );
  //     });
  //   }
  // }

  async buildPage(path: string) {
    const url = this.url_for(path);
    let response = await this.request_one(url);
    let result = await this.handleResponse(url, response);
    if (result) {
      return result;
    }
  }

  async delay(d: number) {
    return new Promise((res) => setTimeout(res, d));
  }

  async buildPages() {
    const runPage = async (path: string) => {
      let response;
      try {
        response = await this.request_one(path);
      } catch (e) {
        console.error("failed to fetch url ", path);
        console.error(e);
        return;
      }
      let ctx = await this.handleResponse(path, response);
      ctx.internalUrls.forEach(async (url) => {
        if (
          url.startsWith(this.baseUrl) &&
          this.options.onlyPatterns.some((pat) => url.match(pat)) &&
          this.options.skipPatterns.every((pat) => !url.match(pat))
        ) {
          await queue.add(url);
        }
      });
    };

    const queue = new ScraperQueue(runPage);

    this.initial_paths.forEach(async (path) => {
      await queue.add(this.url_for(path));
    });

    await queue.onIdle();
  }

  // build_pages() {
  //   let history = new Set(this.initial_urls.map(url => url.toLowerCase()));
  //   this.instrument('running.scraper', { urls: this.initial_urls });

  //   this.request_all(this.initial_urls, (response: any) => {
  //     if (!this.handle_response(response)) {
  //       return;
  //     }
  //     let data = this.handle_response(response);
  //     if (!data || !data.internal_urls) {
  //       return;
  //     }
  //     let next_urls = data.internal_urls.filter((url: string) => history.add(url.toLowerCase()));
  //     this.instrument('queued.scraper', { urls: next_urls });
  //     return next_urls;
  //   });
  // }

  // root_path?() {
  //   return this.root_path() && this.root_path() !== '/';
  // }

  // initial_paths() {
  //   return Scraper.initial_paths;
  // }

  // initial_urls() {
  //   if (!this.initial_urls) {
  //     this.initial_urls = [this.root_url().toString(), ...this.initial_paths().map(path => this.url_for(path))];
  //     Object.freeze(this.initial_urls);
  //   }
  //   return this.initial_urls;
  // }

  // pipeline() {
  //   if (!this.pipeline) {
  //     this.pipeline = new HTML.Pipeline(Scraper.filters());
  //     this.pipeline.instrumentation_service = Docs;
  //   }
  //   return this.pipeline;
  // }

  // options() {
  //   if (!this.options) {
  //     this.options = deepDup(Scraper.options);
  //     this.options.base_url = this.base_url();
  //     this.options.root_url = this.root_url();
  //     this.options.root_path = this.root_path();
  //     this.options.initial_paths = this.initial_paths();
  //     this.options.version = Scraper.version;
  //     this.options.release = Scraper.release;

  //     if (this.root_path?()) {
  //       this.options.skip = this.options.skip || [];
  //       this.options.skip.push('', '/');
  //     }

  //     if (this.options.only || this.options.only_patterns) {
  //       this.options.only = this.options.only || [];
  //       this.options.only.push(...this.initial_paths(), ...(this.root_path?() ? [this.root_path()] : ['', '/']));
  //     }

  //     this.options = {...this.options, ...this.additional_options()};
  //     Object.freeze(this.options);
  //   }
  //   return this.options;
  // }

  abstract request_one(url: string);

  private request_all(url: string, block: Function) {
    throw new Error("NotImplementedError");
  }

  // private process_response?(response: any) {
  //   throw new Error('NotImplementedError');
  // }

  url_for(path: string) {
    if (path === "" || path === "/") {
      return this.baseUrl.toString();
    } else {
      return `${this.baseUrl.toString()}${path}`;
    }
  }

  async handleResponse(path: string, response: any): Promise<Ctx> {
    return this.processResponse(path, response);
  }

  async processResponse(path: string, response: any) {
    let parser = new Parser(response);
    const ctx: Ctx = { title: parser.title, url: path };
    new Pipeline(parser.document, this.getFilters(), ctx).process();

    const htmlPath = path.endsWith("/")
      ? `${path}index.html`
      : !path.endsWith(".html")
      ? `${path}.html`
      : path;

    await writeFile(this.lang, htmlPath, parser.document.toString());

    await writeFile(
      this.lang,
      htmlPath.replace(".html", ".json"),
      JSON.stringify(ctx, null, 2)
    );

    return ctx;
  }

  abstract getFilters(): FilterImpl[];

  // private pipeline_context(response: any) {
  //   return {...this.options(), url: response.url};
  // }

  // parse(response) {
  //   const parser = Parser.new(response.body)
  //   return { html: parser.html, title: parser.title }
  // }

  // private with_filters(...filters: any[]) {
  //   let stack = new FilterStack();
  //   stack.push(...filters);
  //   this.pipeline().filters = stack.toArray();
  //   Object.freeze(this.pipeline().filters);
  // }

  // private additional_options() {
  //   return {};
  // }
}

const writeFile = async (docName: string, path: string, content: string) => {
  let filePath = new URL(path).pathname;
  filePath = join(`./public/docs/${docName}/`, filePath);

  await fs.ensureFile(filePath);
  await fs.writeFile(filePath, content);
};

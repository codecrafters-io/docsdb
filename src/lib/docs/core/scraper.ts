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
import PQueue from "p-queue";

export abstract class Scraper extends Doc {
  abstract baseUrl: string;
  abstract rootPath: string;
  // static initial_paths: string[];
  // static options: any;
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
    console.log(this.url_for(path));
    let response = await this.request_one(this.url_for(path));
    let result = this.handleResponse(path, response);
    if (result) {
      return result;
    }
  }
  
  async delay(d: number) {
    return new Promise(res => 
    setTimeout(res, d));
  }

  async buildPages() {
    const queue = new PQueue({
      concurrency: 2,
      // interval: 1000,
      // intervalCap: 2,
    });
    const queueSet: Set<string> = new Set();

    const runPage = async (path) => {
      console.log("Processing url: ", path);
      await queueSet.add(this.rootPath);
      await queue.add(async () => {
        let response = await this.request_one(path);
        let ctx = this.handleResponse(path, response);
        ctx.internalUrls.forEach(async (url) => {
          console.log("Adding url to queue: ", url)
          if (!queueSet.has(url)) {
            await runPage(url);
          }
        });
        console.log("Done processing url: ", path);
      }, {});
    };

    await queue.add(() => runPage(this.url_for(this.rootPath)));
    await this.delay(2000);

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

  root_url() {
    return this.rootPath
      ? new URL(`${this.baseUrl.toString()}/${this.root_path()}`)
      : this.baseUrl.normalize();
  }

  root_path() {
    return this.rootPath;
  }

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
      return this.root_url().toString();
    } else {
      return `${this.baseUrl.toString()}${path}`;
    }
  }

  private handleResponse(path: string, response: any): Ctx {
    return this.processResponse(path, response);
  }

  private processResponse(path: string, response: any) {
    let parser = new Parser(response);
    const ctx: Ctx = { title: parser.title, url: this.url_for(path) };
    new Pipeline(parser.document, this.getFilters(), ctx).process();
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

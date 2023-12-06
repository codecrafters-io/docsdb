import { EntryIndex } from "./entry_index";
import PageDb from "./page_db";
import axios from 'axios';
import { parse, HTMLElement } from 'node-html-parser'

export abstract class Doc {
  static INDEX_FILENAME = 'index.json';
  static DB_FILENAME = 'db.json';
  static META_FILENAME = 'meta.json';

  name: string;
  slug: string;
  type: string;
  release: string;
  abstract: string;
  // links: string;
  version: string;
  versions: any[] = [];

  versioned() {
    return this.versions.length > 0;
  }

  versionSlug() {
    if (!this.version) return;
    let slug = this.version.toLowerCase();
    slug = slug.replace('+', 'p');
    slug = slug.replace('#', 's');
    slug = slug.replace(/[^a-z0-9\_\.]/g, '_');
    return slug;
  }

  path() {
    return this.slug;
  }

  indexPath() {
    return `${this.path()}/${Doc.INDEX_FILENAME}`;
  }

  dbPath() {
    return `${this.path()}/${Doc.DB_FILENAME}`;
  }

  metaPath() {
    return `${this.path()}/${Doc.META_FILENAME}`;
  }

  asJson() {
    const json: any = { name: this.name, slug: this.slug, type: this.type };
    // if (this.links) json.links = this.links;
    if (this.version) json.version = this.version;
    if (this.release) json.release = this.release;
    return json;
  }

  storePage(store: any, path: string) {
    let index = new EntryIndex();
    let pages = new PageDb();

      // store.open(this.path, () => {
        let page = this.buildPage(path);
        // if (page && this.canStorePage(page)) {
        //   index.add(page.entries);
        //   pages.add(page.path, page.output);
        //   this.storeIndex(store, INDEX_FILENAME, index, false);
        //   this.storeIndex(store, DB_FILENAME, pages, false);
        //   store.write(page.storePath, page.output);
        //   return true;
        // } else {
        //   return false;
        // }
      // });
  }

  storePages(store: any)  {
    let index = new EntryIndex();
    let pages = new PageDb();

    this.buildPages();

    

    // try {
    //   store.replace(this.path, () => {
    //     this.buildPages((page: any) => {
    //       if (this.storePage(page)) {
    //         store.write(page.storePath, page.output);
    //         index.add(page.entries);
    //         pages.add(page.path, page.output);
    //       }
    //     });

    //     if (index.present()) {
    //       this.storeIndex(store, INDEX_FILENAME, index);
    //       this.storeIndex(store, DB_FILENAME, pages);
    //       this.storeMeta(store);
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   });
    // } catch (error) {
    //   if (error instanceof Docs.SetupError) {
    //     console.error(`ERROR: ${error.message}`);
    //   }
    //   return false;
    // }
  }

  private defaultSlug(): string | undefined {
    if (!/[^A-Za-z0-9_]/.test(this.name)) {
      return this.name.toLowerCase();
    }
  }

  private canStorePage(page: any): boolean {
    return page.entries.present();
  }

  private storeIndex(store: any, filename: string, index: any, readWrite: boolean = true): void {
    let oldJson = readWrite && store.read(filename) || '{}';
    let newJson = index.toJson();
    // this.instrument(`${filename.remove('.json')}.doc`, { before: oldJson, after: newJson });
    // if (readWrite) {
    //   store.write(filename, newJson);
    // }
  }

  private storeMeta(store: any): void {
    let json = this.asJson();
    json.mtime = Date.now();
    // json.dbSize = store.size(DB_FILENAME);
    // store.write(META_FILENAME, JSON.stringify(json));
  }

  initialize(): void {
    // if (this.constructor.abstract) {
    //   throw new Error(`${this.constructor.name} is an abstract class and cannot be instantiated.`);
    // }
  }

  abstract buildPage(id: any, block?: Function): void 
  
  abstract buildPages(): void 

  getScraperVersion(opts: any): any {
    // if (this.constructor.options && this.constructor.options.release) {
    //   return this.constructor.options.release;
    // } else {
    //   // If options.release does not exist, we return the Epoch timestamp of when the doc was last modified in DevDocs production
    //   let json = this.fetchJson('https://devdocs.io/docs.json', opts);
    //   let items = json.filter((item: any) => item.name === this.constructor.name);
    //   items = items.map((item: any) => item.mtime);
    //   return Math.max(...items);
    // }
  }

  // Should return the latest version of this documentation
  // If options.release is defined, it should be in the same format
  // If options.release is not defined, it should return the Epoch timestamp of when the documentation was last updated
  // If the docs will never change, simply return '1.0.0'
  getLatestVersion(opts: any): void {
    throw new Error('NotImplementedError');
  }

  // Returns whether or not this scraper is outdated ("Outdated major version", "Outdated minor version" or 'Up-to-date').
  //
  // The default implementation assumes the documentation uses a semver(-like) approach when it comes to versions.
  // Patch updates are ignored because there are usually little to no documentation changes in bug-fix-only releases.
  //
  // Scrapers of documentations that do not use this versioning approach should override this method.
  //
  // Examples of the default implementation:
  // 1 -> 2 = outdated
  // 1.1 -> 1.2 = outdated
  // 1.1.1 -> 1.1.2 = not outdated
  outdatedState(scraperVersion: any, latestVersion: any): string {
    let scraperParts = scraperVersion.toString().split(/[-.]/).map(Number);
    let latestParts = latestVersion.toString().split(/[-.]/).map(Number);

    // Only check the first two parts, the third part is for patch updates
    for (let i = 0; i < 2; i++) {
      if (i >= scraperParts.length || i >= latestParts.length) {
        break;
      }
      if (i === 0 && latestParts[i] > scraperParts[i]) {
        return 'Outdated major version';
      }
      if (i === 1 && latestParts[i] > scraperParts[i] && latestParts[0] === 0 && scraperParts[0] === 0) {
        return 'Outdated major version';
      }
      if (i === 1 && latestParts[i] > scraperParts[i] && latestParts[0] === 1 && scraperParts[0] === 1) {
        return 'Outdated major version';
      }
      if (i === 1 && latestParts[i] > scraperParts[i]) {
        return 'Outdated minor version';
      }
      if (latestParts[i] < scraperParts[i]) {
        return 'Up-to-date';
      }
    }

    return 'Up-to-date';
  }

  async fetch(url: string, opts: any): Promise<string> {
    // let headers: any = {};

    // if (opts.githubToken && url.startsWith('https://api.github.com/')) {
    //   headers.Authorization = `token ${opts.githubToken}`;
    // } else if (process.env.GITHUB_TOKEN && url.startsWith('https://api.github.com/')) {
    //   headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    // }

    // opts.logger.debug(`Fetching ${url}`);
    const response = await axios.get(url, { timeout: 15000, ...opts })
    // console.log(response)
    return response.data;
  }

  async fetchDoc(url: string, opts: any): Promise<HTMLElement> {
    return parse(await this.fetch(url, opts));
  }

  async fetchJson(url: string, opts: any): Promise<any> {
    return JSON.parse(await this.fetch(url, opts));
  }

  private getNpmVersion(pkg: string, opts: any, tag: string = 'latest'): any {
    let json = this.fetchJson(`https://registry.npmjs.com/${pkg}`, opts);
    return json['dist-tags'][tag];
  }

  // private getLatestGithubRelease(owner: string, repo: string, opts: any): string {
  //   let release = this.fetchJson(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, opts);
  //   // let tagName = release.tagName;
  //   // return tagName.startsWith('v') ? tagName.slice(1) : tagName;
  // }

  // private getGithubTags(owner: string, repo: string, opts: any): any {
  //   return this.fetchJson(`https://api.github.com/repos/${owner}/${repo}/tags`, opts);
  // }

  // private getGithubFileContents(owner: string, repo: string, path: string, opts: any): string {
  //   let json = this.fetchJson(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, opts);
  //   // return Buffer.from(json.content, 'base64').toString();
  // }

  // private getLatestGithubCommitDate(owner: string, repo: string, opts: any): number {
  //   let commits = this.fetchJson(`https://api.github.com/repos/${owner}/${repo}/commits`, opts);
  //   let timestamp = commits[0].commit.author.date;
  //   return new Date(timestamp).getTime();
  // }

  // private getGitlabTags(hostname: string, group: string, project: string, opts: any): any {
  //   return this.fetchJson(`https://${hostname}/api/v4/projects/${group}%2F${project}/repository/tags`, opts);
  // }
}

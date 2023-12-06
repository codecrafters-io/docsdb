import { FilterImpl } from '../core/pipeline';
import { UrlScraper, UrlScraperOptions } from '../core/scrapers/url_scraper';
import { CleanHtmlFilter, NormalizeUrlsFilter, InternalUrls  } from '../filters/core/filters';
import { RustEntriesFilter } from '../filters/rust/entries';

class Rust extends UrlScraper {
  type = 'rust';
  release = '1.73.0';
  baseUrl = 'https://doc.rust-lang.org/';
  // rootPath = 'book/index.html';
  rootPath= "std/index.html"
  // initialPaths = [
    // 'reference/introduction.html',
    // 'std/index.html',
    // 'error-index.html'
  // ];
  links = {
    home: 'https://www.rust-lang.org/',
    code: 'https://github.com/rust-lang/rust'
  };

  html_filters = ['rust/entries', 'rust/clean_html'];

  options: UrlScraperOptions = {
    onlyPatterns: [
      /^book\//,
      /^reference\//,
      /^collections\//,
      /^std\//
    ],
    skip: ['book/README.html', 'book/ffi.html'],
    skipPatterns: [/(?<!\.html)$/, /\/print\.html/, /^book\/second-edition\//],

    fixUrls: (url: string) => {
      url = url.replace(/(#{this.base_url}.+\/)$/, '$1index.html');
      url = url.replace(`${this.baseUrl}nightly/`, this.baseUrl);
      url = url.replace('/unicode/u_str', '/unicode/str/');
      url = url.replace('/std/std/', '/std/');
      return url;
    },

    attribution: `
      &copy; 2010 The Rust Project Developers<br>
      Licensed under the Apache License, Version 2.0 or the MIT license, at your option.
    `
  };

  async getLatestVersion(opts: any): Promise<string> {
    let doc = await this.fetchDoc('https://www.rust-lang.org/', opts);
    let label = doc.querySelector('.button-download + p > a').textContent;
    return label.replace(/Version /, '');
  }

  private REDIRECT_RGX = /http-equiv="refresh"/i;
  private NOT_FOUND_RGX = /<title>Not Found<\/title>/;

  shouldProcessResponse(response: any) {
    return !(response.body.match(this.REDIRECT_RGX) || response.body.match(this.NOT_FOUND_RGX) || response.body === '');
  }

  parse(response: any) { // Hook here because Nokogiri removes whitespace from headings
    response.body = response.body.replace(/<h[1-6] class="code-header">/g, '<pre class="code-header">');
    // return super.parse(response);
  }

  getFilters(): FilterImpl[] {
    return [
      CleanHtmlFilter,
      NormalizeUrlsFilter,
      InternalUrls,
      RustEntriesFilter,
    ]
  }
}

export default Rust;
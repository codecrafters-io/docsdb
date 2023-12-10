import { FilterImpl } from '../core/pipeline';
import { UrlScraper, UrlScraperOptions } from '../core/scrapers/url_scraper';
import { CleanHtmlFilter, NormalizeUrlsFilter, InternalUrls  } from '../filters/core/filters';
import { RustEntriesFilter } from '../filters/rust/entries';

class Rust extends UrlScraper {
  lang = 'rust';
  release = '1.73.0';
  baseUrl = 'https://doc.rust-lang.org/';

  initial_paths = [
    'std/index.html',
  ];

  options: UrlScraperOptions = {
    onlyPatterns: [
      /\/alloc\//,
      /\/core\//,
      /\/std\//
    ],

    skipPatterns: [/\/core\/arch\//, /\/core\/simd\//],


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
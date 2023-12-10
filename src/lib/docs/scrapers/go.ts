import { FilterImpl } from '../core/pipeline';
import { UrlScraper, UrlScraperOptions } from '../core/scrapers/url_scraper';
import { CleanHtmlFilter, NormalizeUrlsFilter, InternalUrls  } from '../filters/core/filters';
import { GoEntriesFilter } from '../filters/go/entries';

class Go extends UrlScraper {
  lang = 'go';
  release = '1.21.5';
  baseUrl = 'https://pkg.go.dev';

  initial_paths = [ '/std' ];

  options: UrlScraperOptions = {
    onlyPatterns: [/pkg\.go\.dev/],

    skipPatterns: [],
  };

  async getLatestVersion(opts: any): Promise<string> {
    let doc = await this.fetchDoc('https://pkg.go.dev/std', opts);
    return document.querySelector('[data-test-id=UnitHeader-version]').textContent.match(/go(1[\w\.]+)/)[1];
  }

  getFilters(): FilterImpl[] {
    return [
      CleanHtmlFilter,
      NormalizeUrlsFilter,
      InternalUrls,
      GoEntriesFilter,
    ]
  }
}

export default Go;
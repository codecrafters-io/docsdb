import { FilterImpl } from '../core/pipeline';
import { UrlScraper, UrlScraperOptions } from '../core/scrapers/url_scraper';
import { CleanHtmlFilter, NormalizeUrlsFilter, InternalUrls  } from '../filters/core/filters';
import { PythonEntriesFilter } from '../filters/python/entries';

class Python extends UrlScraper {
  lang = 'python';
  release = '3.12';
  baseUrl = 'https://docs.python.org/3.12/';

  initial_paths = [
    'library/index.html',
  ];

  options: UrlScraperOptions = {
    onlyPatterns: [
      /\/library\//,
    ],

    skipPatterns: [/\.rst/],
  };

  async getLatestVersion(opts: any): Promise<string> {
    let doc = await this.fetchDoc('https://docs.python.org/', opts);
    return doc.querySelector('title').innerHTML.split(' ')[0];
  }

  getFilters(): FilterImpl[] {
    return [
      CleanHtmlFilter,
      NormalizeUrlsFilter,
      InternalUrls,
      PythonEntriesFilter,
    ]
  }
}

export default Python;
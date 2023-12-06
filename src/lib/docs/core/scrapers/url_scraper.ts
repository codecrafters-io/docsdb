// import { Request, Requester, URL } from 'docs';
import { Scraper } from '../scraper';
// import { Capybara, Selenium } from 'capybara';

export interface UrlScraperOptions {
  onlyPatterns: RegExp[]
  skip: string[],
  skipPatterns: RegExp[],
  fixUrls: (url: string) => string,
  attribution: string,
}

export abstract class UrlScraper extends Scraper {
  static params: any = {};
  static headers: any = { 'User-Agent': 'DevDocs' };
  static force_gzip: boolean = false;
  private static rate_limiter: any = null;


  abstract options: UrlScraperOptions;

  // constructor() {
  //   super();
  //   this.params = UrlScraper.params;
  //   this.headers = UrlScraper.headers;
  //   this.force_gzip = UrlScraper.force_gzip;
  // }

  request_one(url: string) {
    return this.fetch(url, this.request_options());
  }

  // private request_all(urls: string[], block: Function) {
  //   if (this.options.rate_limit) {
  //     if (UrlScraper.rate_limiter) {
  //       UrlScraper.rate_limiter.limit = this.options.rate_limit;
  //     } else {
  //       UrlScraper.rate_limiter = new RateLimiter(this.options.rate_limit);
  //     }
  //   }
  //   return Requester.run(urls, { request_options: this.request_options() }, block);
  // }

  private request_options() {
    let options = { params: UrlScraper.params, headers: UrlScraper.headers };
    if (UrlScraper.force_gzip) options['accept_encoding'] = 'gzip';
    return options;
  }

  private process_response(response: any) {
    if (response.error()) {
      throw new Error(`Error status code (${response.code}): ${response.return_message}
        ${response.url}
        ${JSON.stringify(response.headers, null, 2)}`);
    } else if (response.blank()) {
      throw new Error(`Empty response body: ${response.url}`);
    }
    return response.success() && response.html() && this.process_url(response.effective_url);
  }

  private process_url(url: string) {
    // return this.base_url.contains(url);
  }

  private load_capybara_selenium() {
    // Capybara.register_driver('chrome', (app: any) => {
    //   let options = new Selenium.WebDriver.Chrome.Options();
    //   options.addArguments('headless', 'disable-gpu');
    //   return new Capybara.Selenium.Driver(app, { browser: 'chrome', options: options });
    // });
    // Capybara.javascript_driver = 'chrome';
    // Capybara.current_driver = 'chrome';
    // Capybara.run_server = false;
    // return Capybara;
  }
}

class RateLimiter {
  limit: number;
  private minute: number | null = null;
  private counter: number = 0;

  constructor(limit: number) {
    this.limit = limit;
  }

  call() {
    if (this.minute !== new Date().getMinutes()) {
      this.minute = new Date().getMinutes();
      this.counter = 0;
    }
    this.counter += 1;
    if (this.counter >= this.limit) {
      let wait = 60 - new Date().getSeconds() + 1;
      setTimeout(() => {}, wait * 1000);
    }
    return true;
  }
}

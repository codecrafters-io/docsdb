import { HTMLElement, parse } from 'node-html-parser';

export interface Ctx {
    url: string,
    internalUrls?: string []
    [key: string]: any
}

export abstract class Filter {
    static DATA_URL = 'data:';

    ctx: Ctx;
    doc: HTMLElement

    constructor(doc: HTMLElement, ctx: Ctx) {
        this.doc = doc
        this.ctx = ctx;
    }

    abstract filter();


    isDataUrl(s: string) {
        return s.startsWith(Filter.DATA_URL);
    }

    currentUrl(): string {
        return this.ctx.url;
    }
}

// export class ApplyBaseUrlFilter extends Filter {
//     static URL_ATTRIBUTES = { 'a': 'href', 'img': 'src', 'iframe': 'src' };
//     static SCHEME_RGX = /\A[^:\/?#]+:/;
//     doc: any;

//     constructor(doc: any, ctx: any) {
//         super(doc, ctx);
//     }

//     filter() {
//         let base = this.doc.querySelector('base');
//         let base_url = base ? base.getAttribute('href') : null;
//         if (!base_url) return this.doc;

//         for (let [tag, attribute] of Object.entries(ApplyBaseUrlFilter.URL_ATTRIBUTES)) {
//             this.doc.querySelectorAll(tag).forEach(node => {
//                 let value = node.getAttribute(attribute);
//                 if (!value || !this.relative_url_string(value) || value[0] === '/') return;
//                 node.setAttribute(attribute, `${base_url}${node.getAttribute(attribute)}`);
//             });
//         }
//     }

//     relative_url_string(url: string) {
//         return !ApplyBaseUrlFilter.SCHEME_RGX.test(url);
//     }
// }

export class CleanHtmlFilter extends Filter {
    doc: HTMLElement;

    constructor(doc: HTMLElement, ctx: Ctx) {
        super(doc, ctx);
    }

    filter() {
        this.doc.querySelectorAll('script, style, link').forEach(node => node.remove());
    }
}


export class NormalizeUrlsFilter extends Filter {
    static ATTRIBUTES = { 'a': 'href', 'img': 'src', 'iframe': 'src' };

    doc: HTMLElement;

    constructor(doc: HTMLElement, ctx: Ctx) {
        super(doc, ctx)
    }

    filter() {
        for (let [tag, attribute] of Object.entries(NormalizeUrlsFilter.ATTRIBUTES)) {
            this.update_attribute(tag, attribute);
        }
    }

    update_attribute(tag: string, attribute: string) {
        this.doc.querySelectorAll(tag).forEach(node => {
            let value = node.getAttribute(attribute);
            if (value == undefined || this.isDataUrl(value)) return;
            node.setAttribute(attribute, this.normalizeUrl(value) || (tag === 'iframe' ? value : '#'));
        });
    }

    normalizeUrl(str: string) {
        // console.log(str, this.currentUrl())
        const url = new URL(str, this.currentUrl())
        return url.toString();
    }
}



export class InternalUrls extends Filter {

    urls: string[];

    constructor(doc: HTMLElement, ctx: Ctx) {
        super(doc, ctx)
    }

    filter() {
        const urlsSet: Set<string> = new Set();

        this.doc.querySelectorAll('a').forEach((node) => {
            const href = node.getAttribute('href')!;
            const url = new URL(href, this.currentUrl());
            urlsSet.add(url.origin + url.pathname);
        })

        this.ctx.internalUrls = Array.from(urlsSet);
    }
}

export interface Entry {
    name: string,
    scipSymbol: string,
    path: string,
    html: string,
}

export abstract class EntriesFilter extends Filter {
    entries: Entry[];

    constructor(doc: HTMLElement, ctx: Ctx) {
        super(doc, ctx)
    }
        
    filter() {
        this.ctx.entries = this.getEntries();
    }

    abstract getEntries(): Entry[];
}
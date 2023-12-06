import Rust from './docs/scrapers/rust'
// import * as Bundler from 'bundler/setup';
// Bundler.require('default', 'docs');


// import * as ActiveSupport from 'active_support';
// import * as CoreExt from 'active_support/core_ext';
// import * as I18n from 'i18n';
// I18n.enforce_available_locales = true;

// import * as AutoloadHelper from 'docs/core/autoload_helper';
// export { AutoloadHelper };

// export const root_path = require('path').dirname(require.main.filename);

// import { URL } from 'docs/core/url';
// import * as Core from 'docs/core';
// import * as CoreFilter from 'docs/filters/core';
// import * as Scrapers from 'docs/scrapers';
// import * as Storage from 'docs/storage';
// import * as Subscribers from 'docs/subscribers';

export let store_class: any;
// store_class = require('FileStore');
// 
export let store_path: string;
// store_path = require('path').resolve('../public/docs', root_path);

export let rescue_errors: boolean;
rescue_errors = false;

export class DocNotFound extends Error { }
export class SetupError extends Error { }

// export function all() {
//     return require('fs').readdirSync(root_path + '/docs/scrapers')
//         .filter((file: string) => file.endsWith('.rb'))
//         .map((file: string) => require('path').basename(file, '.rb'))
//         .map((name: string) => this[name])
//         .sort((a: any, b: any) => a.name.localeCompare(b.name))
//         .filter((doc: any) => !doc.abstract);
// }

// export function all_versions() {
//     return all().reduce((versions: any[], doc: any) => versions.concat(doc.versions), []);
// }

// export function defaults() {
//     return ['css', 'dom', 'html', 'http', 'javascript'].map((name: string) => find(name));
// }

// export function installed() {
//     return require('fs').readdirSync(store_path)
//         .filter((file: string) => file.endsWith('index.json'))
//         .map((file: string) => file.match(/\/([^/]*)\/index\.json\z/)[1])
//         .sort()
//         .map((path: string) => all_versions().find((doc: any) => doc.path === path))
//         .filter((doc: any) => doc !== undefined);
// }


export async function find(name: string, version?: string) {
    return new Rust()

    // FIXME: figure out how to do versions  
    // if (version && doc.versions) {
    //     doc = doc.versions.find((klass: any) => klass.version === version || klass.version_slug === version);
    //     if (!doc) throw new DocNotFound(`could not find version "${version}" for doc "${name}"`);
    // } else {
    //     doc = doc.versions[0];
    // }

    // return doc;
}

// export function find_by_slug(slug: string, version: string = null) {
//     let doc = all().find((klass: any) => klass.slug === slug);

//     if (!doc) throw new DocNotFound(`could not find doc with "${slug}"`);

//     if (version && doc.versions) {
//         let versionDoc = doc.versions.find((klass: any) => klass.version === version || klass.version_slug === version);
//         if (!versionDoc) throw new DocNotFound(`could not find version "${version}" for doc "${doc.name}"`);
//         doc = versionDoc;
//     }

//     return doc;
// }

export async function generate_page(name: string, version: string|undefined, page_id: string) {
    const doc = await find(name, version)
    doc.storePage(store, page_id);
}

export async function generate(docName: string, version: string = null) {
   const doc = await find(docName, version);
   return doc.storePages(store);
}

// export function generate_manifest() {
//     const Manifest = require('Manifest');
//     return new Manifest(store, all_versions()).store;
// }

export function store() {
    // return new store_class(store_path);
}


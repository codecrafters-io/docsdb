import * as Docs from '../docs';

export default class DocsCLI {
  // list(options) {
  //   let names;
  //   if (options.packaged) {
  //     const slugs = fs.readdirSync(Docs.store_path).filter(f => f.endsWith('.tar.gz')).map(f => path.basename(f, '.tar.gz'));
  //     names = this.find_docs_by_slugs(slugs).map(doc => {
  //       return doc.version ? `${doc.constructor.name.toLowerCase()}@${doc.version}` : doc.constructor.name.toLowerCase();
  //     });
  //   } else {
  //     names = Docs.all.reduce((names, doc) => {
  //       const name = doc.constructor.name.toLowerCase();
  //       if (doc.versioned) {
  //         return names.concat(doc.versions.map(_doc => `${name}@${_doc.version}`));
  //       } else {
  //         return names.concat(name);
  //       }
  //     }, []);
  //   }

  //   const output = names.join("\n");

  //   require('tty-pager').default.page(output);
  // }

  // ... rest of the methods ...

  // Generate a page (no indexing)  
  page(name: string, path: string = ''): void {
    // if (path === '' || path.startsWith('/')) {
    //   console.log('ERROR: [path] must be an absolute path.');
    //   return;
    // }

    const [langName, version] = name.split(/@|~/);

    try {
      Docs.generate_page(langName, version, path)
    } catch (e) {
      console.error(`Failed`, e);
    }
  }

  // find_doc(name) {
  //   const [name, version] = name.split(/@|~/);
  //   if (version === 'all') {
  //     return Docs.find(name, false).versions;
  //   } else {
  //     return Docs.find(name, version);
  //   }
  // }

  // find_docs(names) {
  //   return names.flatMap(name => this.find_doc(name));
  // }

  // find_docs_by_slugs(slugs) {
  //   return slugs.flatMap(slug => {
  //     const [slug, version] = slug.split(/~/);
  //     return Docs.find_by_slug(slug, version);
  //   });
  // }

  // assert_docs(docs) {
  //   if (docs.length === 0) {
  //     console.log('ERROR: called with no arguments.');
  //     console.log('Run "thor list" for usage patterns.');
  //     process.exit(1);
  //   }
  // }

  // handle_doc_not_found_error(error) {
  //   console.log(`ERROR: ${error}.`);
  //   console.log('Run "thor docs:list" to see the list of docs and versions.');
  // }

  generate_doc(doc, options) {
    Docs.generate(doc)
      // if (options.package) this.package_doc(doc);
      // console.log('Done');
      // return true;
    // } else {
      // console.log(`Failed!${options.debug ? '' : ' (try running with --debug for more information)'}`);
      // return false;
    // }
  }

  // ... rest of the methods ...

  async check(name: string) {
    const doc = await Docs.find(name, undefined);
    const version =  await doc.getLatestVersion(name);
    console.log(version);
  }
}

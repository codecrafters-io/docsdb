import DocsCLI from './lib/tasks/docs';

const docsCli = new DocsCLI();

// docsCli.check('rust')

// docsCli.page("rust", "std/vec/struct.Vec.html");
docsCli.page("go", "/io@go1.21.5")
// docsCli.generate_doc("go", {});

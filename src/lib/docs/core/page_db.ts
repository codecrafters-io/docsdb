 class PageDb {
    pages: { [key: string]: any };

    constructor() {
        this.pages = {}
    }

    add(path, content) {
        this.pages[path] = content
    }

    toJson() {
        return JSON.stringify(this.pages) 
    }
}

export default PageDb;

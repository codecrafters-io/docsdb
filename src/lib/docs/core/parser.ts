import { parse, HTMLElement } from 'node-html-parser';

export class Parser {
    content: string;
    document: HTMLElement;
    title: string;
    html: any;

    constructor(content: string) {
        this.content = content;
        this.html = this.parse();
    }

    private parse(): any {
        this.document = parse(this.content);
        this.title = this.document.querySelector('title').innerText;
        return this.document;
    }
}

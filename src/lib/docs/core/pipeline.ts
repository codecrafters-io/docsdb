
import { HTMLElement } from "node-html-parser";
import { Filter, Ctx } from "../filters/core/filters";
import fs from 'fs';

export interface FilterImpl {
    new(doc: HTMLElement, ctx: Ctx): Filter
}

export class Pipeline {
    doc : HTMLElement
    filters: FilterImpl[]
    ctx: Ctx

    constructor(doc: HTMLElement, filters: FilterImpl[], ctx: Ctx) {
        this.doc = doc;
        this.ctx = ctx;
        this.filters = filters;
    }
    
    process() {
        this.filters.forEach(Filter => {
            let f = new Filter(this.doc, this.ctx);
            f.filter();
        });

        
        fs.writeFileSync('sample.json', JSON.stringify({ ctx :this.ctx }));
    }
}
import { AbstractSmartcontractFacade } from "./abstract-facade";

export abstract class AbstractPredicateBuilder<T extends AbstractSmartcontractFacade<string>> {

    constructor(
        readonly facade: T,
    ) {}
}
import { Categories } from './generated/wappalyer';
export declare const STANDALONE_APPLICATION_CATEGORIES: Categories[];
interface UrlStatus {
    status: Number;
}
interface Meta {
    language: string;
}
interface CleanedApplication {
    name: string;
    confidence: Number;
    version: string;
    icon: string;
    website: string;
    categories: Array<Categories>;
}
interface CleanedWappalyzerResult {
    urls: Map<string, UrlStatus>;
    applications: Array<CleanedApplication>;
    meta: Meta;
}
declare function analyse(url: string): Promise<CleanedWappalyzerResult>;
export declare function whatIs(url: string): Promise<Result>;
export interface SubResult {
    /**
     * Result Value
     * E.g nginx, jira, styled-components, etc.
     */
    name: string;
    /**
     * Version of the Results
     */
    version: string;
    /**
     * Confidence of the Result
     */
    confidence: Number;
    /**
     *
     */
    category: Categories;
}
interface Result {
    application: SubResult;
    server: SubResult;
    programmingLanguage: SubResult;
    conflictingPossibilities: SubResult[];
    others: SubResult[];
}
export default analyse;
export { Categories } from './generated/wappalyer';

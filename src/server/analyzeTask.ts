import AnalyzeResult from "./analyzeResult";

export default class AnalyzeTask {
    // tslint:disable-next-line:variable-name
    public _id: string;
    public screenName: string;
    public progresses: string[];
    public result?: AnalyzeResult;
}

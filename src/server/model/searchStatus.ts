import Result from "./result";

enum State {
    initialized,
    running,
    finished
}

export default class SearchStatus {
    public id: number;
    public searchCondition: {
        screenName: string;
    };
    public state: State;
    public result: Result;
}

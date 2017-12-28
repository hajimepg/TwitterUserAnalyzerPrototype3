import User from "./model/user";

export default class AnalyzeResult {
    public followEachOther: User[];
    public followedOnly: User[];
    public followOnly: User[];
}

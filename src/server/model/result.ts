import User from "./user";

export default class Result {
    public followers: User[];
    public friends: User[];
    public followEachOther: User[];
    public followedOnly: User[];
    public followOnly: User[];
}

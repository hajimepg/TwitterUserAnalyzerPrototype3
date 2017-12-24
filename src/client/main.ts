import Vue from "vue";

/* tslint:disable:object-literal-sort-keys */
const app = new Vue({
    el: "#app",
    data: {
        followEachOther: [
            1,  2,  3,  4,  5,  6,  7,  8,  9, 10,
           11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
           21, 22, 23, 24, 25
       ],
        followedOnly: [
            1,  2,  3,  4,  5,  6,  7,  8,  9, 10,
           11, 12, 13, 14, 15, 16, 17, 18
       ],
       followOnly: [
            1,  2,  3,  4,  5,  6,  7,  8,  9, 10,
           11, 12, 13, 14
        ],
    }
});
/* tslint:enable:object-literal-sort-keys */

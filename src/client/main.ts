import axios from "axios";
import Vue from "vue";

/* tslint:disable:object-literal-sort-keys */
Vue.component("user-list", {
    template: `
<div>
    <h1 v-on:click="show = !show">
        {{ name }}
        <span v-if="!show">▼</span>
    </h1>
    <transition name="fade">
        <div v-if="show" class="flex-container">
            <div v-for="item in list">
                <a v-bind:href="item.twitterHomeUrl" target="_blank"></a>
                <img v-bind:src="item.profileImageUrl">
                <p>{{ item.screenName }}</p>
            </div>
        </div>
    </transition>
</div>
`,
    data() {
        return {
           show: false
        };
    },
    props: ["name", "list"]
});

const app = new Vue({
    el: "#app",
    data: {
        state: "no-analyazed",
        analyzeScreenName: "",
        analyzeId: "",
        analyzeProgresses: [],
        followEachOther: [],
        followedOnly: [],
        followOnly: [],
    },
    methods: {
        analyze() {
            this.$data.state = "analyzing";
            this.$data.analyzeProgresses.splice(0, this.$data.analyzeProgresses.length);

            axios.post("http://localhost:3000/api/analyzeTask", {
                    screenName: this.$data.analyzeScreenName
                })
                .then((response) => {
                    this.$data.analyzeId = response.data.id;
                    setTimeout(() => { this.updateAnalyazeStatus(); }, 0);
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        updateAnalyazeStatus() {
            axios.get("http://localhost:3000/api/analyzeTask", {
                params: {
                    id: this.$data.analyzeId
                }
            })
            .then((response) => {
                this.$data.analyzeProgresses.splice(0, this.$data.analyzeProgresses.length);
                this.$data.analyzeProgresses.push(...response.data.progresses);

                if (response.data.status === "finish") {
                    this.$data.state = "analyzed";

                    this.$data.followEachOther.splice(0, this.$data.followEachOther.length);
                    this.$data.followedOnly.splice(0, this.$data.followedOnly.length);
                    this.$data.followOnly.splice(0, this.$data.followOnly.length);

                    this.$data.followEachOther.push(...response.data.result.followEachOther);
                    this.$data.followedOnly.push(...response.data.result.followedOnly);
                    this.$data.followOnly.push(...response.data.result.followOnly);
                }
                else {
                    setTimeout(() => { this.updateAnalyazeStatus(); }, 1000);
                }
            })
            .catch((error) => {
                console.log(error);
            });
        }
    }
});
/* tslint:enable:object-literal-sort-keys */

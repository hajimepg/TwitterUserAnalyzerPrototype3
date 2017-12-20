const path = require("path");

module.exports = {
    entry: "./src/client/main.ts",
    output: {
        path: path.resolve(__dirname, "dist/client"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: [".ts"],
        alias: {
            "axios$": "axios/dist/axios.js",
            "vue$": "vue/dist/vue.esm.js"
        }
    }
};

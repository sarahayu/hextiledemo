import path from "path";

export default {
  base: "./",
  build: {
    target: 'esnext' //browsers can handle the latest ES features
  },
  resolve: {
      alias: {
        "src": path.resolve(__dirname, "./src/"),
    },
  },
}
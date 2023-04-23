import { saveDirectoryStructure } from "./index";
import fs from "fs";
saveDirectoryStructure(".", "dir.json", { ignore: ['./.git', './node_modules'], cutoff: 1, space: "  " })
    .then(() => {
    const content = fs.readFileSync("dir.json", { encoding: "utf8" });
    console.info(content);
})
    .then(() => {
    fs.unlinkSync("dir.json");
});

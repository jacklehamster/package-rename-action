var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "fs";
import stringify from "json-stable-stringify";
import md5 from "md5";
export function recursePath(path, callback, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options === null || options === void 0 ? void 0 : options.ignore) {
            for (let f of options.ignore) {
                if (path.startsWith(f)) {
                    return;
                }
            }
        }
        const fileList = yield fs.promises.readdir(path);
        return Promise.all(fileList.map(fileName => `${path}/${fileName}`)
            .map((filePath) => __awaiter(this, void 0, void 0, function* () {
            return yield (fs.statSync(filePath).isDirectory()
                ? recursePath(filePath, callback, options)
                : callback(filePath));
        })));
    });
}
function insertPathInStructure(pathSplit, index, structure) {
    const isFile = index === pathSplit.length - 1;
    if (isFile) {
        if (!structure.files) {
            structure.files = {};
        }
        const { mtime } = fs.statSync(pathSplit.join("/"));
        structure.files[pathSplit[index]] = mtime.getTime();
    }
    else {
        if (!structure.dir) {
            structure.dir = {};
        }
        const subStructure = structure.dir[pathSplit[index]] = {};
        insertPathInStructure(pathSplit, index + 1, subStructure);
    }
}
export function getDirectoryStructure(path, { ignore, cutoff = 0 }) {
    return __awaiter(this, void 0, void 0, function* () {
        const root = {};
        yield recursePath(path, (path) => __awaiter(this, void 0, void 0, function* () {
            insertPathInStructure(path.split("/"), cutoff, root);
        }), {
            ignore,
        });
        return root;
    });
}
export function saveDirectoryStructure(path, target, { ignore, cutoff, space }) {
    return __awaiter(this, void 0, void 0, function* () {
        const structure = yield getDirectoryStructure(path, { ignore, cutoff });
        const md5Hash = md5(stringify(structure));
        structure.md5 = md5Hash;
        const json = stringify(structure, { space });
        yield fs.promises.writeFile(target, json);
    });
}

import fs from "fs";
import stringify from "json-stable-stringify";
import md5 from "md5"

interface Props {
  ignore?: string[];
  cutoff?: number;
  space?: string;
}

interface DirectoryStructure {
  md5?: string;
  dir?: Record<string, DirectoryStructure>;
  files?: Record<string, number>;
}

export async function recursePath(path: string, callback: (filepath: string) => Promise<void>, options: Props): Promise<unknown> {
  if (options?.ignore) {
    for (let f of options.ignore) {
      if (path.startsWith(f)) {
        return;
      }
    }
  }
  const fileList = await fs.promises.readdir(path);

  return Promise.all(fileList.map(fileName => `${path}/${fileName}`)
    .map(async filePath => await (fs.statSync(filePath).isDirectory()
      ? recursePath(filePath, callback, options)
      : callback(filePath))));
}

function insertPathInStructure(pathSplit: string[], index: number, structure: DirectoryStructure) {
  const isFile = index === pathSplit.length - 1;
  if (isFile) {
    if (!structure.files) {
      structure.files = {};
    }
    const { mtime } = fs.statSync(pathSplit.join("/"));
    structure.files[pathSplit[index]] = mtime.getTime();
  } else {
    if (!structure.dir) {
      structure.dir = {};
    }
    const subStructure = structure.dir[pathSplit[index]] = {};
    insertPathInStructure(pathSplit, index + 1, subStructure);
  }
}

export async function getDirectoryStructure(path: string, { ignore, cutoff = 0 }: Props): Promise<DirectoryStructure> {
  const root: DirectoryStructure = {};
  await recursePath(path, async path => {
    insertPathInStructure(path.split("/"), cutoff, root);
  }, {
    ignore,
  });
  return root;
}

export async function saveDirectoryStructure(path: string, target: string, { ignore, cutoff, space }: Props) {
  const structure = await getDirectoryStructure(path, { ignore, cutoff });
  const md5Hash = md5(stringify(structure));
  structure.md5 = md5Hash;
  const json = stringify(structure, { space });
  
  await fs.promises.writeFile(target, json);
}

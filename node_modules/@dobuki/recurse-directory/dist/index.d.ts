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
export declare function recursePath(path: string, callback: (filepath: string) => Promise<void>, options: Props): Promise<unknown>;
export declare function getDirectoryStructure(path: string, { ignore, cutoff }: Props): Promise<DirectoryStructure>;
export declare function saveDirectoryStructure(path: string, target: string, { ignore, cutoff, space }: Props): Promise<void>;
export {};

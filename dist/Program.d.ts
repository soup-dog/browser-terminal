import API from "./API";
export type Program = (input: string, api: React.MutableRefObject<API>) => Promise<any>;

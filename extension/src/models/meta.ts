export type MetaName = string & {_: 'MetaName'};
export type MetaContent = string & {_: 'MetaContent'};

export interface Meta {
  name: MetaName;
  content: MetaContent;
}

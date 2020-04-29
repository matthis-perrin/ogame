import {DetailedHTMLProps, FC, HTMLAttributes} from 'react';

export type CustomDiv<T = {}> = FC<
  T & Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'ref'>
>;

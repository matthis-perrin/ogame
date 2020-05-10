import {DetailedHTMLProps, FC, HTMLAttributes} from 'react';

export type HTMLProps<E> = Omit<DetailedHTMLProps<HTMLAttributes<E>, E>, 'ref'>;

type CustomHTMLElement<Props, E extends HTMLElement> = FC<Props & HTMLProps<E>>;
export type CustomDiv<Props = {}> = CustomHTMLElement<Props, HTMLDivElement>;
export type CustomCanvas<Props = {}> = CustomHTMLElement<Props, HTMLCanvasElement>;

export const NULL_REF = null; // eslint-disable-line no-null/no-null

import { ReactNode } from 'react'

export interface PageProps<T = Record<string, string>> {
    params: Promise<T>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface LayoutProps<T = Record<string, string>> {
    params: Promise<T>;
    children: ReactNode;
}

export type CommonParams = {
    lang: string;
}

declare module 'xterm/dist/addons/fit/fit' {
    import { Terminal } from 'xterm';

    export interface IGeometry {
        cols: number;

        rows: number;
    }

    export function proposeGeometry(term: Terminal): IGeometry;

    export function fit(term: Terminal): void;

    export function apply(terminalConstructor: typeof Terminal): void;
}

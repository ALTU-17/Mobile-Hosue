declare module "curtainsjs" {
  export type CurtainsParams = {
    container: HTMLElement | string;
    alpha?: boolean;
    antialias?: boolean;
    autoResize?: boolean;
    autoRender?: boolean;
    watchScroll?: boolean;
    pixelRatio?: number;
    renderingScale?: number;
    production?: boolean;
  };

  export type PlaneUniform = {
    name: string;
    type: string;
    value: number | number[] | Float32Array;
  };

  export type PlaneParams = {
    widthSegments?: number;
    heightSegments?: number;
    renderOrder?: number;
    depthTest?: boolean;
    cullFace?: string;
    uniforms?: Record<string, PlaneUniform>;
    vertexShader?: string;
    fragmentShader?: string;
    transparent?: boolean;
    alwaysDraw?: boolean;
    visible?: boolean;
    autoloadSources?: boolean;
    watchScroll?: boolean;
  };

  export class Plane {
    constructor(renderer: Curtains, element: HTMLElement, params?: PlaneParams);
    uniforms: Record<string, { value: number | number[] | Float32Array }>;
    onReady(callback: () => void): void;
    onError(callback: () => void): void;
    remove(): void;
  }

  export class Curtains {
    constructor(params: CurtainsParams);
    planes: Plane[];
    onRender(callback: () => void): void;
    onError(callback: () => void): void;
    dispose(): void;
  }
}

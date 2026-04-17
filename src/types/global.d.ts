/// <reference types="@react-three/fiber" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      sphere: any;
      box: any;
      circleGeometry: any;
      planeGeometry: any;
      boxGeometry: any;
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      directionalLight: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      torusGeometry: any;
      cylinderGeometry: any;
      ringGeometry: any;
      textGeometry: any;
    }
  }
}

export {};
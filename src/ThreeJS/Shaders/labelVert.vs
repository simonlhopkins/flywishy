// = object.matrixWorld
uniform mat4 modelMatrix;

// = camera.matrixWorldInverse * object.matrixWorld
uniform mat4 modelViewMatrix;

// = camera.projectionMatrix
uniform mat4 projectionMatrix;

// = camera.matrixWorldInverse
uniform mat4 viewMatrix;

// = inverse transpose of modelViewMatrix
uniform mat3 normalMatrix;

// = camera position in world space
uniform vec3 cameraPosition;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;


varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vScreenUV;


void main() {
    vUv = uv; // Pass UVs to fragment shader
    vPosition = position;
    vNormal = normal;

    vec4 clipSpace = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    // Perspective divide to get NDC (-1 to 1)
    vec2 ndc = clipSpace.xy / clipSpace.w;
    
    // Convert NDC to screen space UVs (0 to 1)
    vScreenUV = ndc * 0.5 + 0.5;
    gl_Position = clipSpace;
}
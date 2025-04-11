precision mediump float;
uniform sampler2D uTexture;


uniform float uTime;

varying vec2 vUv;

varying vec3 vPosition;
varying vec3 vNormal;



float mapRange(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
}


void main() {
    vec4 col = texture2D(uTexture, vUv);
    gl_FragColor = col;
}
precision mediump float;
uniform sampler2D uTexture;
uniform sampler2D uPlaneDepthTexture;


uniform float uTime;

varying vec2 vUv;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vScreenUV;




float mapRange(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
}


void main() {
    vec4 col = texture2D(uTexture, vUv);
    float mask = texture2D(uPlaneDepthTexture, vScreenUV).r;
    mask = 1.-mask;
    col.a = mask >0.? 0.: col.a;
    gl_FragColor = vec4(col);
}
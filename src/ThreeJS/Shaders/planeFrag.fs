precision mediump float;
uniform sampler2D uTexture;
uniform sampler2D uEnergyHistory;
uniform sampler2D uWaveform;


uniform float uTime;

varying vec2 vUv;

varying vec3 vPosition;
varying vec3 vNormal;



float mapRange(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
}


void main() {
    vec4 color = texture2D(uTexture, vec2(vUv.x, 1.0 - vUv.y));
    float waveformValue = texture2D(uWaveform, vec2(vUv.x, vUv.y)).r;
    
    float sidePlaneUVY = mapRange(vUv.y, 0., 0.15, 0., 1.);

    sidePlaneUVY = max(0., sidePlaneUVY);
    float waveformHeight = abs(waveformValue-0.5);
    float edgeSoftness = 0.01;
    float lowBound = smoothstep(0., edgeSoftness, sidePlaneUVY - 0.5 - waveformHeight);
    float upperBound = 1. - smoothstep(0., edgeSoftness, sidePlaneUVY - 0.5 + waveformHeight);
    float colorValue = sidePlaneUVY<0.5? upperBound: lowBound; 
    gl_FragColor = vec4(mix(color.rgb, vec3(0, 0.8, 0.65), 1.-colorValue), 1.0);
}
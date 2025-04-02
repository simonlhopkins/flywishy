precision mediump float;
uniform sampler2D uTexture;
uniform sampler2D uEnergyHistory;
uniform sampler2D uWaveform;
uniform sampler2D uDisplacementMap;

uniform float uTime;
uniform vec3 uDotPosition;

varying vec2 vUv;

varying vec3 vPosition;
varying vec3 vNormal;



vec3 triplanarTexture(vec3 pos, vec3 norm, float scale) {
    norm = abs(normalize(norm)); // Normalize normal direction
    vec3 blend = normalize(pow(norm, vec3(4.0))); 
    blend /= (blend.x + blend.y + blend.z); // Normalize blending weights

    // Tile UV coordinates using mod function
    vec2 uvX = mod(pos.yz * scale, 1.0);
    vec2 uvY = mod(pos.xz * scale, 1.0);
    vec2 uvZ = mod(pos.xy * scale, 1.0);

    // Sample texture from each axis
    vec3 xProj = texture2D(uDisplacementMap, uvX).rgb;
    vec3 yProj = texture2D(uDisplacementMap, uvY).rgb;
    vec3 zProj = texture2D(uDisplacementMap, uvZ).rgb;

    // Blend between projections based on normal
    return xProj * blend.x + yProj * blend.y + zProj * blend.z;
}

float mapRange(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
}

vec3 shiftColor(vec3 color, vec3 targetColor, vec3 newColor, float threshold, float blendAmount) {
    float dist = distance(color, targetColor);
    float blendFactor = smoothstep(threshold, threshold + blendAmount, dist);
    return mix(newColor, color, blendFactor);
}
/*
1 - bass
2 - low mid
3 - mid
4 - high mid
5 - treble
*/
float getBinX(float binNum){
    return mapRange(binNum, 1., 5., 0., 1.);
}



void main() {
    vec4 color = texture2D(uTexture, vUv);

    // Compute similarity using dot product
    float similarity = dot(normalize(vNormal), normalize(uDotPosition));
    similarity = smoothstep(0.7, 1., similarity);
    // Create a soft circular dot effect
    float dotSize = smoothstep(0., 1.0, similarity);

//0 at the middle, 1 as it goes out
    float r = 1.-dotSize;
    float binColor = texture2D(uEnergyHistory, vec2(getBinX(1.), r)).r;
    binColor = smoothstep(0.5, 0.7, binColor);
    // Define colors
    // Blend between base color and dot color
    vec3 dotColor = vec3(binColor) * dotSize;

    vec3 oceanBlue = vec3(0.1176, 0.2314, 0.4588);
    vec3 toColor = vec3(1.0, 0.0, 0.5);
    float oceanShiftAmount = texture2D(uEnergyHistory, vec2(getBinX(5.), 0.)).r;
    vec3 oceanShiftColor = shiftColor(color.rgb, oceanBlue, toColor, 0.01, 0.5);
    oceanShiftColor = mix(color.rgb, oceanShiftColor, oceanShiftAmount);


    float waveformValue =(texture2D(uWaveform, vec2(vUv.x, 0.)).r - 0.5) * 2.;
    vec2 waveformUV = (vUv *2.)-1.;
    float dist = abs(waveformUV.y * 5.) - abs(waveformValue);

    vec3 finalColor = oceanShiftColor + dotColor * 0.5;
    finalColor = mix(1.-finalColor, finalColor, smoothstep(0.01, 0.01, dist));
    gl_FragColor = vec4(finalColor, 1.0);

}
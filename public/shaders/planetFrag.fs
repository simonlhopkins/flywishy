
precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uEnergyHistory;
uniform sampler2D uWaveform;
uniform sampler2D uDisplacementMap;

uniform float uTime;
uniform vec3 uDotPosition;
uniform float uOptions;

varying vec2 vUv;

varying vec3 vPosition;
varying vec3 vNormal;
const float PI = 3.14159265359;

bool getToggle(int index) {
    float value = mod(floor(uOptions / pow(2.0, float(index))), 2.0);
    return value >= 1.0; // 1 means true, 0 means false
}
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

float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

float sdW(vec2 p) {
    // Normalize space to center and scale to fit in unit square
    p = p * 2.0 - 1.0; // remap to [-1, 1]

    // Define 4 points for the W shape (from bottom left to bottom right)
    vec2 a = vec2(-0.8, 0.5);
    vec2 b = vec2(-0.4, -0.5);
    vec2 c = vec2(0.0, 0.1);
    vec2 d = vec2(0.4, -0.5);
    vec2 e = vec2(0.8, 0.5);

    // Distance to each segment
    float d1 = sdSegment(p, a, b);
    float d2 = sdSegment(p, b, c);
    float d3 = sdSegment(p, c, d);
    float d4 = sdSegment(p, d, e);

    // Return minimum distance to one of the 4 lines
    return min(min(d1, d2), min(d3, d4));
}


void main() {
    vec4 color = texture2D(uTexture, vUv);
    vec3 N = normalize(uDotPosition); // The direction we are dotting with
    vec3 V = normalize(vNormal);      // Surface direction (usually from geometry)
    //don't ask me how this works chat gave it
    vec3 tangent = normalize(cross(N, vec3(0.0, 1.0, 0.0)));
    if (length(tangent) < 0.01) {
        // Handle edge case if N is aligned with Y axis
        tangent = normalize(cross(N, vec3(1.0, 0.0, 0.0)));
    }
    vec3 bitangent = normalize(cross(N, tangent));
    vec2 planeUV = vec2(dot(V, tangent),  dot(V, bitangent));
    

    
    float angle = atan(planeUV.y, planeUV.x);
    angle = mapRange(angle, -PI, PI, 0., PI * 2.);
    float Yoffset = 0.;
    Yoffset = getToggle(1) ? (cos(angle*10.) + 1.)/10.:Yoffset;
    // Compute similarity using dot product
    float p = dot(N, V);
    float spanRadius = 0.1;
    p = smoothstep(1.-spanRadius, 1., p);
    // p = smoothstep(0.1, 0.9, p);
    float c = texture2D(uEnergyHistory, vec2(getBinX(1.), (1. - p) + Yoffset)).r;
     
   if(getToggle(2)){
        c = texture2D(uEnergyHistory, vec2(getBinX(1.), sdW(
            planeUV 
            + vec2(0.5)
            + vec2(0., Yoffset)
            ))).r;
   }
    float mixAmount = smoothstep(0.0, 0.5, p);

    c = mix(0., c, mixAmount);
   

//     // Create a soft circular dot effect

//0 at the middle, 1 as it goes out
    // Define colors
    // Blend between base color and dot color

    vec3 oceanBlue = vec3(0.1176, 0.2314, 0.4588);
    vec3 toColor = vec3(1.0, 0.0, 0.5);
    float oceanShiftAmount = texture2D(uEnergyHistory, vec2(getBinX(5.), 0.)).r;
    vec3 oceanShiftColor = shiftColor(color.rgb, oceanBlue, toColor, 0.01, 0.5);
    oceanShiftColor = mix(color.rgb, oceanShiftColor, oceanShiftAmount);


    float waveformValue =(texture2D(uWaveform, vec2(vUv.x, 0.)).r - 0.5) * 2.;
    vec2 waveformUV = (vUv *2.)-1.;
    float dist = abs(waveformUV.y * 3.) - abs(waveformValue);
    dist = getToggle(0) ? dist: 1.;
    vec3 finalColor = oceanShiftColor + c * 0.5;
    finalColor = mix(1.-finalColor, finalColor, smoothstep(0.01, 0.01, dist));
    // finalColor = vec3(getToggle(0));
    gl_FragColor = vec4(finalColor, 1.0);

}
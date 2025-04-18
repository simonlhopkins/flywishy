
precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uEnergyHistory;
uniform sampler2D uWaveform;
uniform sampler2D uDisplacementMap;
uniform sampler2D uWinspearSDF;

uniform float uTime;
uniform vec3 uDotPosition;
uniform vec2 uResolution;
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

vec3 gradientColor(vec3 colorStart, vec3 colorEnd, float t) {
    return mix(colorStart, colorEnd, clamp(t, 0.0, 1.0));
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

float sdWinspear(vec2 p){

    return texture2D(uWinspearSDF, p).r;
}

vec4 applyGlitch(sampler2D u_texture);
void main() {
    vec4 color = texture2D(uTexture, vUv);
    if(!getToggle(3)){
        color = applyGlitch(uTexture);
    }
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
        c = texture2D(uEnergyHistory, vec2(getBinX(1.), sdWinspear(
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


    float mappedX = 1.0 - abs(2.0 * vUv.x - 1.0);
    float waveformValue =(texture2D(uWaveform, vec2(mappedX, 0.)).r - 0.5) * 2.;
    vec2 waveformUV = (vUv *2.)-1.;
    // waveformUV.y *=3.;    
    float dist = abs(waveformUV.y * 3.) - abs(waveformValue);
    dist = getToggle(0) ? dist: 1.;
    vec3 finalColor = oceanShiftColor + c * 0.5;
    vec3 gradientColor = gradientColor(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), dist);
    finalColor = mix(1.-finalColor, finalColor, smoothstep(0.1, 0.11, dist));
    // finalColor = vec3(getToggle(0));
    gl_FragColor = vec4(finalColor, 1.0);

}



float random(vec2 c){
return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x) {
return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise3(vec3 v)
{
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //   x0 = x0 - 0.0 + 0.0 * C.xxx;
    //   x1 = x0 - i1  + 1.0 * C.xxx;
    //   x2 = x0 - i2  + 2.0 * C.xxx;
    //   x3 = x0 - 1.0 + 3.0 * C.xxx;
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

    // Permutations
    i = mod289(i);
    vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
    //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
}
        
const float interval = 3.;

vec4 applyGlitch(sampler2D u_texture){
    vec2 v_texCoord = vUv;
    vec2 u_resolution = vec2(2048., 1024.);
    //possibly make strngth a bin
    float strength = smoothstep(interval * 0.5, interval, interval - mod(uTime, interval)); //random between 0 and 1
    // strength = texture(u_energyHistory, vec2(0., 0.)).r;
    // strength *=2.;
    // strength = 3.;
    vec2 shake = vec2(strength * 8.0 + 0.5) * vec2(
        random(vec2(uTime)) * 2.0 - 1.0,
        random(vec2(uTime * 2.0)) * 2.0 - 1.0
    ) / u_resolution;

    float y = v_texCoord.y * u_resolution.y;
    float rgbWave = (
        snoise3(vec3(0.0, y * 0.01, uTime * 400.0)) * (2.0 + strength * 32.0)
        * snoise3(vec3(0.0, y * 0.02, uTime * 200.0)) * (1.0 + strength * 4.0)
        + step(0.9995, sin(y * 0.005 + uTime * 1.6)) * 12.0
        + step(0.9999, sin(y * 0.005 + uTime * 2.0)) * -18.0
        ) / u_resolution.x;
        
    float rgbDiff = (6.0 + sin(uTime * 500.0 + v_texCoord.y * 40.0) * (20.0 * strength + 1.0)) / u_resolution.x;
    float rgbUvX = v_texCoord.x + rgbWave; //side to side wave

    float r = texture2D(u_texture, vec2(rgbUvX + rgbDiff, v_texCoord.y) + shake).r;
    float g = texture2D(u_texture, vec2(rgbUvX, v_texCoord.y) + shake).g;
    float b = texture2D(u_texture, vec2(rgbUvX - rgbDiff, v_texCoord.y) + shake).b;

    //different frequency energy here for strength
    float whiteNoise = (random(v_texCoord + mod(uTime, 10.0)) * 2.0 - 1.0) * (0.15 + strength * 0.15);
    float bnTime = floor(uTime * 20.0) * 200.0;
    //horizontal band
    float noiseX = step((snoise3(vec3(0.0, v_texCoord.x * 3.0, bnTime)) + 1.0) / 2.0, 0.12 + strength * 0.3);
    //vertical band
    float noiseY = step((snoise3(vec3(0.0, v_texCoord.y * 3.0, bnTime)) + 1.0) / 2.0, 0.12 + strength * 0.3);
    
    float bnMask = noiseX * noiseY;
    float bnUvX = v_texCoord.x + sin(bnTime) * 0.2 + rgbWave;
    float bnR = texture2D(u_texture, vec2(bnUvX + rgbDiff, v_texCoord.y)).r * bnMask;
    float bnG = texture2D(u_texture, vec2(bnUvX, v_texCoord.y)).g * bnMask;
    float bnB = texture2D(u_texture, vec2(bnUvX - rgbDiff, v_texCoord.y)).b * bnMask;
    vec4 blockNoise = vec4(bnR, bnG, bnB, 1.0);


    float bnTime2 = floor(uTime * 25.0) * 300.0;
    float noiseX2 = step((snoise3(vec3(0.0, v_texCoord.x * 2.0, bnTime2)) + 1.0) / 2.0, 0.12 + strength * 0.5);
    float noiseY2 = step((snoise3(vec3(0.0, v_texCoord.y * 8.0, bnTime2)) + 1.0) / 2.0, 0.12 + strength * 0.3);
    float bnMask2 = noiseX2 * noiseY2;
    float bnR2 = texture2D(u_texture, vec2(bnUvX + rgbDiff, v_texCoord.y)).r * bnMask2;
    float bnG2 = texture2D(u_texture, vec2(bnUvX, v_texCoord.y)).g * bnMask2;
    float bnB2 = texture2D(u_texture, vec2(bnUvX - rgbDiff, v_texCoord.y)).b * bnMask2;
    vec4 blockNoise2 = vec4(bnR2, bnG2, bnB2, 1.0);

    float waveNoise = (sin(v_texCoord.y * 1200.0) + 1.0) / 2.0 * (0.15 + strength * 0.2);

    return vec4(r, g, b, 1.0) * (1.0 - bnMask - bnMask2) + (whiteNoise + blockNoise + blockNoise2 - waveNoise);
}
        
#version 300 es
precision highp float;
        
uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform sampler2D u_energyHistory; 

in vec2 v_texCoord;
out vec4 outColor;


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

void main(void){
    //possibly make strngth a bin
    float strength = smoothstep(interval * 0.5, interval, interval - mod(u_time, interval)); //random between 0 and 1
    // strength = texture(u_energyHistory, vec2(0., 0.)).r;
    // strength *=2.;
    // strength = 3.;
    vec2 shake = vec2(strength * 8.0 + 0.5) * vec2(
        random(vec2(u_time)) * 2.0 - 1.0,
        random(vec2(u_time * 2.0)) * 2.0 - 1.0
    ) / u_resolution;

    float y = v_texCoord.y * u_resolution.y;
    float rgbWave = (
        snoise3(vec3(0.0, y * 0.01, u_time * 400.0)) * (2.0 + strength * 32.0)
        * snoise3(vec3(0.0, y * 0.02, u_time * 200.0)) * (1.0 + strength * 4.0)
        + step(0.9995, sin(y * 0.005 + u_time * 1.6)) * 12.0
        + step(0.9999, sin(y * 0.005 + u_time * 2.0)) * -18.0
        ) / u_resolution.x;
        
    float rgbDiff = (6.0 + sin(u_time * 500.0 + v_texCoord.y * 40.0) * (20.0 * strength + 1.0)) / u_resolution.x;
    float rgbUvX = v_texCoord.x + rgbWave; //side to side wave

    float r = texture(u_texture, vec2(rgbUvX + rgbDiff, v_texCoord.y) + shake).r;
    float g = texture(u_texture, vec2(rgbUvX, v_texCoord.y) + shake).g;
    float b = texture(u_texture, vec2(rgbUvX - rgbDiff, v_texCoord.y) + shake).b;

    //different frequency energy here for strength
    float whiteNoise = (random(v_texCoord + mod(u_time, 10.0)) * 2.0 - 1.0) * (0.15 + strength * 0.15);
    float bnTime = floor(u_time * 20.0) * 200.0;
    //horizontal band
    float noiseX = step((snoise3(vec3(0.0, v_texCoord.x * 3.0, bnTime)) + 1.0) / 2.0, 0.12 + strength * 0.3);
    //vertical band
    float noiseY = step((snoise3(vec3(0.0, v_texCoord.y * 3.0, bnTime)) + 1.0) / 2.0, 0.12 + strength * 0.3);
    
    float bnMask = noiseX * noiseY;
    float bnUvX = v_texCoord.x + sin(bnTime) * 0.2 + rgbWave;
    float bnR = texture(u_texture, vec2(bnUvX + rgbDiff, v_texCoord.y)).r * bnMask;
    float bnG = texture(u_texture, vec2(bnUvX, v_texCoord.y)).g * bnMask;
    float bnB = texture(u_texture, vec2(bnUvX - rgbDiff, v_texCoord.y)).b * bnMask;
    vec4 blockNoise = vec4(bnR, bnG, bnB, 1.0);


    float bnTime2 = floor(u_time * 25.0) * 300.0;
    float noiseX2 = step((snoise3(vec3(0.0, v_texCoord.x * 2.0, bnTime2)) + 1.0) / 2.0, 0.12 + strength * 0.5);
    float noiseY2 = step((snoise3(vec3(0.0, v_texCoord.y * 8.0, bnTime2)) + 1.0) / 2.0, 0.12 + strength * 0.3);
    float bnMask2 = noiseX2 * noiseY2;
    float bnR2 = texture(u_texture, vec2(bnUvX + rgbDiff, v_texCoord.y)).r * bnMask2;
    float bnG2 = texture(u_texture, vec2(bnUvX, v_texCoord.y)).g * bnMask2;
    float bnB2 = texture(u_texture, vec2(bnUvX - rgbDiff, v_texCoord.y)).b * bnMask2;
    vec4 blockNoise2 = vec4(bnR2, bnG2, bnB2, 1.0);

    float waveNoise = (sin(v_texCoord.y * 1200.0) + 1.0) / 2.0 * (0.15 + strength * 0.2);

    outColor = vec4(r, g, b, 1.0) * (1.0 - bnMask - bnMask2) + (whiteNoise + blockNoise + blockNoise2 - waveNoise);
}
        
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

uniform sampler2D uDisplacementMap;
uniform sampler2D uEnergyHistory;



varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

float mapRange(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
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

void main() {
    vUv = uv; // Pass UVs to fragment shader
    vPosition = position;
    vNormal = normal;
    float strength = texture2D(uEnergyHistory, vec2(0, 0)).r;
        strength = smoothstep(0., 1., strength);

    strength = mapRange(strength, 0., 1., -0.5, 0.5);
    // float strength = 2.;
    float displacement = triplanarTexture(position, normal, 0.1).r;
    vec3 newPosition = position + normal * displacement * strength * 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
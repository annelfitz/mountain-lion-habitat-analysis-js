import{tH as g,qc as _}from"./index-B8s1Letc.js";const l=()=>_.getLogger("esri.views.3d.webgl-engine.core.shaderModules.shaderBuilder");class b{constructor(){this._includedModules=new Map}include(e,n){this._includedModules.has(e)?this._includedModules.get(e):(this._includedModules.set(e,n),e(this.builder,n))}}class I extends b{constructor(){super(...arguments),this.vertex=new p,this.fragment=new p,this.attributes=new y,this.varyings=new A,this.outputs=new m}get attributeNames(){return this.attributes.names}get builder(){return this}generate(e,n=!1){const t=this.attributes.generateSource(e),s=this.varyings.generateSource(e),i=e==="vertex"?this.vertex:this.fragment,a=i.uniforms.generateSource(),u=i.code.generateSource(),h=i.main.generateSource(n),$=this.debugName?`// ${this.debugName}
`:"",f=e==="vertex"?E:F,d=i.constants.generateSource(),S=this.outputs.generateSource(e);return`#version 300 es
${$}
${f}
${d.join(`
`)}
${a.join(`
`)}
${t.join(`
`)}
${s.join(`
`)}
${S.join(`
`)}
${u.join(`
`)}
${h.join(`
`)}`}generateBind(e){const n=new Map;this.vertex.uniforms.entries.forEach(i=>{const a=i.bind[0];a&&n.set(i.name,a)}),this.fragment.uniforms.entries.forEach(i=>{const a=i.bind[0];a&&n.set(i.name,a)});const t=Array.from(n.values()),s=t.length;return i=>{for(let a=0;a<s;++a)t[a](e,i)}}generateBindPass(e){const n=new Map;this.vertex.uniforms.entries.forEach(i=>{const a=i.bind[1];a&&n.set(i.name,a)}),this.fragment.uniforms.entries.forEach(i=>{const a=i.bind[1];a&&n.set(i.name,a)});const t=Array.from(n.values()),s=t.length;return(i,a)=>{for(let u=0;u<s;++u)t[u](e,i,a)}}generateBindDraw(e){const n=new Map;this.vertex.uniforms.entries.forEach(i=>{const a=i.bind[2];a&&n.set(i.name,a)}),this.fragment.uniforms.entries.forEach(i=>{const a=i.bind[2];a&&n.set(i.name,a)});const t=Array.from(n.values()),s=t.length;return(i,a,u)=>{for(let h=0;h<s;++h)t[h](e,u,i,a)}}}class v{constructor(e){this._stage=e,this._entries=new Map}add(...e){for(const n of e)this._add(n);return this._stage}get(e){return this._entries.get(e)}_add(e){if(e!=null){if(this._entries.has(e.name)&&!this._entries.get(e.name).equals(e))throw new g("shaderbuilder:duplicate-uniform",`Duplicate uniform name ${e.name} for different uniform type`);this._entries.set(e.name,e)}else l().error(`Trying to add null Uniform from ${new Error().stack}.`)}generateSource(){return Array.from(this._entries.values()).map(({name:e,arraySize:n,type:t})=>n!=null?`uniform ${t} ${e}[${n}];`:`uniform ${t} ${e};`)}get entries(){return Array.from(this._entries.values())}}class T{constructor(e){this._stage=e,this._bodies=new Array}add(e){return this._bodies.push(e),this._stage}generateSource(e){if(this._bodies.length>0)return[`void main() {
 ${this._bodies.join(`
`)||""} 
}`];if(e)throw new g("shaderbuilder:missing-main","Shader does not contain main function body.");return[]}}class w{constructor(e){this._stage=e,this._entries=new Array}add(e){return this._entries.push(e),this._stage}generateSource(){return this._entries}}class p extends b{constructor(){super(...arguments),this.uniforms=new v(this),this.main=new T(this),this.code=new w(this),this.constants=new r(this)}get builder(){return this}}class y{constructor(){this._entries=new Array}add(e,n){this._entries.push([e,n])}generateSource(e){return e==="fragment"?[]:this._entries.map(n=>`in ${n[1]} ${n[0]};`)}get names(){return this._entries.map(([e])=>e)}}class A{constructor(){this._entries=new Map}add(e,n,t){this._entries.has(e)?l().warn(`Ignoring duplicate varying ${n} ${e}`):this._entries.set(e,{type:n,invariant:t?.invariant??!1})}generateSource(e){const n=new Array;return this._entries.forEach((t,s)=>n.push((t.invariant&&e==="vertex"?"invariant ":"")+(t.type==="int"?"flat ":"")+(e==="vertex"?"out":"in")+` ${t.type} ${s};`)),n}}const c=class c{constructor(){this._entries=new Map}add(e,n,t=0){const s=this._entries.get(t);s?.name!==e||s?.type!==n?this._entries.set(t,{name:e,type:n}):l().warn(`Fragment shader output location ${t} occupied`)}generateSource(e){if(e==="vertex")return[];this._entries.size===0&&this._entries.set(0,{name:c.DEFAULT_NAME,type:c.DEFAULT_TYPE});const n=new Array;return this._entries.forEach((t,s)=>n.push(`layout(location = ${s}) out ${t.type} ${t.name};`)),n}};c.DEFAULT_TYPE="vec4",c.DEFAULT_NAME="fragColor";let m=c;class r{constructor(e){this._stage=e,this._entries=new Set}add(e,n,t){let s="ERROR_CONSTRUCTOR_STRING";switch(n){case"float":s=r._numberToFloatStr(t);break;case"int":s=r._numberToIntStr(t);break;case"uint":s=r._numberToUintStr(t);break;case"bool":s=t.toString();break;case"vec2":s=`vec2(${r._numberToFloatStr(t[0])},                            ${r._numberToFloatStr(t[1])})`;break;case"vec3":s=`vec3(${r._numberToFloatStr(t[0])},                            ${r._numberToFloatStr(t[1])},                            ${r._numberToFloatStr(t[2])})`;break;case"vec4":s=`vec4(${r._numberToFloatStr(t[0])},                            ${r._numberToFloatStr(t[1])},                            ${r._numberToFloatStr(t[2])},                            ${r._numberToFloatStr(t[3])})`;break;case"ivec2":s=`ivec2(${r._numberToIntStr(t[0])},                             ${r._numberToIntStr(t[1])})`;break;case"ivec3":s=`ivec3(${r._numberToIntStr(t[0])},                             ${r._numberToIntStr(t[1])},                             ${r._numberToIntStr(t[2])})`;break;case"ivec4":s=`ivec4(${r._numberToIntStr(t[0])},                             ${r._numberToIntStr(t[1])},                             ${r._numberToIntStr(t[2])},                             ${r._numberToIntStr(t[3])})`;break;case"uvec2":s=`uvec2(${r._numberToUintStr(t[0])},                             ${r._numberToUintStr(t[1])})`;break;case"uvec3":s=`uvec3(${r._numberToUintStr(t[0])},                             ${r._numberToUintStr(t[1])},                             ${r._numberToUintStr(t[2])})`;break;case"uvec4":s=`uvec4(${r._numberToUintStr(t[0])},                             ${r._numberToUintStr(t[1])},                             ${r._numberToUintStr(t[2])},                             ${r._numberToUintStr(t[3])})`;break;case"mat2":case"mat3":case"mat4":s=`${n}(${Array.prototype.map.call(t,i=>r._numberToFloatStr(i)).join(", ")})`}return this._entries.add(`const ${n} ${e} = ${s};`),this._stage}static _numberToIntStr(e){return e.toFixed(0)}static _numberToUintStr(e){return`${e.toFixed(0)}u`}static _numberToFloatStr(e){return Number.isInteger(e)?e.toFixed(1):e.toString()}generateSource(){return Array.from(this._entries)}}const F=`#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  precision highp int;
  precision highp sampler2D;
  precision highp usampler2D;
  precision highp sampler2DArray;
  precision highp sampler2DShadow;
#else
  precision mediump float;
  precision mediump int;
  precision mediump sampler2D;
  precision mediump usampler2D;
  precision mediump sampler2DArray;
  precision mediump sampler2DShadow;
#endif`,E=`precision highp float;
 precision highp int;
 precision highp sampler2D;
 precision highp usampler2D;
 precision highp sampler2DArray;
 precision highp sampler2DShadow;


 invariant gl_Position;
 `;export{I as s};

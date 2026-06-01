import{o as $}from"./BufferObject-A_wxu7ah.js";import{s as c}from"./Program-CVaBX4Ld.js";import{m as b,a as y}from"./Program-CVaBX4Ld.js";import{aD as g}from"./index-zQI5mIlS.js";import{e as F}from"./ShaderCompiler-G2XYGDs6.js";import{h as v}from"./VertexArrayObject-D_4DztbD.js";import{e as w}from"./ProgramTemplate-VO367T0M.js";class u{constructor(e){this._rctx=e,this._store=new Map}dispose(){this._store.forEach(e=>e.dispose()),this._store.clear()}acquire(e,r,t,n){const s=e+r+JSON.stringify(Array.from(t.entries())),o=this._store.get(s);if(o!=null)return o.ref(),o;const f=new c(this._rctx,e,r,t,n);return f.ref(),this._store.set(s,f),f}get test(){}}function p(i){const{options:e,value:r}=i;return typeof e[r]=="number"}function l(i){let e="";for(const r in i){const t=i[r];if(typeof t=="boolean")t&&(e+=`#define ${r}
`);else if(typeof t=="number")e+=`#define ${r} ${t.toFixed()}
`;else if(typeof t=="object")if(p(t)){const{value:n,options:s,namespace:o}=t,f=o?`${o}_`:"";for(const a in s)e+=`#define ${f}${a} ${s[a].toFixed()}
`;e+=`#define ${r} ${f}${n}
`}else{const n=t.options;let s=0;for(const o in n)e+=`#define ${n[o]} ${(s++).toFixed()}
`;e+=`#define ${r} ${n[t.value]}
`}}return e}export{$ as BufferObject,b as FramebufferObject,c as Program,u as ProgramCache,y as Renderbuffer,F as ShaderCompiler,g as Texture,v as VertexArrayObject,w as createProgram,l as glslifyDefineMap};

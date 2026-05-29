import{tZ as f,lN as g,aD as w,fQ as y,cS as v}from"./index-D5tTa6H3.js";import{m as X}from"./Program-BYyhhmB_.js";import{h as Q}from"./VertexArrayObject-Jouvwi2B.js";import{i as A,r as I}from"./TileInfoPrograms-B_1hpUtq.js";import{r as S}from"./VertexBuffer-BAPLf9Ok.js";class m{constructor(s,e,r,n,_,E,o,u,l){this.createQuery=s,this.deleteQuery=e,this.resultAvailable=r,this.getResult=n,this.disjoint=_,this.beginTimeElapsed=E,this.endTimeElapsed=o,this.createTimestamp=u,this.timestampBits=l}}let i=!1;function L(t,s){if(s.disjointTimerQuery)return null;let e=t.getExtension("EXT_disjoint_timer_query_webgl2");return e?new m(()=>t.createQuery(),r=>{t.deleteQuery(r),i=!1},r=>t.getQueryParameter(r,t.QUERY_RESULT_AVAILABLE),r=>t.getQueryParameter(r,t.QUERY_RESULT),()=>t.getParameter(e.GPU_DISJOINT_EXT),r=>{i||(i=!0,t.beginQuery(e.TIME_ELAPSED_EXT,r))},()=>{t.endQuery(e.TIME_ELAPSED_EXT),i=!1},r=>e.queryCounterEXT(r,e.TIMESTAMP_EXT),()=>t.getQuery(e.TIMESTAMP_EXT,e.QUERY_COUNTER_BITS_EXT)):(e=t.getExtension("EXT_disjoint_timer_query"),e?new m(()=>e.createQueryEXT(),r=>{e.deleteQueryEXT(r),i=!1},r=>e.getQueryObjectEXT(r,e.QUERY_RESULT_AVAILABLE_EXT),r=>e.getQueryObjectEXT(r,e.QUERY_RESULT_EXT),()=>t.getParameter(e.GPU_DISJOINT_EXT),r=>{i||(i=!0,e.beginQueryEXT(e.TIME_ELAPSED_EXT,r))},()=>{e.endQueryEXT(e.TIME_ELAPSED_EXT),i=!1},r=>e.queryCounterEXT(r,e.TIMESTAMP_EXT),()=>e.getQueryEXT(e.TIMESTAMP_EXT,e.QUERY_COUNTER_BITS_EXT)):null)}class U{constructor(){this._result=!1}dispose(){this._program=f(this._program)}get result(){return this._program!=null&&(this._result=this._test(this._program),this.dispose()),this._result}}class C extends U{constructor(s){super(),this._rctx=s;const e=`
    precision highp float;

    attribute vec2 position;
    varying vec2 v_uv;

    void main() {
      v_uv = position;
      gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
    }
    `,r=`
    precision highp float;

    varying vec2 v_uv;

    uniform sampler2D u_texture;

    void main() {
      gl_FragColor = texture2D(u_texture, v_uv);
    }
    `;this._program=s.programCache.acquire(e,r,A)}dispose(){super.dispose()}_test(s){const e=this._rctx;if(!e.gl)return s.dispose(),!0;const r=new g(1);r.wrapMode=33071,r.samplingMode=9728;const n=new X(e,r),_=new S(e,I,new Uint16Array([0,0,1,0,0,1,1,1])),E=new Q(e,_),o=new g;o.samplingMode=9729,o.wrapMode=33071;const u=new w(e,o,a);e.useProgram(s),e.bindTexture(u,0),s.setUniform1i("u_texture",0);const l=e.getBoundFramebufferObject(),{x:d,y:c,width:p,height:h}=e.getViewport();e.bindFramebuffer(n),e.setViewport(0,0,1,1),e.setClearColor(0,0,0,0),e.setBlendingEnabled(!1),e.clear(16384),e.bindVAO(E),e.drawArrays(y.TRIANGLE_STRIP,0,4);const T=new Uint8Array(4);return n.readPixels(0,0,1,1,6408,v.UNSIGNED_BYTE,T),E.dispose(),n.dispose(),u.dispose(),e.setViewport(d,c,p,h),e.bindFramebuffer(l),T[0]!==255}}const a=new Image;a.src="data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='5' height='5' version='1.1' viewBox='0 0 5 5' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='5' height='5' fill='%23f00' fill-opacity='.5'/%3E%3C/svg%3E%0A",a.width=5,a.height=5,a.decode();export{L as a,U as t,C as u};

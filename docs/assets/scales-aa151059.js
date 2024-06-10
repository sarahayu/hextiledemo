import{b4 as Ke,b5 as he,b6 as en,b7 as nn,b8 as tn,p as rn}from"./settings-71d1aff4.js";function un(e,n){e=e.slice();var t=0,r=e.length-1,s=e[t],o=e[r],c;return o<s&&(c=t,t=r,r=c,c=s,s=o,o=c),e[t]=n.floor(s),e[r]=n.ceil(o),e}const re=new Date,ue=new Date;function M(e,n,t,r){function s(o){return e(o=arguments.length===0?new Date:new Date(+o)),o}return s.floor=o=>(e(o=new Date(+o)),o),s.ceil=o=>(e(o=new Date(o-1)),n(o,1),e(o),o),s.round=o=>{const c=s(o),y=s.ceil(o);return o-c<y-o?c:y},s.offset=(o,c)=>(n(o=new Date(+o),c==null?1:Math.floor(c)),o),s.range=(o,c,y)=>{const C=[];if(o=s.ceil(o),y=y==null?1:Math.floor(y),!(o<c)||!(y>0))return C;let h;do C.push(h=new Date(+o)),n(o,y),e(o);while(h<o&&o<c);return C},s.filter=o=>M(c=>{if(c>=c)for(;e(c),!o(c);)c.setTime(c-1)},(c,y)=>{if(c>=c)if(y<0)for(;++y<=0;)for(;n(c,-1),!o(c););else for(;--y>=0;)for(;n(c,1),!o(c););}),t&&(s.count=(o,c)=>(re.setTime(+o),ue.setTime(+c),e(re),e(ue),Math.floor(t(re,ue))),s.every=o=>(o=Math.floor(o),!isFinite(o)||!(o>0)?null:o>1?s.filter(r?c=>r(c)%o===0:c=>s.count(0,c)%o===0):s)),s}const G=M(()=>{},(e,n)=>{e.setTime(+e+n)},(e,n)=>n-e);G.every=e=>(e=Math.floor(e),!isFinite(e)||!(e>0)?null:e>1?M(n=>{n.setTime(Math.floor(n/e)*e)},(n,t)=>{n.setTime(+n+t*e)},(n,t)=>(t-n)/e):G);G.range;const b=1e3,x=b*60,L=x*60,k=L*24,ie=k*7,Te=k*30,oe=k*365,Q=M(e=>{e.setTime(e-e.getMilliseconds())},(e,n)=>{e.setTime(+e+n*b)},(e,n)=>(n-e)/b,e=>e.getUTCSeconds());Q.range;const se=M(e=>{e.setTime(e-e.getMilliseconds()-e.getSeconds()*b)},(e,n)=>{e.setTime(+e+n*x)},(e,n)=>(n-e)/x,e=>e.getMinutes());se.range;const on=M(e=>{e.setUTCSeconds(0,0)},(e,n)=>{e.setTime(+e+n*x)},(e,n)=>(n-e)/x,e=>e.getUTCMinutes());on.range;const le=M(e=>{e.setTime(e-e.getMilliseconds()-e.getSeconds()*b-e.getMinutes()*x)},(e,n)=>{e.setTime(+e+n*L)},(e,n)=>(n-e)/L,e=>e.getHours());le.range;const an=M(e=>{e.setUTCMinutes(0,0,0)},(e,n)=>{e.setTime(+e+n*L)},(e,n)=>(n-e)/L,e=>e.getUTCHours());an.range;const B=M(e=>e.setHours(0,0,0,0),(e,n)=>e.setDate(e.getDate()+n),(e,n)=>(n-e-(n.getTimezoneOffset()-e.getTimezoneOffset())*x)/k,e=>e.getDate()-1);B.range;const fe=M(e=>{e.setUTCHours(0,0,0,0)},(e,n)=>{e.setUTCDate(e.getUTCDate()+n)},(e,n)=>(n-e)/k,e=>e.getUTCDate()-1);fe.range;const cn=M(e=>{e.setUTCHours(0,0,0,0)},(e,n)=>{e.setUTCDate(e.getUTCDate()+n)},(e,n)=>(n-e)/k,e=>Math.floor(e/k));cn.range;function Z(e){return M(n=>{n.setDate(n.getDate()-(n.getDay()+7-e)%7),n.setHours(0,0,0,0)},(n,t)=>{n.setDate(n.getDate()+t*7)},(n,t)=>(t-n-(t.getTimezoneOffset()-n.getTimezoneOffset())*x)/ie)}const K=Z(0),$=Z(1),sn=Z(2),ln=Z(3),V=Z(4),fn=Z(5),gn=Z(6);K.range;$.range;sn.range;ln.range;V.range;fn.range;gn.range;function R(e){return M(n=>{n.setUTCDate(n.getUTCDate()-(n.getUTCDay()+7-e)%7),n.setUTCHours(0,0,0,0)},(n,t)=>{n.setUTCDate(n.getUTCDate()+t*7)},(n,t)=>(t-n)/ie)}const Ye=R(0),E=R(1),mn=R(2),hn=R(3),_=R(4),Tn=R(5),yn=R(6);Ye.range;E.range;mn.range;hn.range;_.range;Tn.range;yn.range;const ge=M(e=>{e.setDate(1),e.setHours(0,0,0,0)},(e,n)=>{e.setMonth(e.getMonth()+n)},(e,n)=>n.getMonth()-e.getMonth()+(n.getFullYear()-e.getFullYear())*12,e=>e.getMonth());ge.range;const Mn=M(e=>{e.setUTCDate(1),e.setUTCHours(0,0,0,0)},(e,n)=>{e.setUTCMonth(e.getUTCMonth()+n)},(e,n)=>n.getUTCMonth()-e.getUTCMonth()+(n.getUTCFullYear()-e.getUTCFullYear())*12,e=>e.getUTCMonth());Mn.range;const O=M(e=>{e.setMonth(0,1),e.setHours(0,0,0,0)},(e,n)=>{e.setFullYear(e.getFullYear()+n)},(e,n)=>n.getFullYear()-e.getFullYear(),e=>e.getFullYear());O.every=e=>!isFinite(e=Math.floor(e))||!(e>0)?null:M(n=>{n.setFullYear(Math.floor(n.getFullYear()/e)*e),n.setMonth(0,1),n.setHours(0,0,0,0)},(n,t)=>{n.setFullYear(n.getFullYear()+t*e)});O.range;const A=M(e=>{e.setUTCMonth(0,1),e.setUTCHours(0,0,0,0)},(e,n)=>{e.setUTCFullYear(e.getUTCFullYear()+n)},(e,n)=>n.getUTCFullYear()-e.getUTCFullYear(),e=>e.getUTCFullYear());A.every=e=>!isFinite(e=Math.floor(e))||!(e>0)?null:M(n=>{n.setUTCFullYear(Math.floor(n.getUTCFullYear()/e)*e),n.setUTCMonth(0,1),n.setUTCHours(0,0,0,0)},(n,t)=>{n.setUTCFullYear(n.getUTCFullYear()+t*e)});A.range;function Un(e,n,t,r,s,o){const c=[[Q,1,b],[Q,5,5*b],[Q,15,15*b],[Q,30,30*b],[o,1,x],[o,5,5*x],[o,15,15*x],[o,30,30*x],[s,1,L],[s,3,3*L],[s,6,6*L],[s,12,12*L],[r,1,k],[r,2,2*k],[t,1,ie],[n,1,Te],[n,3,3*Te],[e,1,oe]];function y(h,T,Y){const D=T<h;D&&([h,T]=[T,h]);const w=Y&&typeof Y.range=="function"?Y:C(h,T,Y),I=w?w.range(h,+T+1):[];return D?I.reverse():I}function C(h,T,Y){const D=Math.abs(T-h)/Y,w=Ke(([,,z])=>z).right(c,D);if(w===c.length)return e.every(he(h/oe,T/oe,Y));if(w===0)return G.every(Math.max(he(h,T,Y),1));const[I,q]=c[D/c[w-1][2]<c[w][2]/D?w-1:w];return I.every(q)}return[y,C]}const[Cn,Dn]=Un(O,ge,K,B,le,se);function ae(e){if(0<=e.y&&e.y<100){var n=new Date(-1,e.m,e.d,e.H,e.M,e.S,e.L);return n.setFullYear(e.y),n}return new Date(e.y,e.m,e.d,e.H,e.M,e.S,e.L)}function ce(e){if(0<=e.y&&e.y<100){var n=new Date(Date.UTC(-1,e.m,e.d,e.H,e.M,e.S,e.L));return n.setUTCFullYear(e.y),n}return new Date(Date.UTC(e.y,e.m,e.d,e.H,e.M,e.S,e.L))}function J(e,n,t){return{y:e,m:n,d:t,H:0,M:0,S:0,L:0}}function vn(e){var n=e.dateTime,t=e.date,r=e.time,s=e.periods,o=e.days,c=e.shortDays,y=e.months,C=e.shortMonths,h=X(s),T=d(s),Y=X(o),D=d(o),w=X(c),I=d(c),q=X(y),z=d(y),ee=X(C),ne=d(C),H={a:Ve,A:_e,b:qe,B:ze,c:null,d:ve,e:ve,f:zn,g:et,G:tt,H:Vn,I:_n,j:qn,L:xe,m:Jn,M:Xn,p:Je,q:Xe,Q:pe,s:Fe,S:dn,u:Bn,U:jn,V:Gn,w:$n,W:En,x:null,X:null,y:Kn,Y:nt,Z:rt,"%":we},W={a:de,A:Be,b:je,B:Ge,c:null,d:Se,e:Se,f:ct,g:Mt,G:Ct,H:ut,I:ot,j:at,L:We,m:it,M:st,p:$e,q:Ee,Q:pe,s:Fe,S:lt,u:ft,U:gt,V:mt,w:ht,W:Tt,x:null,X:null,y:yt,Y:Ut,Z:Dt,"%":we},te={a:Ie,A:Ne,b:Ae,B:Ze,c:Re,d:Ce,e:Ce,f:Zn,g:Ue,G:Me,H:De,I:De,j:On,L:An,m:kn,M:In,p:Oe,q:Ln,Q:Pn,s:Qn,S:Nn,u:Yn,U:xn,V:Hn,w:Fn,W:Wn,x:Pe,X:Qe,y:Ue,Y:Me,Z:bn,"%":Rn};H.x=i(t,H),H.X=i(r,H),H.c=i(n,H),W.x=i(t,W),W.X=i(r,W),W.c=i(n,W);function i(a,l){return function(f){var u=[],S=-1,m=0,p=a.length,F,N,me;for(f instanceof Date||(f=new Date(+f));++S<p;)a.charCodeAt(S)===37&&(u.push(a.slice(m,S)),(N=ye[F=a.charAt(++S)])!=null?F=a.charAt(++S):N=F==="e"?" ":"0",(me=l[F])&&(F=me(f,N)),u.push(F),m=S+1);return u.push(a.slice(m,S)),u.join("")}}function v(a,l){return function(f){var u=J(1900,void 0,1),S=j(u,a,f+="",0),m,p;if(S!=f.length)return null;if("Q"in u)return new Date(u.Q);if("s"in u)return new Date(u.s*1e3+("L"in u?u.L:0));if(l&&!("Z"in u)&&(u.Z=0),"p"in u&&(u.H=u.H%12+u.p*12),u.m===void 0&&(u.m="q"in u?u.q:0),"V"in u){if(u.V<1||u.V>53)return null;"w"in u||(u.w=1),"Z"in u?(m=ce(J(u.y,0,1)),p=m.getUTCDay(),m=p>4||p===0?E.ceil(m):E(m),m=fe.offset(m,(u.V-1)*7),u.y=m.getUTCFullYear(),u.m=m.getUTCMonth(),u.d=m.getUTCDate()+(u.w+6)%7):(m=ae(J(u.y,0,1)),p=m.getDay(),m=p>4||p===0?$.ceil(m):$(m),m=B.offset(m,(u.V-1)*7),u.y=m.getFullYear(),u.m=m.getMonth(),u.d=m.getDate()+(u.w+6)%7)}else("W"in u||"U"in u)&&("w"in u||(u.w="u"in u?u.u%7:"W"in u?1:0),p="Z"in u?ce(J(u.y,0,1)).getUTCDay():ae(J(u.y,0,1)).getDay(),u.m=0,u.d="W"in u?(u.w+6)%7+u.W*7-(p+5)%7:u.w+u.U*7-(p+6)%7);return"Z"in u?(u.H+=u.Z/100|0,u.M+=u.Z%100,ce(u)):ae(u)}}function j(a,l,f,u){for(var S=0,m=l.length,p=f.length,F,N;S<m;){if(u>=p)return-1;if(F=l.charCodeAt(S++),F===37){if(F=l.charAt(S++),N=te[F in ye?l.charAt(S++):F],!N||(u=N(a,f,u))<0)return-1}else if(F!=f.charCodeAt(u++))return-1}return u}function Oe(a,l,f){var u=h.exec(l.slice(f));return u?(a.p=T.get(u[0].toLowerCase()),f+u[0].length):-1}function Ie(a,l,f){var u=w.exec(l.slice(f));return u?(a.w=I.get(u[0].toLowerCase()),f+u[0].length):-1}function Ne(a,l,f){var u=Y.exec(l.slice(f));return u?(a.w=D.get(u[0].toLowerCase()),f+u[0].length):-1}function Ae(a,l,f){var u=ee.exec(l.slice(f));return u?(a.m=ne.get(u[0].toLowerCase()),f+u[0].length):-1}function Ze(a,l,f){var u=q.exec(l.slice(f));return u?(a.m=z.get(u[0].toLowerCase()),f+u[0].length):-1}function Re(a,l,f){return j(a,n,l,f)}function Pe(a,l,f){return j(a,t,l,f)}function Qe(a,l,f){return j(a,r,l,f)}function Ve(a){return c[a.getDay()]}function _e(a){return o[a.getDay()]}function qe(a){return C[a.getMonth()]}function ze(a){return y[a.getMonth()]}function Je(a){return s[+(a.getHours()>=12)]}function Xe(a){return 1+~~(a.getMonth()/3)}function de(a){return c[a.getUTCDay()]}function Be(a){return o[a.getUTCDay()]}function je(a){return C[a.getUTCMonth()]}function Ge(a){return y[a.getUTCMonth()]}function $e(a){return s[+(a.getUTCHours()>=12)]}function Ee(a){return 1+~~(a.getUTCMonth()/3)}return{format:function(a){var l=i(a+="",H);return l.toString=function(){return a},l},parse:function(a){var l=v(a+="",!1);return l.toString=function(){return a},l},utcFormat:function(a){var l=i(a+="",W);return l.toString=function(){return a},l},utcParse:function(a){var l=v(a+="",!0);return l.toString=function(){return a},l}}}var ye={"-":"",_:" ",0:"0"},U=/^\s*\d+/,Sn=/^%/,wn=/[\\^$*+?|[\]().{}]/g;function g(e,n,t){var r=e<0?"-":"",s=(r?-e:e)+"",o=s.length;return r+(o<t?new Array(t-o+1).join(n)+s:s)}function pn(e){return e.replace(wn,"\\$&")}function X(e){return new RegExp("^(?:"+e.map(pn).join("|")+")","i")}function d(e){return new Map(e.map((n,t)=>[n.toLowerCase(),t]))}function Fn(e,n,t){var r=U.exec(n.slice(t,t+1));return r?(e.w=+r[0],t+r[0].length):-1}function Yn(e,n,t){var r=U.exec(n.slice(t,t+1));return r?(e.u=+r[0],t+r[0].length):-1}function xn(e,n,t){var r=U.exec(n.slice(t,t+2));return r?(e.U=+r[0],t+r[0].length):-1}function Hn(e,n,t){var r=U.exec(n.slice(t,t+2));return r?(e.V=+r[0],t+r[0].length):-1}function Wn(e,n,t){var r=U.exec(n.slice(t,t+2));return r?(e.W=+r[0],t+r[0].length):-1}function Me(e,n,t){var r=U.exec(n.slice(t,t+4));return r?(e.y=+r[0],t+r[0].length):-1}function Ue(e,n,t){var r=U.exec(n.slice(t,t+2));return r?(e.y=+r[0]+(+r[0]>68?1900:2e3),t+r[0].length):-1}function bn(e,n,t){var r=/^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(n.slice(t,t+6));return r?(e.Z=r[1]?0:-(r[2]+(r[3]||"00")),t+r[0].length):-1}function Ln(e,n,t){var r=U.exec(n.slice(t,t+1));return r?(e.q=r[0]*3-3,t+r[0].length):-1}function kn(e,n,t){var r=U.exec(n.slice(t,t+2));return r?(e.m=r[0]-1,t+r[0].length):-1}function Ce(e,n,t){var r=U.exec(n.slice(t,t+2));return r?(e.d=+r[0],t+r[0].length):-1}function On(e,n,t){var r=U.exec(n.slice(t,t+3));return r?(e.m=0,e.d=+r[0],t+r[0].length):-1}function De(e,n,t){var r=U.exec(n.slice(t,t+2));return r?(e.H=+r[0],t+r[0].length):-1}function In(e,n,t){var r=U.exec(n.slice(t,t+2));return r?(e.M=+r[0],t+r[0].length):-1}function Nn(e,n,t){var r=U.exec(n.slice(t,t+2));return r?(e.S=+r[0],t+r[0].length):-1}function An(e,n,t){var r=U.exec(n.slice(t,t+3));return r?(e.L=+r[0],t+r[0].length):-1}function Zn(e,n,t){var r=U.exec(n.slice(t,t+6));return r?(e.L=Math.floor(r[0]/1e3),t+r[0].length):-1}function Rn(e,n,t){var r=Sn.exec(n.slice(t,t+1));return r?t+r[0].length:-1}function Pn(e,n,t){var r=U.exec(n.slice(t));return r?(e.Q=+r[0],t+r[0].length):-1}function Qn(e,n,t){var r=U.exec(n.slice(t));return r?(e.s=+r[0],t+r[0].length):-1}function ve(e,n){return g(e.getDate(),n,2)}function Vn(e,n){return g(e.getHours(),n,2)}function _n(e,n){return g(e.getHours()%12||12,n,2)}function qn(e,n){return g(1+B.count(O(e),e),n,3)}function xe(e,n){return g(e.getMilliseconds(),n,3)}function zn(e,n){return xe(e,n)+"000"}function Jn(e,n){return g(e.getMonth()+1,n,2)}function Xn(e,n){return g(e.getMinutes(),n,2)}function dn(e,n){return g(e.getSeconds(),n,2)}function Bn(e){var n=e.getDay();return n===0?7:n}function jn(e,n){return g(K.count(O(e)-1,e),n,2)}function He(e){var n=e.getDay();return n>=4||n===0?V(e):V.ceil(e)}function Gn(e,n){return e=He(e),g(V.count(O(e),e)+(O(e).getDay()===4),n,2)}function $n(e){return e.getDay()}function En(e,n){return g($.count(O(e)-1,e),n,2)}function Kn(e,n){return g(e.getFullYear()%100,n,2)}function et(e,n){return e=He(e),g(e.getFullYear()%100,n,2)}function nt(e,n){return g(e.getFullYear()%1e4,n,4)}function tt(e,n){var t=e.getDay();return e=t>=4||t===0?V(e):V.ceil(e),g(e.getFullYear()%1e4,n,4)}function rt(e){var n=e.getTimezoneOffset();return(n>0?"-":(n*=-1,"+"))+g(n/60|0,"0",2)+g(n%60,"0",2)}function Se(e,n){return g(e.getUTCDate(),n,2)}function ut(e,n){return g(e.getUTCHours(),n,2)}function ot(e,n){return g(e.getUTCHours()%12||12,n,2)}function at(e,n){return g(1+fe.count(A(e),e),n,3)}function We(e,n){return g(e.getUTCMilliseconds(),n,3)}function ct(e,n){return We(e,n)+"000"}function it(e,n){return g(e.getUTCMonth()+1,n,2)}function st(e,n){return g(e.getUTCMinutes(),n,2)}function lt(e,n){return g(e.getUTCSeconds(),n,2)}function ft(e){var n=e.getUTCDay();return n===0?7:n}function gt(e,n){return g(Ye.count(A(e)-1,e),n,2)}function be(e){var n=e.getUTCDay();return n>=4||n===0?_(e):_.ceil(e)}function mt(e,n){return e=be(e),g(_.count(A(e),e)+(A(e).getUTCDay()===4),n,2)}function ht(e){return e.getUTCDay()}function Tt(e,n){return g(E.count(A(e)-1,e),n,2)}function yt(e,n){return g(e.getUTCFullYear()%100,n,2)}function Mt(e,n){return e=be(e),g(e.getUTCFullYear()%100,n,2)}function Ut(e,n){return g(e.getUTCFullYear()%1e4,n,4)}function Ct(e,n){var t=e.getUTCDay();return e=t>=4||t===0?_(e):_.ceil(e),g(e.getUTCFullYear()%1e4,n,4)}function Dt(){return"+0000"}function we(){return"%"}function pe(e){return+e}function Fe(e){return Math.floor(+e/1e3)}var P,Le;vt({dateTime:"%x, %X",date:"%-m/%-d/%Y",time:"%-I:%M:%S %p",periods:["AM","PM"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]});function vt(e){return P=vn(e),Le=P.format,P.parse,P.utcFormat,P.utcParse,P}function St(e){return new Date(e)}function wt(e){return e instanceof Date?+e:+new Date(+e)}function ke(e,n,t,r,s,o,c,y,C,h){var T=nn(),Y=T.invert,D=T.domain,w=h(".%L"),I=h(":%S"),q=h("%I:%M"),z=h("%I %p"),ee=h("%a %d"),ne=h("%b %d"),H=h("%B"),W=h("%Y");function te(i){return(C(i)<i?w:y(i)<i?I:c(i)<i?q:o(i)<i?z:r(i)<i?s(i)<i?ee:ne:t(i)<i?H:W)(i)}return T.invert=function(i){return new Date(Y(i))},T.domain=function(i){return arguments.length?D(Array.from(i,wt)):D().map(St)},T.ticks=function(i){var v=D();return e(v[0],v[v.length-1],i??10)},T.tickFormat=function(i,v){return v==null?te:h(v)},T.nice=function(i){var v=D();return(!i||typeof i.range!="function")&&(i=n(v[0],v[v.length-1],i??10)),i?D(un(v,i)):T},T.copy=function(){return tn(T,ke(e,n,t,r,s,o,c,y,C,h))},T}function pt(){return en.apply(ke(Cn,Dn,O,ge,K,B,le,se,Q,Le).domain([new Date(2e3,0,1),new Date(2e3,0,2)]),arguments)}rn().domain([9,14]).range([0,1]).clamp(!0);const Yt=pt().domain([new Date("10/31/1921"),new Date("9/30/2021")]).range([0,1199]).invert;export{Yt as d};

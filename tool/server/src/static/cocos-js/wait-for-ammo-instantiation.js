System.register(["./ammo-instantiated-ba067690.js"],(function(t){"use strict";var e;return{setters:[function(r){e=r.by,t("default",r.gd)}],execute:function(){e._global.atob=function(t){var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",r="",n=0,a=0,i=0,o=0,f=0,c=0,d=0;t=t.replace(/[^A-Za-z0-9\+\/\=]/g,"");do{n=e.indexOf(t.charAt(d++))<<2|(o=e.indexOf(t.charAt(d++)))>>4,a=(15&o)<<4|(f=e.indexOf(t.charAt(d++)))>>2,i=(3&f)<<6|(c=e.indexOf(t.charAt(d++))),r+=String.fromCharCode(n),64!==f&&(r+=String.fromCharCode(a)),64!==c&&(r+=String.fromCharCode(i))}while(d<t.length);return r}}}}));

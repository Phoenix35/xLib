/* Authors: Phoenix35 & Obivous (Kapoeira) */
// new XPath(String XPath_Expression, [Number|Constant XPath Type], [Function XPath namespace]);

var XPath = function (expr, type, nsResolver) {
 // Exceptions thrown
 if(!arguments.length) {
     throw "No argument has been found.";
 }
 if(typeof arguments[0] != "string") {
     throw "Come on... It has to be a string.";
 }
 
 var xpe, xObj;
 
 // /!\ TO DO /!\ \\
 if(navigator.appName.indexOf("Microsoft") == 0) {
     alert("Please use a suitable browser for XPath");
     throw true;
     xpe = new ActiveXObject('msxml2.DOMDocument');
     xpe.setProperty("SelectionLanguage", "XPath");
 }
 else {
     xpe = new XPathEvaluator();   // All browsers implemented it.
 }
 
 if(type === undefined || isNaN(type)) {
     type = 0;                     // ANY_TYPE by default
 }
 
 if(nsResolver === undefined || typeof nsResolver !== "function") {
     nsResolver = xpe.createNSResolver(document.ownerDocument == null ? document.documentElement : document.ownerDocument.documentElement);
 }
 xObj = xpe.evaluate(expr, document, null, type, null);
 if(type === 0) {
     type = xObj.resultType;
 }
 switch (type) {                  // Defining simple properties...
     case 1:
          xObj.value = xObj.numberValue;
     break;
     case 2:
          xObj.value = xObj.stringValue;
     break;
     case 3:
          xObj.value = xObj.booleanValue;
     break;
     case 8:
     case 9:
          xObj.node = xObj.singleNodeValue;
     break;
     default:  // ... and methods
          xObj.nodes = function(number) {
               if(type === 4 || type === 5) {
                    for(i =0; i<number; i++) {
                         xObj.iterateNext();
                    }
                    return xObj.iterateNext();
               }
               else {
                    return xObj.snapshotItem(number);
               }
          }
 }
 
 alert(xObj);
 return xObj;
};
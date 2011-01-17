/* Authors: Phoenix35 & Obivous (Kapoeira) */

// new XPath(XPath Expression, [XPath Type (Number or constant)], [XPath namespace]);

var XPath = function (expr) {
 var xpe;
 if(!arguments.length) {
     throw "No arguments has been found.";
 }
 if(typeof arguments[0] != "string") {
     throw "Come on... It has to be a string.";
 }
 
 if(navigator.appName.indexOf("Microsoft") == 0) {
     alert("Please use a suitable browser for XPath");
     xpe = new ActiveXObject('msxml2.DOMDocument');
     xpe.setProperty("SelectionLanguage", "XPath");
 }
 else {
     xpe = new XPathEvaluator();
 }
 
 this.expr = expr;
};
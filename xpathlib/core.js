/* Authors: Phoenix35 & Obivous (Kapoeira) */
<<<<<<< HEAD

/* Quick introduction
 * -----------------------------------------
 * First off, you need to understand that getXPath is bound to the xLib object. When getXPath is used, it creates another object, called xObj. 
 * Accessing properties of xObj can be done with basic JS properties. However, we added a custom nodes(offset) property.
 * It simplifies and merge snpashotItem() and IterateNext().
 *
 * Example : xLib.getXPath("//html"); alert(xObj.nodes(0).innerHTML)
 * This code is available on the demo page.
 */


var xLib = {
	xpe: null, // XPathEvaluator
	xObj: null,
	
	getXPath: function(expr, type, nsResolver)
	{
		if(!arguments.length)
			xLib.handleError("No argument were found");
		
		if(typeof arguments[0] != "string")
			xLib.handleError("First argument must be a string.");
			
		if(navigator.appName.indexOf("Microsoft") == 0)
		{
			xLib.handleAlert("Please use a suitable browser for XPath");
			
			// Microsoft's XPath implementation is failing.
			throw true; // Will have to be removed when we find a way
			xpe = new ActiveXObject("msxml2.DOMDOcument");
			xpe.setProperty("SelectionLanguage", "XPath");
		}
		else
			xpe = new XPathEvaluator(); // Implemented in anything except IE
			
		// Handling type argument
		if(type === undefined || isNaN(type))
			type = 0; // ANY_TYPE by default
			
		// Handling nsResolver
		if(nsResolver === undefined || typeof nsResolver !== "function")
			nsResolver = xpe.createNSResolver(document.ownerDocument == null ? document.documentElement : document.ownerDocument.documentElement);
			
		// Executing
		xObj = xpe.evaluate(expr, document, null, type, null); // Have to use nsResolver. Not now, got to enhance it.
		
		if (type === 0)
			type = xObj.resultType;
			
		switch (type)
		{
			// Define easy numeric cases
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
				xObj.nodes = function (offset) 
				{
					if(type === 4 || type === 5) 
					{
						for(i = 0 ; i < offset; i++)
							xObj.iterateNext();
						return xObj.iterateNext();
					}
					else
						return xObj.snapshotItem(offset);
				}
				break;
		}
	},
	
	handleError: function(message)
	{
		throw message;
	},
	
	handleAlert: function(message)
	{
		alert(message);
	}
=======
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
>>>>>>> b1289a49a238f144e830a7ed4623687d9e5609cf
};
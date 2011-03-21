/* Authors: Phoenix35 & Obivous (Kapoeira) */

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
			xLib.handleAlert("No argument were found");
		
		if(typeof arguments[0] != "string")
			xLib.handleAlert("First argument must be a string.");
			
		if(navigator.appName.indexOf("Microsoft") == 0)
		{
			xLib.handleAlert("Please use a suitable browser for XPath");
			
			// Microsoft's XPath implementation is failing.
			xLib.handleError(true); // Will have to be removed when we find a way
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
		
		return xObj;
	},
	
	handleError: function(message)
	{
		throw message;
	},
	
	handleAlert: function(message)
	{
		alert(message);
	}
};
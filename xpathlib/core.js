/* xLib		Make JavaScript Simplier 
 * Authors: Phoenix35 & Cron (Kapoeira)
 * Version: 0.5.0
 */

var xLib = {
	/* Retrieve all nodes matching the filter.
	 * Get the Nth you want by using the .nodes(offset) filter.
	 * @param	expr			 String as XPath
	 * @param	type			 Result type
	 * @param	nsResolver	 	 Not yet implemented
	 * @author	Phoenix35
	 */
	getNodesMatchingXPath: function(expr, type, nsResolver)
	{
		if(!arguments.length)
			this.handleAlert("No argument were found");
		
		if(typeof arguments[0] != "string")
			this.handleAlert("First argument must be a string.");
		
		if(navigator.appName.indexOf("Microsoft") == 0)
		{
			this.handleAlert("Please use a suitable browser for XPath");
			
			// Microsoft's XPath implementation is failing.
			this.handleError(true); // Will have to be removed when we find a way
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
	
	/* Generate xPath. This function is recursive and needs this.getIndex(node)
	 * @param	node		The DOM Element from which you get the XPath
	 * @param	depth   	Set it to 0 on first call, it's used to limit the research in iterations
	 * @param	maxDepth	Maximum iteration number
	 * @param	aSentinel	If you don't know what it is, set it to null
	 * @param	aDefaultNS	Default Namespace Resolver. If you don't know, set it to document. This'll be used by kwds['showNS']
	 * @param	kwds		Refer to that for setting it up :
	 *							Setting						Default value			Description
	 *							kwds['toLowercase']			true					Use to define if we want to put the xPath lowercase.		
	 *							kwds['showId']				true					Show ID of the element currently being looped through
	 *							kwds['showClass']			true					Show classes of the lement currently looped through
	 *							kwds['showNS']				false					Display current namespace resolver before tag name in XPath String.
	 * @author	Cron / Kapoeira
	 */
	generateXPathForDomElement: function(node, depth, maxDepth, aSentinel, aDefaultNS, kwds)
	{
		var str = "";
		if(!node)
			return "";
		if(node == aSentinel)
			return ".";
		if((node.parentNode) && (depth < maxDepth))
			str += this.generateXPathForDomElement(node.parentNode, depth + 1, maxDepth, aSentinel, aDefaultNS, kwds);
		
		switch (node.nodeType) 
		{
			case 1: // Element node
			{
				var nname = node.localName;
				var conditions = [];
				var hasId = false;
				
				if (kwds['showClass'] && node.hasAttribute('class')) 
					conditions.push("@class='" + node.getAttribute('class') + "'");
				
				if (kwds['showId'] && node.hasAttribute('id')) 
				{
					conditions.push("@id='" + node.getAttribute('id') + "'");
					hasId = true;
				}
				
				// Not identified by id?
				if (!hasId)
				{
					var index = this.getIndex(node);
					// Has it more than one sibling?
					if (index) 
					{
						// Are there other conditions?
						if (conditions.length > 0) 
							conditions.push('position()='+index);
						else 
							conditions.push(index);
					}
				}
				
				if (kwds['showNS']) // Should we display namespace resolver ?
				{
					if(node.prefix) 
						nname = node.prefix + ":" + nname;
					else if (aDefaultNS) 
						nname = "default:" + nname;
				}
				
				if (kwds['toLowercase']) 
					nname = nname.toLowerCase();
				
				str += "/" + nname;
				
				if(conditions.length > 0) // Append conditions if there are more than one. They were stored in an array
				{ 
					str += "[";
					for (var i = 0; i < conditions.length; i++)
					{
						if (i > 0) str += ' and ';
						str += conditions[i];
					}
					str += "]";
				}
				break;
			}
			case 9: // Document node
				break;
			case 3: // Text node
			{
				str += '/text()';
				var index = this.getIndex(node);
				if (index) str += "[" + index + "]";
				break;
			}
		}
		return str;
	},
	
	/* Gets index of aNode (relative to other same-tag siblings)
	 * @param		aNode		DOMElement
	 * @author		Cron / Kapoeira
	 */
	getIndex: function(aNode){
		var siblings = aNode.parentNode.childNodes;
		var allCount = 0;
		var position;

		if (aNode.nodeType == 1) // Element node
		{
			var name = aNode.nodeName;
			for (var i=0; i<siblings.length; i++)
			{
				var node = siblings.item(i);
				if (node.nodeType == 1)
				{
					if (node.nodeName == name) 
						allCount++;  //nodeName includes namespace
					if (node == aNode) 
						position = allCount;
				}
			}
		}
		else if (aNode.nodeType == 3) // Text node
		{
			for (var i=0; i<siblings.length; i++)
			{
				var node = siblings.item(i);
				if (node.nodeType == 3)
				{
					allCount++;
					if (node == aNode) 
						position = allCount;
				}
			}
		}
		
		if (allCount > 1) 
			return position;
		
		return null;
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
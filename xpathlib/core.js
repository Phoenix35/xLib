/* xLib        Make JavaScript Simplier
 * Authors: Phoenix35 & Cron (Kapoeira)
 * Version: 0.6.0
 * All methods will return null under Microsoft's navigator, except handleError and handleAlert
 */

var xLib = {
    // Defining default values
    xDef: {
        xpathExpression: "",
        contextNode: document,
        namespaceResolver: null,
        resultType: 0,
        result: null
    },

    /*
     * @param    e    XPathExpression (compulsory)
     * @param    c    context
     * @param    n    Namespace resolver
     * @param    t    Result type desired
     * @param    r    Previously created XPathResult object
     */
    init: function(e, c, n, t, r)
    {
     // Handling expression
     this.xDef.xpathExpression = e;

     // Handling context
     if(c !== undefined)
          this.xDef.contextNode = c;

     // Handling namespace
     if(typeof n === "function")
          this.xDef.namespaceResolver = n;

     // Handling type
     if(isFinite(t) && t >= 0 && t <= 9)
          this.xDef.resultType = t;

     // Handling XPathResult
     if(typeof r == "object")  // Improvable
          this.xDef.result = r;
    },


    /* Retrieve all nodes matching the filter.
     * Get the Nth you want by using the .nodes(offset) filter.
     * From the n'th, set and edit attributes.
     * @param    expr          DOMString OR Object
     * @param    type          Result type
     * @param    nsResolver    Not yet implemented (XPathNSResolver)
     * @param    context       Not yet implemented (Node => Document, Element, Attribute, Text, CDATASection, Comment, ProcessingInstruction, or XPathNamespace node)
     * @param    result        Not yet implemented (XPathResult)
     * @author   Phoenix35
     */
    evaluate: function(expr, type, nsResolver, context, result)
    {
     if(this.checkMicrosoft())
         return null;

     if(!arguments.length)
     {
         this.handleAlert("No arguments found");
         return null;
     }

     // Implemented in anything except IE
     var xpe = new XPathEvaluator() || (document.ownerDocument || document);    // context not yet implemented

     if(typeof expr === "object")
     {
         // INVALID_EXPRESSION_ERR
         if(expr.xpathExpression === undefined || typeof expr.xpathExpression !== "string")
         {
             this.handleAlert("First argument must be a string or a valid Object.");
             return null;
         }

         // Call is Object
         // this.init(expr.xpathExpression, expr.contextNode, expr.namespaceResolver, expr.resultType, expr.result);
         this.init(expr.xpathExpression, document, null, expr.resultType, null);
     }
     // INVALID_EXPRESSION_ERR
     else if(typeof expr !== "string")
     {
         this.handleAlert("First argument must be a string or a valid Object.");
         return null;
     }
     else
     {
         /* Not yet implemented
         if(nsResolver === undefined || typeof nsResolver !== "function")
                 nsResolver = xpe.createNSResolver(context.ownerDocument == null ? context.documentElement : context.ownerDocument.documentElement);
         */

         // Call is arguments
         // this.init(expr, context, nsResolver, type, result);
         this.init(expr, document, null, type, null);
     }

     // Executing
     var xObj = xpe.evaluate(this.xDef.xpathExpression, this.xDef.contextNode, this.xDef.namespaceResolver, this.xDef.resultType, this.xDef.result); // Have to use context, nsResolver and result. Not now, got to enhance it.

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
                    if (type === 4 || type === 5)
                    {
                        for(var i = 0 ; i < offset; i++)
                            xObj.iterateNext();
                        var xNode = xObj.iterateNext();
                    }
                    else
                        var xNode =  xObj.snapshotItem(offset);

                    xNode.attribute = function ()
                    {
                        if (!arguments.length)
                        {
                            this.handleAlert('No arguments found');
                            return null;
                        }

                        return (arguments.length > 1) ? this.setAttribute(arguments[0], arguments[1]) : this.getAttribute(arguments[0]);
                    }

                    return xNode;
                }
                break;
        }

        return xObj;
    },

    /* Generate xPath. This function is recursive and needs this.getIndex(node)
     * @param    node        The DOM Element from which you get the XPath
     * @param    depth       Set it to 0 on first call, it's used to limit the research in iterations
     * @param    maxDepth    Maximum iteration number
     * @param    aSentinel    If you don't know what it is, set it to null
     * @param    aDefaultNS    Default Namespace Resolver. If you don't know, set it to document. This'll be used by kwds['showNS']
     * @param    kwds        Refer to that for setting it up :
     *                      Setting                        Default value            Description
     *                      kwds['toLowercase']         true                    Use to define if we want to put the xPath lowercase.
     *                      kwds['showId']              true                    Show ID of the element currently being looped through
     *                      kwds['showClass']           true                    Show classes of the element currently looped through
     *                      kwds['showNS']              false                   Display current namespace resolver before tag name in XPath String.
     * @author    Cron / Kapoeira
     */
    generateXPathForDomElement: function(node, depth, maxDepth, aSentinel, aDefaultNS, kwds)
    {
        if(this.checkMicrosoft())
            return null;

        var str = "";
        if (!node)
            return "";
        if (node == aSentinel)
            return ".";
        if (node.parentNode && depth < maxDepth)
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

                if (conditions.length > 0) // Append conditions if there are more than one. They were stored in an array
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
     * @param        aNode        DOMElement
     * @author        Cron / Kapoeira
     */
    getIndex: function(aNode)
    {
        if(this.checkMicrosoft())
            return null;

        var siblings = aNode.parentNode.childNodes;
        var allCount = 0;
        var position;

        if (aNode.nodeType == 1) // Element node
        {
            var name = aNode.nodeName;
            for (var i=0; i < siblings.length; i++)
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
            for (var i=0; i < siblings.length; i++)
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
    },

    checkMicrosoft: function()
    {
        // End if we are under IE.
        if(/MSIE/.test(navigator.userAgent))
        {
            this.handleAlert("XPath is not handled for HTML tree files");
            return true;
        }
        return false;
    }
};
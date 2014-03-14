String.formatargs = new Object();
String.formatargs.delimiter = "%";
String.formatargs.string = "s";
String.formatargs.float = "f";
String.formatargs.int = "d";

String.prototype.format = function(args)
{
	var str = this;
	var argcnt = 0;
	var ret = "";
	for(var i = 0; i < str.length; i++)
	{
		var c = str[i];
		if(c == String.formatargs.delimiter)
		{
			if(i == str.length - 1)
			{
				throw "String format error: The last char can't be a single percent sign.";
			}
			var cc = str[i + 1];
			if(cc == String.formatargs.delimiter)
			{
				ret += String.formatargs.delimiter;
			}
			else
			{
				if(args.length < argcnt + 1) throw "String format error: Too few arguments for the given formatstring: Formatstring: %s Argnum: %d Arguments: %s".format([str, args.length, JSON.stringify(args)]);
				switch(cc)
				{
					case String.formatargs.string: ret += args[argcnt]; break;
					case String.formatargs.float: ret += args[argcnt].toString(); break;
					case String.formatargs.int: ret += args[argcnt].toString(); break;
					default: throw "String format error: Unknown delimiter sequnce: %s%s".format([String.formatargs.delimiter, cc]);
				}
				argcnt++;
			}
			i++;
		}
		else
		{
			ret += c;
		}
	}
	return ret;
};

tedit = function(domcontid)
{
	this.textformat = new Object();
	this.textformat.formatStart = "[%s]";
	this.textformat.formatEnd = "[/%s]"
	this.textformat.formats = new Array();
	this.textformat.formats["bold"] = {id: "b", style: "font-weight: bold;"};
	this.textformat.formats["italic"] = {id: "i", style: "font-style: italic;"};
	this.autoPreviewUpdate = false;
	this.htmlRepr = ""; 
	var domcont = document.getElementById(domcontid);
	this.createEditor(domcont);
}

tedit.prototype.createEditor = function(domcont)
{
	this.editor = document.createElement("div")
	this.editor.setAttribute("style", this.css.editor);

	var controldiv = document.createElement("div")
	controldiv.setAttribute("style", this.css.controldiv);
	for(var i = 0; i < this.buttons.length; i++)
	{
		var button = this.buttons[i];
		var bt = document.createElement("div");
		var span = document.createElement("span");
		bt.setAttribute("style",this.css.controlbutton);
		bt.setAttribute("id",button.id);
		if((button.img != "") && (button.img != null))
		{
			bt.setAttribute("style",bt.getAttribute("style") + "background-image: " + button.img + ";");
		}
		else
		{
			bt.innerText = button.value;
		}
		bt.addEventListener("click", tedit.buttonClick);
		controldiv.appendChild(bt);
		bt.editor = this;
	}
	var autopreviewdiv = document.createElement("div");
	var autopreviewspan = document.createElement("span");
	var autopreview = document.createElement("input");
	autopreview.setAttribute("type","checkbox");
	autopreview.editor = this;
	autopreview.addEventListener("click", tedit.togglePreview);
	autopreviewdiv.innerText = "Autopreview (on/off):"
	autopreviewdiv.appendChild(autopreviewspan);
	autopreviewdiv.appendChild(autopreview);
	controldiv.appendChild(autopreviewdiv);
	this.editor.appendChild(controldiv);

	this.textarea = document.createElement("textarea");
	this.textarea.setAttribute("style", this.css.textarea);
	this.textarea.editor = this;
	this.textarea.addEventListener("keyup", tedit.textChanged);
	this.editor.appendChild(this.textarea);

	domcont.appendChild(this.editor);
}

tedit.buttonClick = function(event)
{
	var elem = event.target;
	var id = elem.id;
	var editor = elem.editor;
	editor.setTextAttribute(editor.textformat.formats[id].id)
}

tedit.togglePreview = function(event)
{
	event.target.editor.togglePreview(event.target.checked);
}

tedit.prototype.togglePreview = function(state)
{
	this.autoPreviewUpdate = state;
	if(this.autoPreviewUpdate)
	{
		this.showPreview();
	}
	else
	{
		this.editor.removeChild(this.preview);
		this.preview = null;
	}
}

tedit.textChanged = function(event)
{
	event.target.editor.textChanged();
}

tedit.prototype.textChanged = function()
{
	this.updatePreview();
}

tedit.prototype.setTextAttribute = function(attribute)
{
	var selStart = this.textarea.selectionStart;
	var selEnd = this.textarea.selectionEnd;
	var str = this.textarea.value;
	var selStr = str.substring(selStart,selEnd);
	this.textarea.value = "%s%s%s%s%s".format([str.substring(0, selStart), this.textformat.formatStart.format(attribute), selStr, this.textformat.formatEnd.format(attribute), str.substring(selEnd)]);
	this.textarea.selectionDirection = "forward";
	this.textarea.selectionStart = selStart + this.textformat.formatStart.format(attribute).length;
	this.textarea.selectionEnd = selEnd + this.textformat.formatStart.format(attribute).length;
	this.updatePreview();
}

tedit.prototype.updatePreview = function()
{
	if(this.autoPreviewUpdate)
	{
		this.showPreview();
	}
}

tedit.prototype.showPreview = function()
{
	if(this.preview == null)
	{
		this.preview = document.createElement("div");
		this.editor.appendChild(this.preview);
	}
	var key;
	var formatParts = new Array();
	var str = this.textarea.value;
	var parsedStr = str;
	for(key in this.textformat.formats)
	{
		if(!this.textformat.formats.hasOwnProperty(key)) continue;
		var format = this.textformat.formats[key];
		console.log("Format:" + format.id);
		var pos = str.indexOf(this.textformat.formatStart.format(format.id));
		var formatStart = this.textformat.formatStart.format(format.id);
		var formatEnd = this.textformat.formatEnd.format(format.id);
		var end;
		if(pos > -1) parsedStr = str.substring(0, pos);
		while(pos > -1)
		{
			end = str.indexOf(formatEnd, pos);
			if(end == -1) break;
			formatParts.push({type: key, begin: pos, end: end});
			pos = str.indexOf(formatStart, end);
		}
	}
	translation = new Array();
	for(var i = 0; i < str.length; i++)
	{
		translation[i] = i;
	}
	console.log(formatParts.length);
	console.log(formatParts);
	for(var i = 0; i < formatParts.length; i++)
	{
		var part = formatParts[i];
		console.log(part);
		console.log(translation);
		var begin = translation[part.begin];
		var end = translation[part.end];
		console.log("Begin %s; End %s".format([begin, end]));
		var before = parsedStr.substring(0, begin);
		var after = parsedStr.substring(end);
		var text = parsedStr.substring(begin, end);
		var tmpparent = document.createElement("tmp");
		var tmpspan = document.createElement("span");
		tmpspan.setAttribute("style", this.textformat.formats[part.type].style);
		tmpspan.innerHTML = text;
		tmpparent.appendChild(tmpspan)
		var html = tmpparent.innerHTML;
		parsedStr = before + html + after;
		var parts = html.split(text);
		console.log(parts);
		for(var j = begin; j < str.length; j++)
		{
			translation[j] += parts[0].length;
		}
		for(var k = end; k < str.length; k++)
		{
			translation[k] += parts[1].length;
		}
	}
	this.preview.innerHTML = parsedStr;
}

tedit.prototype.css = new Object();
tedit.prototype.css.editor = "margin: 2px; padding: 3px; background-color: #F3F3F3; width: 100%;";
tedit.prototype.css.textarea = "position: relative; width: 100%; height: 100%; background-color: #FFF; padding: 0px; margin: 2px 0px 2px 0px; border: 0px; resize: vertical";
tedit.prototype.css.controldiv = "position: relative; width: 100%; height: auto; background-color: #DDDDDD; padding: 0px; margin: 2px 0px 2px 0px;";
tedit.prototype.css.controlbutton = "width: 32px; height: 32px; overflow: hidden; border-radius: 8px; border-width: 1px; border-style: solid; border-color: #222; display: inline-block; margin: 10px; padding: 2px; cursor: default; background-color: #BBB; ";

tedit.prototype.buttons = new Array();
tedit.prototype.buttons.push({id:"bold", value:"Bold", img:""});
tedit.prototype.buttons.push({id:"italic", value:"Italic", img:"url(\"data:image/png;base64,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\")"});

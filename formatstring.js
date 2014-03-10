//formatstring.js

//Copyright by Tobias Schramm 2014

//See LICENSE for further license details

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
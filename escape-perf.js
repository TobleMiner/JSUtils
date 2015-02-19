#!/usr/bin/env node

function benchmark()
{
	var the_string = "<>&\"";

	var result;

	var now_fast = new Date().getTime();

	var rg1 = /&/g;
	var rg2 = /</g;
	var rg3 = />/g;
	var rg4 = /'/g;
	var rg5 = /"/g;
	 
	function escapeHTML_fast (s) {
		if (!s)
			return s;
		
		return s.replace(rg1, '&amp;')
		        .replace(rg2, '&lt;')
		        .replace(rg3, '&gt;')
		        .replace(rg4, '&#039;')
		        .replace(rg5, '&quot;');
	}

	for (var i = 0; i < 2000000; i++)
	{
		result = escapeHTML_fast(the_string);
	}

	var delta_fast = new Date().getTime() - now_fast;

	var now_slow = new Date().getTime();

	var escapeHTML_slow = function(s) {
		if (!s)
			return s;
		
		return s.replace(/&/g, '&amp;')
		        .replace(/</g, '&lt;')
		        .replace(/>/g, '&gt;')
		        .replace(/'/g, '&#039;')
		        .replace(/"/g, '&quot;');
	};

	for (var i = 0; i < 2000000; i++)
	{
		result = escapeHTML_slow(the_string);
	}

	var delta_slow = new Date().getTime() - now_slow;

	console.log("Simple variant: " + delta_slow + " ms");
	console.log("Complex variant: " + delta_fast + " ms");
}

benchmark();
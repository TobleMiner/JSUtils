'use strict';

const argCharset = 'abcdeghijklmnopqrstuvwxyz';

// Generates comma seperated argument list
function generateArgString(count) {
	let argString = '';
	let prefix = '';
	let charsetPos = 0;
	while(count-- > 0) {
		let suffix = ',';
		if(!count)
			suffix = '';
		argString += prefix + argCharset[charsetPos] + suffix;
		if(++charsetPos == argCharset.length) {
			prefix += argCharset[0];
			charsetPos = 0;
		}
	}
	return argString;
}

/*
 * Get full list of all inherited property names excluding constructors
 * and ones from Object
 */
function getInheritedPropertyNames(proto) {
	let propNames = [];
	while(Object.getPrototypeOf(proto) && proto !== Object.prototype) {
		propNames = propNames.concat(Object.getOwnPropertyNames(proto));
		proto = Object.getPrototypeOf(proto);
	}
	return propNames.filter(key => key !== 'constructor');
}

module.exports = function(...args) {
	// Generate list of arguments dynamically to get correct constructor.length
	let nArgs = args.reduce(((count, clazz) => count + clazz.length), 0);
	let argString = generateArgString(nArgs);
	let mix = new Function('classes, getInheritedPropertyNames', `
		return class {
			constructor(${argString})
			{
				let cargs = [${argString}];
				classes.forEach(clazz => {
					// Clone and expand prototype
					let obj = Object.create(clazz.prototype);

					// Populate cloned prototype
					getInheritedPropertyNames(this.__proto__)
                                                .forEach(prop =>
							obj.__proto__[prop] = this.__proto__[prop]);

					let largs = cargs.splice(0, clazz.length);
					largs.unshift(clazz);
					// Create new object from constructor of populated prototype
					let sub = new
						(Function.prototype.bind
							.apply(obj.__proto__.constructor, largs));
					Object.getOwnPropertyNames(sub).forEach(key => {
						this[key] = sub[key];
					});
				});
			}
		}`
	)(args, getInheritedPropertyNames);

	// Copy over functions
	args.forEach(clazz => {
		getInheritedPropertyNames(clazz.prototype).forEach(key =>
				mix.prototype[key] = clazz.prototype[key]);
	});

	return mix;
};

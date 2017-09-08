'use strict';

module.exports = function(...args) {
	let mix = function(classes) {
		return class {
			constructor(...cargs)
			{
				let clazz;
				while((clazz = classes.shift())) {
					/* Split of arguments that will be consumed
					 * by constructor of clazz
					 */
					let largs = cargs.splice(0, clazz.length);
					// Preprend clazz as this-arg for constructor
					largs.unshift(clazz);
					/* Use function prototype to replace this-arg
					 * of bind method with clazz. This allows to
					 * bind arguements to a constructor, yielding
					 * a bound constructor that can be invoked
					 * with new
					 */
					let sub = new
						(Function.prototype.bind
							.apply(clazz, largs));
					Object.getOwnPropertyNames(sub).forEach(key => {
						this[key] = sub[key];
					});
				}
			}
		}
	}(args.slice());

	let clazz;
	while((clazz = args.shift())) {
		Object.getOwnPropertyNames(clazz.prototype)
			.filter(key => key !== 'constructor')
			.forEach(key => {
				mix.prototype[key] = clazz.prototype[key];
			}
		);
	}

	return mix;
};

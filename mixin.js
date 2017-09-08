'use strict';

module.exports = function(...args) {
	let mix = function(classes) {
		return class {
			constructor(...cargs)
			{
				let clazz;
				while((clazz = classes.shift())) {
					let largs = cargs.splice(0, clazz.length);
					largs.unshift(clazz);
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

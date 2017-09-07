'use strict';

module.exports = function(...args) {
	let mix = function(classes) { 
		return class {
			constructor()
			{
				let clazz;
				while((clazz = classes.pop())) {
					let sub = new clazz();
					Object.getOwnPropertyNames(sub).forEach(key => {
						this[key] = sub[key];
					});
				}
			}
		}
	}(args.slice());

	let clazz;
	while((clazz = args.pop())) {
		Object.getOwnPropertyNames(clazz.prototype)
			.filter(key => key !== 'constructor')
			.forEach(key => {
			mix.prototype[key] = clazz.prototype[key];
		});
	}

	return mix;
};
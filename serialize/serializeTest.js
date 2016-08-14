#!/bin/env node

let Serializeable = require('./serialize');

class Foo extends Serializeable
{
	constructor()
	{
		super();
		this.bar = "I'm foo";
		this.baz = new Baz(this);
	}

	getPackage()
	{
		return './serializeTest';
	}

	getAttributeNames()
	{
		return ['bar', 'baz'];
	}
}

class Baz extends Serializeable
{
	constructor(foo)
	{
		super();
		this.foo = foo;
		this.foobar = "I'm baz";
	}

	getPackage()
	{
		return './serializeTest';
	}

	getAttributeNames()
	{
		return ['foo'];
	}
}

let SERIALIZATION_MAP = {
	Foo: Foo,
	Baz: Baz
};

module.exports = {
	SERIALIZATION_MAP: SERIALIZATION_MAP,
	Foo: Foo,
	Baz: Baz
};

let MEMORY = {};

Serializeable.MEMORY = MEMORY;

let foo = new Foo();

console.log('Original foo:');
console.log(foo);

let id = foo.serialize();

console.log(`Id of foo is ${id}`);

console.log('Serializeable memory:');
console.log(MEMORY);

let serialized = JSON.stringify(MEMORY);
console.log('Serialized memory:');
console.log(serialized);

let hopefullyFoo = Serializeable.deserialize(id);

console.log('Deserialized foo:');
console.log(hopefullyFoo);

let diff = require('deep-diff').diff;

if(diff(foo, hopefullyFoo))
	throw Error('Serialization/Deserialization falied');

console.log('Serialized and unserialized object are equal');

#!/bin/env node

let Serializeable = require('./serialize').Serializeable;

const util = require('util');

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
		this.foobar = null;
		this.brazzers = null;
		this.realitykings = null;
		this.tushy = null;
	}

	setValues(foo)
	{
		this.foobar = "I'm baz";
		this.brazzers = [foo, 'Hello World'];
		this.realitykings = new Map([[this, foo], [foo, this], ['Hello', 'World']]);
		this.tushy = {foo: foo, this: this, Hello: 'World'}
		this.teamskeet = new FooBarBaz(42, 42);
	}

	getPackage()
	{
		return './serializeTest';
	}

	getAttributeNames()
	{
		return ['foo', 'foobar', 'brazzers', 'realitykings', 'tushy', 'teamskeet'];
	}
}

class FooBarBaz // Represents a foreign object I can't optimize for serializeability
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
		this.init(x, y);
	}

	init(x, y)
	{
		console.log(`Some obscure internal function that slaughters kittens and reappoints George W. Bush if initialization parameters are incorrect: (${x}, ${y})`);
	}
}

class FooBarBazWrapper extends Serializeable
{
	constructor(id, obj)
	{
		super();
		this.id = id;
		this.obj = obj;
	}

	serialize()
	{
		let obj = {id: this.getId(), module: this.getPackage(), type: this.constructor.name, data: {}};
		for(let key of this.getAttributeNames())
		{
			let value = this.obj[key];
			if(value instanceof Function)
				continue;
			obj.data[key] = Serializeable.serialize(value);
		}
		Serializeable.MEMORY[this.getId()] = obj;
		return {serialized: true, id: this.getId()};
	}

	deserialize(obj)
	{
		for(let key of this.getAttributeNames())
		{
			obj.data[key] = Serializeable.deserialize(obj.data[key]);
		}
		return new FooBarBaz(obj.data['x'], obj.data['y']);
	}

	getAttributeNames()
	{
		return ['x', 'y'];
	}

	getPackage()
	{
		return './serializeTest';
	}
}

let SERIALIZATION_MAP = {
	Foo: Foo,
	Baz: Baz,
	FooBarBazWrapper: FooBarBazWrapper
};

module.exports = {
	SERIALIZATION_MAP: SERIALIZATION_MAP,
	Foo: Foo,
	Baz: Baz
};

let MEMORY = {};

Serializeable.MEMORY = MEMORY;
Serializeable.addSerializationWrapper(FooBarBaz, FooBarBazWrapper);

let foo = new Foo();
foo.baz.setValues(foo);

console.log('Original foo:');
console.log(util.inspect(foo, {depth: 20}));

let id = Serializeable.serialize(foo);

console.log(`Id of foo is ${id.id}`);

console.log('Serializeable memory:');
console.log(util.inspect(MEMORY, {depth: 20}));

let serialized = JSON.stringify(MEMORY);
console.log('Serialized memory:');
console.log(serialized);

MEMORY = JSON.parse(serialized);

Serializeable.MEMORY = MEMORY;

let hopefullyFoo = Serializeable.deserialize(id);

console.log('Deserialized foo:');
console.log(hopefullyFoo);

let diff = require('deep-diff').diff;

if(diff(foo, hopefullyFoo))
	throw Error('Serialization/Deserialization falied');

console.log('Serialized and unserialized object are equal');

let uuid = require('uuid');

let MEMORY = {};

class Serializeable
{
	static set MEMORY(mem)
	{
		MEMORY = mem;
	}

	static get MEMORY()
	{
		return MEMORY;
	}

	static deserialize(obj)
	{
		if(!(obj.serialized))
			return obj.data;
		if(Serializeable.deserializationCache.has(obj.id))
			return Serializeable.deserializationCache.get(obj.id);
		obj = MEMORY[obj.id];
		let module = obj.module;
		let classMap = SERIALIZATION_MAP;
		if(module)
			classMap = require(module).SERIALIZATION_MAP;
		let clazz = classMap[obj.type];
		let instance = new clazz();
		Serializeable.deserializationCache.set(obj.id, instance);
		instance.id = obj.id;
		return instance.deserialize(obj);
	}

	static serialize(obj)
	{
		if(!(obj instanceof Object))
			return {serialized: false, data: obj};
		if(Serializeable.serializationCache.has(obj))
			return Serializeable.serializationCache.get(obj);
		if(obj instanceof Serializeable)
		{
			Serializeable.serializationCache.set(obj, {serialized: true, id: obj.getId()});
			return obj.serialize();
		}
		let id = uuid.v4();
		Serializeable.serializationCache.set(obj, {serialized: true, id: id});
		if(obj instanceof Array)
			return new SerializeableArray(id, obj).serialize();
		if(obj instanceof Map)
			return new SerializeableMap(id, obj).serialize();
		if(obj instanceof Object)
			return new SerializeableObject(id, obj).serialize();
	}

	static clearSerializationCache()
	{
		Serializeable.serializationCache.clear();
	}

	static clearDeserializationCache()
	{
		Serializeable.deserializationCache.clear();
	}

	constructor()
	{
		this.id = uuid.v4();
	}

	getAttributeNames()
	{
		return [];
	}

	getId()
	{
		return this.id;
	}

	getPackage()
	{
		return null;
	}

	serialize()
	{
		let obj = {id: this.getId(), module: this.getPackage(), type: this.constructor.name, data: {}};
		for(let attr of this.getAttributeNames())
			obj.data[attr] = Serializeable.serialize(this[attr]);
		MEMORY[this.getId()] = obj;
		return {serialized: true, id: this.getId()};
	}

	deserialize(obj)
	{
		for(let key in obj.data)
		{
			let entry = obj.data[key];
			this[key] = Serializeable.deserialize(entry);
		}
		return this;
	}
}

Serializeable.serializationCache = new Map();
Serializeable.deserializationCache = new Map();

class SerializeableMap extends Serializeable
{
	constructor(id, map=new Map())
	{
		super();
		this.id = id;
		this.map = map;
	}

	serialize()
	{
		let obj = {id: this.getId(), module: this.getPackage(), type: this.constructor.name, keys: [], values: []};
		for(let key of this.map.keys())
		{
			obj.keys.push(Serializeable.serialize(key));
			obj.values.push(Serializeable.serialize(this.map.get(key)));
		}
		MEMORY[this.getId()] = obj;
		return {serialized: true, id: this.getId()};
	}

	deserialize(obj)
	{
		for(let i = 0; i < obj.keys.length; i++)
			this.map.set(Serializeable.deserialize(obj.keys[i]), Serializeable.deserialize(obj.values[i]));
		return this.map;
	}
}

class SerializeableArray extends Serializeable
{
	constructor(id, data=[])
	{
		super();
		this.id = id;
		this.data = data;
	}

	serialize()
	{
		let obj = {id: this.getId(), module: this.getPackage(), type: this.constructor.name, data: {}};
		for(let key in this.data)
		{
			let value = this.data[key];
			obj.data[key] = Serializeable.serialize(value);
		}
		MEMORY[this.getId()] = obj;
		return {serialized: true, id: this.getId()};
	}

	deserialize(obj)
	{
		for(let key in obj.data)
		{
			let entry = obj.data[key];
			this.data[key] = Serializeable.deserialize(entry);
		}
		return this.data;
	}
}

class SerializeableObject extends Serializeable
{
	constructor(id, obj={})
	{
		super();
		this.id = id;
		this.obj = obj;
	}

	serialize()
	{
		let obj = {id: this.getId(), module: this.getPackage(), type: this.constructor.name, data: {}};
		for(let attr in this.obj)
			obj.data[attr] = Serializeable.serialize(this.obj[attr]);
		MEMORY[this.getId()] = obj;
		return {serialized: true, id: this.getId()};
	}

	deserialize(obj)
	{
		for(let key in obj.data)
		{
			let entry = obj.data[key];
			this.obj[key] = Serializeable.deserialize(entry);
		}
		return this.obj;
	}
}

let SERIALIZATION_MAP = {
	SerializeableMap: SerializeableMap,
	SerializeableArray: SerializeableArray,
	SerializeableObject: SerializeableObject
};

module.exports = Serializeable;

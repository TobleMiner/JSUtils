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

	static addSerializationWrapper(type, wrapper)
	{
		Serializeable.SERIALIZATION_WRAPPERS.set(type, wrapper);
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
		for(let type of Serializeable.SERIALIZATION_WRAPPERS.keys())
		{
			if(obj instanceof type)
				return new (Serializeable.SERIALIZATION_WRAPPERS.get(type))(id, obj).serialize();
		}
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
Serializeable.SERIALIZATION_WRAPPERS = new Map();

class SerializationWrapper extends Serializeable
{
	constructor(id, obj)
	{
		super();
		this.id = id;
		this.obj = obj;
	}

	storeAndGetId(obj)
	{
		MEMORY[this.getId()] = obj;
		return {serialized: true, id: this.getId()};
	}
}

class SerializeableMap extends SerializationWrapper
{
	constructor(id, map=new Map())
	{
		super(id, map);
	}

	serialize()
	{
		let obj = {id: this.getId(), module: this.getPackage(), type: this.constructor.name, keys: [], values: []};
		for(let key of this.obj.keys())
		{
			let value = this.obj.get(key);
			if(value instanceof Function)
				continue;
			obj.keys.push(Serializeable.serialize(key));
			obj.values.push(Serializeable.serialize(value));
		}
		return this.storeAndGetId(obj);
	}

	deserialize(obj)
	{
		for(let i = 0; i < obj.keys.length; i++)
			this.obj.set(Serializeable.deserialize(obj.keys[i]), Serializeable.deserialize(obj.values[i]));
		return this.obj;
	}
}

Serializeable.addSerializationWrapper(Map, SerializeableMap);

class SerializeableArray extends SerializationWrapper
{
	constructor(id, data=[])
	{
		super(id, data);
	}

	serialize()
	{
		let obj = {id: this.getId(), module: this.getPackage(), type: this.constructor.name, data: {}};
		for(let key in this.obj)
		{
			let value = this.obj[key];
			if(value instanceof Function)
				continue;
			obj.data[key] = Serializeable.serialize(value);
		}
		return this.storeAndGetId(obj);
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

Serializeable.addSerializationWrapper(Array, SerializeableArray);

class SerializeableObject extends SerializationWrapper
{
	constructor(id, obj={})
	{
		super(id, obj);
	}

	serialize()
	{
		let obj = {id: this.getId(), module: this.getPackage(), type: this.constructor.name, data: {}};
		for(let attr in this.obj)
		{
			if(this.obj[attr] instanceof Function)
				continue;
			obj.data[attr] = Serializeable.serialize(this.obj[attr]);
		}
		return this.storeAndGetId(obj);
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

module.exports = {
	Serializeable: Serializeable,
	SerializationWrapper: SerializationWrapper
};

let uuid = require('uuid');

let MEMORY = {};

let SERIALIZATION_MAP = {};

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

	static deserialize(id)
	{
		let obj = MEMORY[id];
		let module = obj.module;
		let classMap = SERIALIZATION_MAP;
		if(module)
			classMap = require(module).SERIALIZATION_MAP;
		let clazz = classMap[obj.type];
		let instance = new clazz();
		instance.id = obj.id;
		for(let key in obj.data)
			instance[key] = obj.data[key];
		Serializeable.deserializationCache.set(id, instance);
		for(let key in obj.serialized)
		{
			let id = obj.serialized[key];
			if(Serializeable.deserializationCache.has(id))
				instance[key] = Serializeable.deserializationCache.get(id);
			else
				instance[key] = Serializeable.deserialize(id);
		}
		return instance;
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
		let obj = {id: this.getId(), module: this.getPackage(), type: this.constructor.name, data: {}, serialized: {}};
		Serializeable.serializationCache.set(this.getId(), obj);
		for(let attr of this.getAttributeNames())
		{
			if(this[attr] instanceof Serializeable)
			{
				if(Serializeable.serializationCache.has(this[attr].getId()))
				{
					obj.serialized[attr] = this[attr].getId();
				}
				else
					obj.serialized[attr] = this[attr].serialize();
			}
			else
				obj.data[attr] = this[attr];
		}
		MEMORY[this.getId()] = obj;
		return this.getId();
	}
}

Serializeable.serializationCache = new Map();
Serializeable.deserializationCache = new Map();

module.exports = Serializeable;

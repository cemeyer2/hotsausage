

	cloneTypes
	
	classesForClones =
	classForClone = name;
	typeName = Function("")
	
	
	Eve.method("copyNamed", function (name) {
		var namedCopy = this.copy().setName(name);
		if (name.charAt(0).isCapital) {
			createConstructorForClone(name, namedCopy);
		}
		return namedCopy;
	});
	
	createConstructorForClone = function (className, canonicalInstance) {
		if (Module[className]) {
			throw Error("Class " + className + "already defined!");
		}
		var constructor = function type(/* args */) {
			if (this instanceof type) {
				return canonicalInstance.cloneWith(arguments);
			}
			if (arguments.length > 0) {throw Error("Not expecting any arguments!");}
			return canonicalInstance;
		};
		return (Module[className] = constructor);
	};
	
	List = function (elements) {
		if (this instanceof arguments.callee) {
			if (arguments.length > 0) {throw Error("Not expecting any arguments!");}
			return canonicalInstance;
		}
		return canonicalInstance.copyWith(elements);
	}
	
		
	
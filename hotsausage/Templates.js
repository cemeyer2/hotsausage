"use strict";

/*jslint undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */

HotSausage.newSubmodule("Templates", function (Templates, _Templates_HS) {
	// var HS = Templates.module();
	var _newObject = _Templates_HS.newObject;
	var _hasLocalPublicProperty = _Templates_HS.hasLocalPublicProperty;
	var _handleError = _Templates_HS.handleError;
	
	var _dontOverwriteExistingTemplates = true;
	var NEW_INSTANCE = "newInstance";
	
	var _createPurseAccessor = function directPropertyAccess(purse) {return purse;};
	// HS.Privacy should replace this method with the following
	// var _createPurseAccessor = HS.Privacy._createProtectedAccessorFor;
	
	var _purseOf = function (target) {return target._purse;};
	// HS.Privacy should replace this method with the following
	// var _purseOf = HS.Privacy._purseOf(target);
	
	var __putMethod = function (target, targetBD, methodName, method) {
		target[methodName] = method;
		targetBD.methods[methodName] = method;
		return (targetBD.methodCount += 1);
	};

	var __deleteMethod = function (target, targetBD, methodName) {
		if (methodName in targetBD.methods) {
			delete target[methodName];
			delete targetBD.methods[methodName];
			return (targetBD.methodCount -= 1);
		}
		return targetBD.methodCount;
	};
	
	var __ensureMethodDictionary = function (targetBD) {
		if (targetBD.methods) {return;}
		targetBD.methods = _newObject();
		targetBD.methodCount = 0;
	};

	var __deleteMethodDictionary = function (targetBD) {
		delete targetBD.methods;
		delete targetBD.methodCount;
	};
	
	var __copyMethodDictionary = function (target, targetBD, sourceBD) {
		var methods = sourceBD.methods;
		var methodName;
		if (methods === undefined) {return;}
		for (methodName in methods) {
			__putMethod(target, targetBD, methodName, methods[methodName]);
		}
	};
	
	var __copyMethods = function (target, targetBD, sourceInstanceBD, sourceTemplateBD) {
		var snapshotBD = sourceInstanceBD.delegateBD;
		if (snapshotBD !== sourceTemplateBD) {
			__copyMethodDictionary(target, targetBD, snapshotBD);
		}
		__copyMethodDictionary(target, targetBD, sourceInstanceBD);
	};

	var __setInstanceId = function (instanceBD) {
		var templateBD = instanceBD.templateBD;
		instanceBD.instanceId = (templateBD.instanceCount += 1);
	};
	
	var __setSnapshotId = function (instanceBD) {
		var templateBD = instanceBD.templateBD;
		instanceBD.snapshotId = (templateBD.snapshotCount += 1);
	};
			
	var __attachPurse = function (target, targetBD) {
		var purse = _newObject(target);
		purse.owner = target;
		purse._hsbd = targetBD;
		target._purse = _createPurseAccessor(purse);
		return purse;
	};

	var __attachMethod_newInstance = function (behavior, behavioralData) {
		var _InstanceObject = behavioralData.InstanceObject;
		var _BehavioralDataObject = behavioralData.BehavioralDataObject;
		__putMethod(behavior, behavioralData, NEW_INSTANCE, function newInstance() {
			var instance = new _InstanceObject();
			var instanceBD = new _BehavioralDataObject();
			__attachPurse(instance, instanceBD);
			__setInstanceId(instanceBD);
			return instance;
		});
	};
	
	var __newBehavioralData = function (behavior, sharedBD) {
		var InstanceObject = function () {};
		var BehavioralDataObject = function () {};
		var behavioralData;
		InstanceObject.prototype = behavior;
		BehavioralDataObject.prototype = sharedBD; 
		behavioralData = new BehavioralDataObject();
		behavioralData.InstanceObject = InstanceObject;
		behavioralData.BehavioralDataObject = BehavioralDataObject;
		return behavioralData;
	};
	
	var _newBehaviorSnapshotFrom = function (sourceInstance) {
		var sourceInstanceBD = _purseOf(sourceInstance)._hsbd;
		var sourceTemplateBD = sourceInstanceBD.templateBD;

		var snapshot = new sourceTemplateBD.InstanceObject();
		var sharedBD = new sourceTemplateBD.BehavioralDataObject();
		var snapshotBD = __newBehavioralData(snapshot, sharedBD);
		
		__attachMethod_newInstance(snapshot, snapshotBD);
		__ensureMethodDictionary(snapshotBD);
		__copyMethods(snapshot, snapshotBD, sourceInstanceBD, sourceTemplateBD);
		
		sharedBD.snapshotId = sourceInstanceBD.snapshotId;
		sharedBD.delegateBD = snapshotBD;
		return snapshot;
	};
	
	var _deferred_newInstance = function () {
		var behaviorSnapshot = _newBehaviorSnapshotFrom(this);
		var deferred_newInstance = behaviorSnapshot.newInstance;
		this.newInstance = behaviorSnapshot.newInstance;
		return deferred_newInstance();
	};
	
	var _hasIdenticalImplementation = function (method, impFunc, isDelegatingMethod_) {
		if (method == impFunc) {return true;}  // Intentionally used == instead of ===
		if (isDelegatingMethod_) {
			return _purseOf(method).implementation === impFunc;
		}
		return false;
	};
	
	var _newDelegatingMethod = function (implementor, name, _impFunc) {
		return function delegatingMethod(/* arguments */) {
			var purse = _purseOf(this);
			var answer = _impFunc.apply(purse, arguments);
			return (answer === purse) ? purse.owner : answer;
		};
	};
	// HS.Privacy should replace this method with the following
	// var _newDelegatingMethod = HS.Privacy._newPrivilegedMethod
	// Note: the method's signature contains three args (even though only one is necessary)
	// to match the method signature of HS.Privacy._newPrivilegedMethod
	
	var _asDelegatingMethod = function (implementor, name, impFunc) {
		var method = _newDelegatingMethod(implementor, name, impFunc);
		var purse = __attachPurse(method, null);
		purse.implementation = impFunc;
		return method;
	};
	
	var _setMethod = function (target, methodName, impFunc, isDelegating_) {
		var targetBD = _purseOf(target)._hsbd;
		var delegateBD = targetBD.delegateBD;
		var localMethodCount, method;
		
		if (_hasIdenticalImplementation(delegateBD.methods[methodName], impFunc, isDelegating_)) {
			localMethodCount = __deleteMethod(target, targetBD, methodName);
			if (localMethodCount <= 0) {__deleteMethodDictionary(targetBD);}
			return;
		}
		if (targetBD.templateBD === targetBD || target.newInstance === _deferred_newInstance) {
			// target is template or has local methods but no copies yet
		} else {
			// target is either adding its first local method, or has already spawned 
			// a snapshot behavior, and since doing so, is adding a new local method again.
			target.newInstance = _deferred_newInstance;
			__ensureMethodDictionary(targetBD);
			__setSnapshotId(targetBD);
		}
		method = isDelegating_ ? _asDelegatingMethod(target, methodName, impFunc) : impFunc;
		__putMethod(target, targetBD, methodName, method);
	};	

	var _onUnexpectedConstructorArguments = function (template) {
		_handleError(
			"UnexpectedConstructorArguments", 
			"No arguments expected to simply return the " + template.name() + " template object!"
		);
		return template;
	};

	var _newSafeDualUseConstructor = function (_template, templatePrototype) {
		var constructor = function CopyFromUsingNewOnTemplate(/* arguments */) {
			var newInstance;
			if (this instanceof CopyFromUsingNewOnTemplate) {
				newInstance = _template.newInstance();
				_template.initFromArgs.apply(newInstance, arguments);
				return newInstance;
			}
			if (arguments.length > 0) {return _onUnexpectedConstructorArguments(_template);}
			return _template;
		};
		constructor.prototype = templatePrototype;
		return constructor;
	};

	var _onNameForTemplateAlreadyAssigned = function (module, name) {
		_handleError(
			"CannotCreateTemplateName",
			"Property " + name + "already defined in " + module.toString()
		);
	};

	var _attachFactoryMethod = function (templateName, factoryMethod, targetModule_) {
		var module = targetModule_ || Templates;
		if (module[templateName]) {
			_onNameForTemplateAlreadyAssigned(module, templateName);
			if (_dontOverwriteExistingTemplates) {return null;}
		}
		return (module[templateName] = factoryMethod);
	};
	
	var _newTemplate = function (sourceInstance, name, targetModule_) {
		var sourceInstanceBD = _purseOf(sourceInstance)._hsbd;
		var sourceTemplateBD = sourceInstanceBD.templateBD;

		var templatePrototype = new sourceTemplateBD.InstanceObject();
		var template = _newObject(templatePrototype);
		var factoryMethod = _newSafeDualUseConstructor(template, templatePrototype);

		var sharedBD = new sourceTemplateBD.BehavioralDataObject();
		var templateBD = __newBehavioralData(template, sharedBD);
		
		__attachPurse(template, templateBD);
		__attachMethod_newInstance(template, templateBD);
		__ensureMethodDictionary(templateBD);
		if (sourceInstanceBD !== sourceTemplateBD) {
			__copyMethods(template, templateBD, sourceInstanceBD, sourceTemplateBD);
		}
		sharedBD.snapshotId = 0;
		sharedBD.delegateBD = templateBD;
		sharedBD.templateBD = templateBD;	
		sharedBD.template = template;
		
		templateBD.basicName = name;
		templateBD.instanceCount = 0;
		templateBD.snapshotCount = 0;
		templateBD.template = sourceInstanceBD.template;
		templateBD.delegateBD = sourceTemplateBD;

		_attachFactoryMethod(name, factoryMethod, targetModule_);
		return template;
	};
	
	var __bdBasicName = function (targetBD) {
		var templateBD = targetBD.templateBD;
		var name = templateBD.basicName;
		var instanceId, snapshotId, snapshotText;
		if (targetBD === templateBD) {return name;}
		instanceId = targetBD.instanceId;
		snapshotId = targetBD.snapshotId;
		snapshotText = snapshotId ? ":s" + snapshotId : "";
		if (instanceId === undefined) {return ["_", name, snapshotText].join("");}
		return [name.charAt(0).toLowerCase(), name.slice(1), instanceId, snapshotText].join("");
	};

	var _basicName = function (target) {
		return __bdBasicName(_purseOf(target)._hsbd);
	};
	
	var _copyPurseFromTo = function (sourceInstance, targetInstance) {
		var sourcePurse = _purseOf(sourceInstance);
		var targetPurse = _purseOf(targetInstance);
		var propertyName;
		for (propertyName in sourcePurse) {
			if (_hasLocalPublicProperty(sourcePurse, propertyName)) {
				targetPurse[propertyName] = sourcePurse[propertyName];
			}
		}
	};
	
	var _hasSameStateAs = function (instanceA, instanceB) {
		var purseA = _purseOf(instanceA);
		var purseB = _purseOf(instanceB);
		var localStateA = _newObject();
		var propertyName;
		for (propertyName in purseA) {
			if (_hasLocalPublicProperty(purseA, propertyName)) {
				localStateA[propertyName] = purseA[propertyName];
			}
		}
		for (propertyName in purseB) {
			if (_hasLocalPublicProperty(purseB, propertyName)) {
				if (purseB[propertyName] !== localStateA[propertyName]) {return false;}
				delete localStateA[propertyName];
			}
		}
		for (propertyName in localStateA) {
			if (localStateA[propertyName] !== undefined) {return false;}
		}
		return true;
	};
	
	var _template = function (target) {
		return _purseOf(target)._hsbd.template;
	};

	var _isTemplate = function (target) {
		var targetBD = _purseOf(target)._hsbd;
		return targetBD.templateBD === targetBD;
	};

	var templateInstance0 = (function bootstrap() {
		var bootstrapInstance = _newObject();
		var bootstrapBD = __newBehavioralData(Object.prototype, null);
		__attachPurse(bootstrapInstance, bootstrapBD);
		__ensureMethodDictionary(bootstrapBD);
		bootstrapBD.templateBD = bootstrapBD;
		bootstrapBD.template = null;
		bootstrapBD.basicName = "_NULL_";
		// This function is very similar to _newTemplate but the 
		// following functions and properties are not needed:
		//    __attachMethod_newInstance(), __copyMethods()
		//    snapshotId, delegateBD, instanceCount, snapshotCount
		bootstrapBD.name = function () {
			return __bdBasicName(this) + "-BD";
		};
		return _newTemplate(bootstrapInstance, "Clone");
	})();
	
	_setMethod(templateInstance0, "basicMethod", function (methodName, impFunc) {
		_setMethod(this, methodName, impFunc, false);
	});

	_setMethod(templateInstance0, "method", function (methodName, impFunc) {
		_setMethod(this, methodName, impFunc, true);
	});
	
	templateInstance0.basicMethod("removeMethod", function (methodName) {
		_setMethod(this, methodName, null);
	});
	
	templateInstance0.basicMethod("template", function () {return _template(this);});
		
	templateInstance0.basicMethod("isTemplate", function () {return _isTemplate(this);});

	templateInstance0.basicMethod("isIdentical", function (that) {return (this === that);});

	templateInstance0.basicMethod("isSameTypeAs", function (that) {
		if (this === that) {return true;}
		return this.type() === that.type();
		// return (this.template() === that.template());
	});

	templateInstance0.basicMethod("hasIdenticalBehaviorAs", function (that) {
		// if (this === that) {return true;}
		return (this.newInstance === that.newInstance);
	});

	templateInstance0.basicMethod("hasSameBehaviorAs", function (that) {
		// This method can be overridden.
		return this.hasIdenticalBehaviorAs(that);
	});

	templateInstance0.basicMethod("isSameAs", function (that) {
		if (this === that) {return true;}
		return (this.hasSameBehaviorAs(that) && _hasSameStateAs(this, that));
	});
	
	templateInstance0.basicMethod("blankCopy", templateInstance0.newInstance);
	
	templateInstance0.basicMethod("copyAsTemplate", function (templateName, targetModule_) {
		return _newTemplate(this, templateName, targetModule_);
	});
	
	templateInstance0.basicMethod("basicName", function () {return _basicName(this);});
	
	templateInstance0.basicMethod("basicType", templateInstance0.basicName);
	
	templateInstance0.method("name", function () {
		var name = this.name;
		return name ? name : this.basicName();
	});

	templateInstance0.method("setName", function (name) {this.name = name;});
	
	templateInstance0.method("type", function () {
		// This method can be overridden.
		var type = this.type;
		return type ? type : this.basicType();
	});

	templateInstance0.method("setName", function (type) {this.type = type;});	
	
	templateInstance0.method("isEqualTo", function (that) {
		// One SHOULD CONSIDER overriding this method.
		// return this.isIdentical(that);
		return this.isSameAs(that);
	});

	templateInstance0.method("copy", function () {
		// One SHOULD CONSIDER overriding this method.
		var newInstance = this.newInstance();
		_copyPurseFromTo(this. newInstance);
		return newInstance;
	});	
	
	templateInstance0.method("initFromArgs", function (/* optional args */) {
		// One SHOULD REIMPLEMENT this method to initialize a new blank instance copy.
	});
});

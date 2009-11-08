"use strict";

/*jslint undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */

HotSausage.newSubmodule("Templates", function (Templates, _Templates_HS) {
	var HS = Templates.module();
	var _newObject = _Templates_HS.newObject;
	var _hasLocalProperty = _Templates_HS.hasLocalProperty;
	var _isPublic = HS.isPublic;
	var _dontOverwriteExistingTemplates = true;
	var NEW_INSTANCE = "newInstance";
	
	var _createPurseAccessor = HS.createConstantAccessor;  
	// HS.Privacy should replace this method with the following
	// var _createPurseAccessor = HS.Privacy._createProtectedAccessorFor;
	
	var _purseOf = function (target) {return target._purse();};
	// HS.Privacy should replace this method with the following
	// var _purseOf = function (target) {return target._purse(_TrustedModuleKey);};
	
	var __putMethod = function (target, targetBD, methodName, impFunc) {
		target[methodName] = impFunc;
		targetBD.methods[methodName] = impFunc;
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
	
	var _template = function (target) {
		return _purseOf(target)._hsbd.template;
	};

	var _isTemplate = function (target) {
		return (target === _template(target));
	};
	
	var __attachPurse = function (target, targetBD) {
		var purse = _newObject();
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
		
	var _setMethod = function (target, methodName, impFunc) {
		var targetBD = _purseOf(target)._hsbd;
		var delegateBD = targetBD.delegateBD;
		var localMethodCount;
		
		if (delegateBD.methods[methodName] === impFunc) {
			localMethodCount = __deleteMethod(target, targetBD, methodName);
			if (localMethodCount <= 0) {__deleteMethodDictionary(targetBD);}
			return;
		}
		if (_isTemplate(target) || target.newInstance === _deferred_newInstance) {
			// target is template or has local methods but no copies yet
		} else {
			// target is either adding its first local method, or has already spawned 
			// a snapshot behavior, and since doing so, is adding a new local method again.
			target.newInstance = _deferred_newInstance;
			__ensureMethodDictionary(targetBD);
			__setSnapshotId(targetBD);
		}
		__putMethod(target, targetBD, methodName, impFunc);
	};	

	var _onUnexpectedConstructorArguments = function (template) {
		HS.handleError(
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
				newInstance.initFromArgs(arguments);
				return newInstance;
			}
			if (arguments.length > 0) {return _onUnexpectedConstructorArguments(_template);}
			return _template;
		};
		constructor.prototype = templatePrototype;
		return constructor;
	};

	var _onNameForTemplateAlreadyAssigned = function (module, name) {
		HS.handleError(
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
	
	var __basicName = function (targetBD) {
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
		return __basicName(_purseOf(target)._hsbd);
	};
	
	var _name = function (target) {
		var purse = _purseOf(target);
		var name = purse.name;
		if (name) {return name;}
		return __basicName(purse._hsbd);
	};

	var _copyPurseFromTo = function (sourceInstance, targetInstance) {
		var sourcePurse = _purseOf(sourceInstance);
		var targetPurse = _purseOf(targetInstance);
		var propertyName;
		for (propertyName in sourcePurse) {
			if (_isPublic(propertyName) && _hasLocalProperty(sourcePurse, propertyName)) {
				targetPurse[propertyName] = sourcePurse[propertyName];
			}
		}
	};
	
	var _hasSameStateAs = function (a, b) {
		var purseA = _purseOf(a);
		var purseB = _purseOf(b);
		var localPropertiesOfA = _newObject();
		var propertyName;
		for (propertyName in purseA) {
			if (_hasLocalProperty(purseA, propertyName) && _isPublic(propertyName)) {
				localPropertiesOfA[propertyName] = purseA[propertyName];
			}
		}
		for (propertyName in purseB) {
			if (_hasLocalProperty(purseB, propertyName) && _isPublic(propertyName)) {
				if (purseB[propertyName] !== localPropertiesOfA[propertyName]) {return false;}
				delete localPropertiesOfA[propertyName];
			}
		}
		for (propertyName in localPropertiesOfA) {
			if (localPropertiesOfA[propertyName] !== undefined) {return false;}
		}
		return true;
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
			return __basicName(this) + "-BD";
		};
		return _newTemplate(bootstrapInstance, "Clone");
	})();
	
	_setMethod(templateInstance0, "method", function (methodName, impFunc) {
		_setMethod(this, methodName, impFunc);
	});
		
	templateInstance0.method("isTemplate", function () {return _isTemplate(this);});
		
	templateInstance0.method("basicName", function () {return _basicName(this);});

	templateInstance0.method("name", function () {
		// This method can be overridden.
		return _name(this);
	});
	
	templateInstance0.method("isSameTypeAs", function (that) {
		if (this === that) {return true;}
		return (this.template() === that.template());
	});

	templateInstance0.method("hasIdenticalBehaviorAs", function (that) {
		if (this === that) {return true;}
		return (this.newInstance === that.newInstance);
	});

	templateInstance0.method("hasSameBehaviorAs", function (that) {
		// This method can be overridden.
		return this.hasIdenticalBehaviorAs(that);
	});

	templateInstance0.method("isIdentical", function (that) {return (this === that);});
	
	templateInstance0.method("copyAsTemplate", function (templateName, targetModule_) {
		return _newTemplate(this, templateName, targetModule_);
	});
	
	templateInstance0.method("initFromArgs", function (argumentsObject) {
		// Reimplement this method to initialize a new blank instance copy.
	});
		
	templateInstance0.method("isEqual", function (that) {
		// This method SHOULD be overridden.
		// return this.isIdentical(that);
		return (this.hasSameBehaviorAs(that) && _hasSameStateAs(this, that));
	});
	
	templateInstance0.method("blankCopy", templateInstance0.newInstance);
	
	templateInstance0.method("copy", function () {
		// This method SHOULD be overridden.
		var newInstance = this.newInstance();
		_copyPurseFromTo(this. newInstance);
		return newInstance;
	});	
});

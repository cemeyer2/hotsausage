"use strict";

HotSausage.newSubmodule("Templates", function (Templates, _Templates_HS) {
	var HS = Templates.module();
	var _newObject = _Templates_HS.newObject;
	var _hasLocalProperty = _Templates_HS.hasLocalProperty;
	var _isPublic = HS.isPublic;
	var _createConstantAccessor = HS.createConstantAccessor;
	
	var NEW_INSTANCE = "newInstance";
	
	var _purseOf = function (target) {return target.purse();};

	var _sharedPurseOf = function (target) {return target.purse();};

	var _privatePurseOf = function (target) {return target._purse();};

	var _attachPurseMethod = function (target, purse) {
		target._purse = _createPurseAccessor(purse);
		purse.owner = target;
		return purse;
	};
	
	var __purseCopyFromTo = function (ppSource, ppTarget) {
		var propertyName;
		for (propertyName in ppSource) {
			if (_isPublic(propertyName) && _hasLocalProperty(ppSource, propertyName)) {
				ppTarget[propertyName] = ppSource[propertyName];
			}
		}
	};
	
	var __putMethod = function (ppTarget, methodName, impFunc) {
		ppTarget._public[methodName] = impFunc;
		ppTarget._methods[methodName] = impFunc;
		return (ppTarget._methodCount += 1);
	};

	var __deleteMethod = function (ppTarget, methodName) {
		if (methodName in ppTarget._methods) {
			delete ppTarget._public[methodName];
			delete ppTarget._methods[methodName];
			return (ppTarget._methodCount -= 1);
		}
		return ppTarget._methodCount;
	};
	
	var __ensureMethodDictionary = function (ppTarget) {
		if (ppTarget._methods) {return;}
		ppTarget._methods = _newObject();
		ppTarget._methodCount = 0;
	};

	var __deleteMethodDictionary = function (ppTarget) {
		delete ppTarget._methods;
		delete ppTarget._methodCount;
	};
	
	var __copyMethodDictionary = function (ppTarget, ppSource) {
		var methods = ppSource._methods;
		var methodName;
		if (methods === undefined) {return;}
		for (methodName in methods) {
			__putMethod(ppTarget, methodName, methods[methodName]);
		}
	};
	
	var __copyMethods = function (ppTargetBehavior, pSourceInstance, ppSourceTemplate) {
		var ppSourceBehavior = pSourceInstance._ppBehavior;
		__ensureMethodDictionary(ppTargetBehavior);
		if (ppSourceBehavior !== ppSourceTemplate) {
			__copyMethodDictionary(ppTargetBehavior, ppSourceBehavior);
		}
		__copyMethodDictionary(ppTargetBehavior, pSourceInstance);
	};


	var __attachInstatiationMethods = function (_ppTargetBehavior) {
		var _Purse = function () {};
		var _Object = function () {};
		_Purse.prototype = _ppTargetBehavior._spBehavior; 
		_Object.prototype = _ppTargetBehavior._public; 
		var _pNewObject = function () {
			return _attachMethod_purse(new _Object(), new _Purse());
		};
		var impFunc = function newInstance(snapshotId_) {
			var pObject = _pNewObject();
			pObject._instanceId = _nextInstanceId(_ppTargetBehavior);
			return pObject._public;
		};
		_ppTargetBehavior._pNewObject = _pNewObject;
		__putMethod(_ppTargetBehavior, NEW_INSTANCE, impFunc);
	};

	var ppNewTemplate = pSourceInstance._newBehavior(TEMPLATE);
	var newTemplatePrototype = _newObject(sourceTemplate);
	var newTemplate = _newObject(newTemplatePrototype);
	var ppNewTemplate = _attachPurses(newTemplate, _newObject());
	
	var factoryMethod = _newSafeDualUseConstructor(newTemplate, newTemplatePrototype);
	_attachFactoryMethod(templateName, factoryMethod, targetModule);

			
	var _newBehaviorSnapshotFrom = function (sourceInstance) {
		var pSourceInstance = _purseOf(sourceInstance);
		var pTemplate = pSourceInstance._pTemplate;
		var pBehavior = pTemplate._pNewObject();
		pBehavior._snapshotId = pSourceInstance._snapshotId;
		pBehavior._pBehavior = pBehavior;
		__copyMethods(pBehavior, pSourceInstance, pTemplate);
		__attachMethod_newInstance(pSnapshot);
		return pBehavior._public;
	};
	
	var _deferred_newInstance = function () {
		var behaviorSnapshot = _newBehaviorSnapshotFrom(this);
		return (this.newInstance = behaviorSnapshot.newInstance)();
	};
	
	var __setSnapshotId = function (ppTarget, ppBehavior) {
		var ppTemplate = ppBehavior._ppTemplate;
		var id = ppTemplate._snapshotCount += 1;
		ppTarget._snapshotId = id;
	};
	
	var _setMethod = function (target, methodName, impFunc) {
		var ppTarget = _privatePurseOf(target);
		var ppBehavior = _privatePurseOf(ppTarget._behavior);
		var localMethodCount;
		
		if (ppBehavior._methods[methodName] === impFunc) {
			localMethodCount = __deleteMethod(ppTarget, methodName);
			if (localMethodCount <= 0) {__deleteMethodDictionary(ppTarget);}
			return;
		}
		if (target.isTemplate() || target.newInstance === _deferred_newInstance) {
			// target is template or has local methods but no copies yet
		} else {
			// target is either adding its first local method, or has already spawned 
			// a snapshot behavior, and since doing so, is adding a new local method again.
			target.newInstance = _deferred_newInstance;
			__setSnapshotId(ppTarget, ppBehavior);
			__ensureMethodDictionary(ppTarget);
		}
		__putMethod(ppTarget, methodName, impFunc);
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
		return factoryMethod;
	};

	var _attachFactoryMethod = function (templateName, factoryMethod, targetModule_) {
		var module = targetModule_ || Templates;
		if (module[templateName]) {return _onNameForTemplateAlreadyAssigned(module, name);}
		return (module[templateName] = factoryMethod);
	};
	
	var __initPTemplate = function (ppTemplate, templateName) {
		var _instanceCount = 0;
		var _snapshotCount = 0;
		pTemplate._pTemplate = pTemplate;
		pTemplate._pBehavior = pTemplate;
		pTemplate._templateName = templateName;
		pTemplate._nextInstanceId = function () {return _instanceCount += 1;};
		pTemplate._instanceCount = function () {return _instanceCount;};
		pTemplate._nextSnapshotId = function () {return _snapshotCount += 1;};
		pTemplate._snapshotCount = function () {return _snapshotCount;};
	};
	
	var _newTemplate = function (sourceInstance, templateName, targetModule) {
		var pSourceInstance =  _purseOf(sourceInstance);
		var ppNewTemplate = pSourceInstance._newBehavior(TEMPLATE);
		
		ppNewTemplate._name = templateName;
		ppNewTemplate.
		
		__initPTemplate(ppNewTemplate, templateName);
		if (pSourceInstance !== pSourceTemplate) {
			__copyMethods(pNewTemplate, pSourceInstance, pSourceTemplate);
		}
		__attachInstatiationMethods(ppNewTemplate);
		return newTemplate;
	};
 	
	//M3->the parameter object needs a template() function so that when passed to _newTemplate, line 187 runs properly
	//maybe should be: {template: function (){ return Object.prototype;}}
	var instance0 = _newTemplate({template: function () {Object.prototype}}, "Clone");
	
	_setMethod(instance0, "method", function (methodName, impFunc) {
		_setMethod(this, methodName, impFunc);
	});
		
	instance0.method("isTemplate", function () {return this === this.template();});
		
	instance0.method("basicName", function () {
		var template = this.template();
		var name = this.templateName();
		var purse, instanceId, snapshotId;
		if (this === template) {return name;}
		purse = _purseOf(this);
		instanceId = purse._instanceId;
		snapshotId = purse._snapshotId;
		if (instanceId === undefined) {return ["_", name, ":s", snapshotId].join("");}  // Behavior
		snapshotId = (snapshotId) ? ":s" + snapshotId : "";
		return [name.charAt(0).toLowerCase(), name.slice(1), instanceId, snapshotId].join("");
	});
	
	instance0.method("isSameTypeAs", function (that) {
		if (this === that) {return true;}
		return (this.template() === that.template());
	});

	instance0.method("hasIdenticalBehaviorAs", function (that) {
		if (this === that) {return true;}
		return (this.newInstance === that.newInstance);
	});

	instance0.method("hasEqualBehaviorAs", function (that) {
		// This method can be overridden.
		return this.hasIdenticalBehaviorAs(that);
	});

	instance0.method("isIdentical", function (that) {return (this === that);};
	
	instance0.method("copyAsTemplate", function (templateName, targetModule_) {
		return _newTemplate(this, templateName, targetModule_);
	});
	
	instance0.method("initFromArgs", function (argumentsObject) {
		// Reimplement this method to initialize a new blank instance copy.
	});
	
	instance0.method("name", function (that) {
		// This method can be overridden.
		return this.basicName();
	});
	
	instance0.method("isEqual", function (that) {
		// This method SHOULD be overridden.
		return this.isIdentical(that);
	});
	
	instance0.method("blankCopy", instance0.newInstance});
	
	instance0.method("copy", function () {
		// This method SHOULD be overridden.
		return this.newInstance();
	});
	
});

undefined
// Will speed up references to window, and allows munging its name.
window = this,
// Will speed up references to undefined, and allows munging its name.
undefined,

instanceof
for each -> https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Object/propertyIsEnumerable

CouchDB JS

ssh://hg@bitbucket.org/m3rabb/hotsausage/


// isLocalProperty isInstanceProperty
	
	
	_Eve.localAttributesAreEqual = function (that) {
		var propertyName;
		for (propertyName in this) {
			if (_notPrivateProperty(propertyName) && ) {
				if (this.hasOwnProperty(propertyName)) {
					if (! that.hasOwnProperty(propertyName)) {return false;}
					if (this[propertyName] !== that[propertyName]) {return false;}
				}
			}
		}
		return true;
	};
	

	var _copyLocalPropertiesFromTo = function (source, target) {
		var propertyName;
		for (propertyName in source) {
			if (source.hasOwnProperty(propertyName)) {
				target[propertyName] = source[propertyName];
			};
		};
	};

	var behaviorOf = function (instanceObject) {
		var behavior = _delegateOf(instanceObject);
		return checkValidBehavior(behavior);
	};

	var checkValidBehavior = function (target) {
		if (target === _SharedImplementation) { return target };
		if (_delegateOf(target) !== _SharedImplementation) {
			return outerObject.onInvalidShared(target);
		}
		return target;
	};

	var _Slice_Arguments_to_Array = Array.prototype.slice;
	
	var _arguments2Array = function (argumentsObject) {
		return _Slice_Arguments_to_Array.call(argumentsObject); 
	};


	var A = function () {
		this.count = 0;
	};
	var B = function () {};
	B.prototype = new A;

	var b1 = new B();

	alert(b1.count);

TextMate JavaScript

	function statement

function ${1:function_name} (${2:argument}) {
	${0:// body...}
}

	jasmine.Matchers.prototype.toBe = function(expected) {
	jasmine.Matchers.prototype.toNotBe = function(expected) {
	jasmine.Matchers.prototype.toEqual = function(expected) {
	jasmine.Matchers.prototype.toNotEqual = function(expected) {
	jasmine.Matchers.prototype.toMatch = function(reg_exp) {
	jasmine.Matchers.prototype.toNotMatch = function(reg_exp) {
	jasmine.Matchers.prototype.toBeDefined = function() {
	jasmine.Matchers.prototype.toBeNull = function() {
	jasmine.Matchers.prototype.toBeTruthy = function() {
	jasmine.Matchers.prototype.toBeFalsy = function() {


	jasmine.Matchers.prototype.toContain = function(item) {
	jasmine.Matchers.prototype.toNotContain = function(item) {


	
			var create_attachPurse = function (_Purse) {
				return function (target) {return (target._pp = new _Purse());};
			};

			var _attachTemplatePurse = function (template, delegateSharedPurse_) {
				var newAttachPurse;
				var sharedPurse = _newObject(delegateSharedPurse_);
				var Purse = function () {};
				Purse.prototype = sharedPurse;
				newAttachPurse = create_attachPurse(Purse);
				sharedPurse._attachPurse = newAttachPurse;
				return newAttachPurse(template);
			};
			
			
			var _attachMethod_newInstance = function (_behavior) {
				var _constructor = function ConstructorType() {
					if (this instanceof ConstructorType) {
						this._purse = _newObject();
						this._purse._instanceId = _nextInstanceId(_behavior);
					} else {
						return new ConstructorType();
					}
				};
				_constructor.prototype = _behavior; 
				_behavior.newInstance = _constructor;
				};
				// newInstance is one of the few methods that doesn't go into the methodDict 
				// to avoid copying it when creating a new behavior only to overwrite it with 
				// a new newInstance method.
			};

			var __purseCopyFromTo = function (pSource, pTarget) {




				Template
					_purse
						owner
						_hstd "privateTD"
							<sharedTD>
								behaviorTD "privateTD"
								templateTD "privateTD"
							Instance
							TData
							methods
							methodCount
							basicName
							instanceCount
							snapshotCount
							target
							templateTD "parent"
							behaviorTD "parent"
					newInstance

				Behavior
					_purse
						owner
						_hstd "privateTD"
							<sharedTD>
								behaviorTD "privateTD"
							Instance
							TData
							methods
							methodCount
							snapshotId	
							target
					newInstance


				Instance
					_purse
						owner
						_hstd "instanceTD"
							instanceId

				Instance <extended>
					_purse
						_hstd
							instanceId
							methods
							methodCount
							snapshotId
					newInstance		


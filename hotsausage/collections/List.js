/** 
 * List
 * @author Maurice Rabb
 */

"use strict";

/*jslint undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */

HotSausage.Collections.extend(function (Collections, _Collections_HS) {
	// var HS = Collections.module();
	var undefined;
	var _isNumber = _Collections_HS.isNumber;
	var createConstantAccessor = _Collections_HS.createConstantAccessor;

	var _inc = Collections.Span.inc;
	var _isSpan = Collections.Span.isSpan;
	var ENTIRE_SPAN = Collections.Span.allForward();
	var PUSH = Array.prototype.push;
	var SPLICE = Array.prototype.splice;
	var UNSHIFT = Array.prototype.unshift;
	
	
	var _array_forEach = function (array, action) {
		var limit = array.length, index = 0;
		while (index < limit) {
			action(array[index], index);
			index += 1;
		}
	};
	
	var _array_forEachWithin = function (array, action, normalizedSpan) {
		var match,
			index = normalizedSpan.start,
			limit = normalizedSpan.end,
			wraps = normalizedSpan.wraps;
			
		if (normalizedSpan.direction >= 0) {
			match = wraps ? array.length : limit;
			do {
				while (index < match)  {
					action(array[index], index);
					index += 1;
				}
				if (!wraps) {return;}
				index = 0; match = limit; wraps = false;
			} while (true);
		} else {
			match = wraps ? 0 : limit;
			do {
				while (index > match)  {
					index -= 1;
					action(array[index], index);
				}
				if (!wraps) {return;}
				index = array.length; match = limit; wraps = false;
			} while (true);
		}
	};

	var __array_fromTo = function (targetArray, start, end, wraps) {
		var elements1, elements2;
		if (wraps) {
			elements1 = targetArray.slice(start, targetArray.length);
			elements2 = targetArray.slice(0, end);
			PUSH.apply(elements1, elements2);
			return elements1;
		}
		if (start === end) {return [];}
		return targetArray.slice(start, end);
	};

	var __within = function (list, normSpan) {
		var elements = list._elements;
		return (normSpan.direction >= 0) ?
			__array_fromTo(elements, normSpan.start, normSpan.end, normSpan.wraps) :
			__array_fromTo(elements, normSpan.end, normSpan.start, normSpan.wraps).reverse();
	};

	var __replaceFromTo = function (list, replacements, startEdge, endEdge) {
		var elements = list._elements,
			size = elements.length,
			removed = [],
			spanSize, offset, fill, spliceParams;
		if (startEdge >= size) {
			if (replacements.length > 0) {
				offset = startEdge - size;
				elements.length += offset;
				PUSH.apply(elements, replacements);
			}
		} else if (endEdge === size) {
			if (startEdge === 0) {
				removed = elements;
				list._elements = replacements.slice();
			} else {
				spanSize = endEdge - startEdge;
				removed = elements.splice(startEdge, spanSize);
				PUSH.apply(elements, replacements);
			}
		} else if (endEdge <= 0) {
			if (replacements.length > 0) {
				if (endEdge === 0) {
					fill = replacements;
				} else {
					offset = endEdge + size;
					fill = replacements.slice();
					fill.length -= offset;
				}
				UNSHIFT.apply(elements, fill);
			}
		} else {
			spanSize = endEdge - startEdge;
			if (spanSize > 0) {
				spliceParams = [startEdge, spanSize];
				PUSH.apply(spliceParams, replacements);
				removed = SPLICE.apply(elements, spliceParams);
			}
		}
		return removed;
	};

	var __wrapReplaceFromTo = function (list, upperFill, lowerFill, start, end) {
		var elements = list._elements,
			removed1 = elements.splice(start, elements.length - start),
			removed2,
			spliceParams = [0, end];
		PUSH.apply(spliceParams, lowerFill);
		removed2 = SPLICE.apply(elements, spliceParams);
		PUSH.apply(elements, upperFill);
		PUSH.apply(removed1, removed2);
		return removed1;
	};
	
	var __wrapReplaceAll = function (list, replacements, normalizedSpan, isReversed) {
		var size = list.size(),
			replacementsSize = replacements.length,
			start = normalizedSpan.start,
			end = normalizedSpan.end,
			leadingSpanSize = isReversed ? start : size - start,
			fill1, fill2, removed;
		if (replacementsSize > leadingSpanSize) {
			fill1 = replacements.slice(0, leadingSpanSize);
			fill2 = replacements.slice(leadingSpanSize, replacementsSize);
		} else {
			fill1 = isReversed ? replacements.slice() : replacements;
			fill2 = [];
		}
		if (isReversed) {
			fill1.reverse();
			fill2.reverse();
			removed = __wrapReplaceFromTo(list, fill2, fill1, end, start);
			return removed.reverse();
		} 
		return __wrapReplaceFromTo(list, fill1, fill2, start, end);
	};
	
	var __replaceWithAll = function (list, replacements, normalizedSpan) {
		var isReversed = normalizedSpan.direction < 0,
			reverse, removed;       
		if (normalizedSpan.wraps) {
			return __wrapReplaceAll(list, replacements, normalizedSpan, isReversed);
		}  
		if (isReversed) {
			reverse = replacements.slice().reverse();
			removed = __replaceFromTo(list, reverse, normalizedSpan.end, normalizedSpan.start);
			return removed.reverse();
		}
		return __replaceFromTo(list, replacements, normalizedSpan.start, normalizedSpan.end);
	};

	var __removeAtIndex = function (list, index) {
		return (__replaceFromTo(list, [], index, index + 1))[0];
	};

	var __removeCount = function (list, isFromStart, count, outOfRangeAction_) {
		var elements = list._elements,
			size = elements.length,
			removeCount, startEdge, removed;
		if (count < 0) {
			if (outOfRangeAction_) {return outOfRangeAction_(count);}
			removeCount = 0;
		} else if (count > size) {
			if (outOfRangeAction_) {return outOfRangeAction_(count);}
			removeCount = size;
		} else {
			removeCount = count;
		}
		if (removeCount === size) {
			removed = elements;
			list._elements = [];
		} else {
			startEdge = isFromStart ? 0 : size - count;
			removed = elements.splice(startEdge, removeCount);
		}
		return list.newInstance(removed);
	};

	var __createElementMatchAction = function (_matchElment) {
		return function (element) {return element === _matchElment;};
	};

	var __match = function (list, _conditionAction, absentAction_, normalizedSpan_, invalidSpanAction__) {
		var _answer, matchAction;

		matchAction = function (each, index) {
			if (_conditionAction(each, index)) {
				throw (_answer = {element: each, index: index});
			}
		};
		try {
			list.forEach(matchAction, normalizedSpan_, invalidSpanAction__);
		} catch (ex) {
			if (ex === _answer) {return _answer;}
			throw ex;
		}
		return absentAction_ && absentAction_();
	};

	var List = function (array) {
		this._elements = array;
		// this._iterators = [];  // Add dependent iterators when necessary.
	};
		
	var _theEmptyList = new List([]);
	
	var newList = function (array_) {
		if (array_) {return new List(array_);}
		return (this instanceof basicList) ? new List([]) : _theEmptyList;
	};
	
	var _isList = function () {return true;};
	
	var _asArray = function (elements) {
		return _isList(elements) ? elements._elements : elements;
	};

	var _asSpan = function (edgeOrSpan) {
		return _isNumber(edgeOrSpan) ? _inc(edgeOrSpan) : edgeOrSpan;
	};
	
	var Collections_List, List_prototype;
	
	
	Collections.List = newList;
	Collections_List = Collections.List;
	
	Collections_List.empty = createConstantAccessor(_theEmptyList);	
	
	Collections_List.isList = function (target) {return (target.isList === _isList);};
	
	
	List_prototype = List.prototype;
	
	// CREATING
	
	List_prototype.newInstance = function (elements_) {
		return new List (elements_ ? _asArray(elements_) : []);
	};
		
	// IMMUTABILITY
	
	List_prototype.setImmutable = function () {this._immutable = true;};
	
	List_prototype.asImmutable = function () {
		if (this._immutable) {return this;}
		return this.copy().setImmutable();
	};
	
	List_prototype.isImmutable = function () {return ("_immutable" in this);};

	// ACCESSING
	
	List_prototype.at = function (indexer, outOfRangeAction_) {	// index|span|list
		var elements;
		if (_isSpan(indexer)) {
			return this.within(indexer, outOfRangeAction_);
		}
		elements = this._elements;
		if (outOfRangeAction_) {
			if (indexer < 0 || indexer >= elements.length) {
				return outOfRangeAction_(indexer);
			}
		}
		return elements[indexer];
	};
	
	List_prototype.first = function (count_, outOfRangeAction_) {
		var span, 
			elements = this._elements;
		if (_isNumber(count_)) {
			span = _inc(0, count_);
			return this.within(span, outOfRangeAction_);
		} else if (elements.length === 0) {
			return outOfRangeAction_ && outOfRangeAction_(0);
		} 
		return elements[0];
	};
	
	List_prototype.last = function (count_, outOfRangeAction_) {
		var span,
			elements = this._elements,
			size = elements.length;
		if (_isNumber(count_)) {
			span = _inc(size - count_, size);
			return this.within(span, outOfRangeAction_);
		} else if (elements.length === 0) {
			return outOfRangeAction_ && outOfRangeAction_(-0);
		} 
		return elements[size - 1];
	};
		
	List_prototype.within = function (span, invalidSpanAction_) {
		var normalizedSpan = span.asNormalizedFor(this, invalidSpanAction_);
		return this.emptyCopy(__within(this, normalizedSpan));
	};
	
	List_prototype.indexOf = function (element, absentAction_, span_, invalidSpanAction__) {
		var matchAction = __createElementMatchAction(element);
		return this.indexOfSatisfying(
			matchAction, absentAction_, span_, invalidSpanAction__
		);
	};
	
	List_prototype.elementSatisfying = function (conditionAction, absentAction_, span_, invalidSpanAction__) {
		var match = __match(
				this, conditionAction, absentAction_, span_, invalidSpanAction__
			);
		return match.element;
	};
	
	List_prototype.indexOfSatisfying = function (conditionAction, absentAction_, span_, invalidSpanAction__) {
		var match = __match(
				this, conditionAction, absentAction_, span_, invalidSpanAction__
			);
		return match.index;
	};
	
	List_prototype.everySatisfying = function (_conditionAction, span_, invalidSpanAction__) {
		var _answer = [];
		var matchAction = function (each, index) {
			if (_conditionAction(each, index)) {_answer.push(each);}
		};
		this.forEach(matchAction, span_, invalidSpanAction__);
		return this.newInstance(_answer);
	};

	List_prototype.indexOfEverySatisfying = function(_conditionAction, span_, invalidSpanAction__){
		var _answer = [];
		var matchAction = function (each, index) {
			if (_conditionAction(each, index)) {_answer.push(index);}
		};
		this.forEach(matchAction, span_, invalidSpanAction__);
		return this.newInstance(_answer);		
	};
		
	List_prototype.indexOfEvery = function (element, span_, invalidSpanAction__) {
		var matchAction = __createElementMatchAction(element);
		return this.indexOfEverySatisfying(matchAction, span_, invalidSpanAction__);
	};
	
	List_prototype.size = function () {return this._elements.length;};

	// TESTING
	
	List_prototype.isList = _isList;
	
	List_prototype.isEmpty = function () {return (this._elements.length === 0);};
	
	List_prototype.notEmpty = function () {return (this._elements.length > 0);};

	// ENUMERATING
	
	List_prototype.forEach = function (action, span_, invalidSpanAction__) {
		var normalizedSpan;
		if (span_) {
			normalizedSpan = span_.asNormalizedFor(this, invalidSpanAction__);
			_array_forEachWithin(this._elements, action, normalizedSpan);
		} else {
			_array_forEach(this._elements, action);
		}
	};
	
	List_prototype.map = function (_action, span_, invalidSpanAction__) {
		var _answer = [];
		var mapAction = function (each, index) {_answer.push(_action(each, index));};
		this.forEach(mapAction, span_, invalidSpanAction__);
		return this.newInstance(_answer);
	};
	
	List_prototype.remap = function (_action, span_, invalidSpanAction__) {
		var _elements = this._elements;
		var mapAction = function (each, index) {_elements[index] = _action(each, index);};
		this.forEach(mapAction, span_, invalidSpanAction__);
		return this;
	};

	// ADDING
	
	List_prototype.addFirst = function (element) {
		this._elements.unshift(element);
	};
	
	List_prototype.addLast = function (element) {
		this._elements.push(element);
	};
	
	List_prototype.addAllFirst = function (elements) {
		UNSHIFT.apply(this._elements, _asArray(elements));
	};
	
	List_prototype.addAllLast = function (elements) {
		PUSH.apply(this._elements, _asArray(elements));
	};
	
	List_prototype.add = function (element, indexer_, invalidSpanAction__) {
		if (indexer_ === undefined) {return this.addLast(element);}
		this.replaceWith(element, indexer_, invalidSpanAction__);
	};
	
	List_prototype.addAll = function (elements, edgeOrSpan_, invalidSpanAction__) {
		var normalizedSpan;
		if (edgeOrSpan_ === undefined) {return this.addAllLast(elements);}
		normalizedSpan = _asSpan(edgeOrSpan_).asNormalizedFor(this, invalidSpanAction__);
		__replaceWithAll(this, _asArray(elements), normalizedSpan);
	};

	// REMOVING
	
	List_prototype.removeAt = function (indexer, outOfRangeAction_) {
		if (_isSpan(indexer)) {
			return this.removeWithin(indexer, outOfRangeAction_);
		}
		if (indexer < 0 || indexer >= this._elements.length) {
			return outOfRangeAction_ && outOfRangeAction_(indexer);
		}
		return __removeAtIndex(this, indexer);
	};
	
	List_prototype.removeFirst = function (count_, outOfRangeAction_) {
		var elements = this._elements;
		if (_isNumber(count_)) {return __removeCount(this, true, count_, outOfRangeAction_);}
		if (elements.length === 0) {return outOfRangeAction_ && outOfRangeAction_(0);}
		return elements.shift();
	};
	
	List_prototype.removeLast = function (count_, outOfRangeAction_) {
		var elements = this._elements;
		if (_isNumber(count_)) {return __removeCount(this, false, count_, outOfRangeAction_);}
		if (elements.length === 0) {return outOfRangeAction_ && outOfRangeAction_(-0);} 
		return elements.pop();
	};
	
	List_prototype.removeWithin = function (span, invalidSpanAction_) {
		var normalizedSpan = span.asNormalizedFor(this, invalidSpanAction_);
		var removed = __replaceWithAll(this, [], normalizedSpan);
		return this.newInstance(removed);
	};
	
	List_prototype.remove = function (element, absentAction_, span_, invalidSpanAction__) {
		var matchAction = __createElementMatchAction(element);
		return this.removeSatisfying(matchAction, absentAction_, span_, invalidSpanAction__);
	};

	List_prototype.removeEverySatisfying = function (_conditionAction, span_, invalidSpanAction__) {
		var _indexes = [];
		var _removed = [];
		var matchAction = function (each, index) {
			if (_conditionAction(each, index)) {_indexes.push(index);}
		};
		var removeAction = function (eachIndex) {
			_removed.push(__removeAtIndex(this, eachIndex));
		};
		try {
			this.forEach(matchAction, span_, invalidSpanAction__);		
		} catch (ex) {
			throw ex;
		} finally {
			_array_forEach(_indexes, removeAction);
		}
		return this.newInstance(_removed);
	};
	
	List_prototype.removeEvery = function (element, span_, invalidSpanAction__) {
		var matchAction = __createElementMatchAction(element);
		return this.removeEverySatisfying(matchAction, span_, invalidSpanAction__);
	};
	
	List_prototype.removeSatisfying = function (conditionAction, absentAction_, span_, invalidSpanAction__) {
		var index = this.indexOfSatisfying(
			conditionAction, absentAction_, span_, invalidSpanAction__
		);
		return __removeAtIndex(this, index);
	};

	// REPLACING	
	
	List_prototype.replaceWith = function (replacement, indexer, outOfRangeAction_) {
		var elements, size, startEdge;
		var replacements = [replacement];
		if (_isSpan(indexer)) {
			return this.replaceWithAll(replacements, indexer, outOfRangeAction_);
		}
		
		elements = this._elements;
		size = elements.length;
		startEdge = indexer;
		if (startEdge >= size) {
			if (outOfRangeAction_) {return outOfRangeAction_(indexer);}
		} else if (startEdge < 0) {
			if (outOfRangeAction_) {return outOfRangeAction_(indexer);}
			startEdge -= size;
		}
		return __replaceFromTo(this, replacements, startEdge, startEdge + 1)[0];
	};
	
	List_prototype.replaceWithAll = function (elements, edgeOrSpan_, invalidSpanAction__) {
		var normalizedSpan = edgeOrSpan_ ? 
			_asSpan(edgeOrSpan_).asNormalizedFor(this, invalidSpanAction__) : ENTIRE_SPAN;
		var removed = __replaceWithAll(this, _asArray(elements), normalizedSpan);
		return this.newInstance(removed);
	};
	
	// COPYING
	
	List_prototype.copy = function (span_, invalidSpanAction__) {
		var normalizedSpan;
		if (span_ === undefined) {return this.newInstance(this._elements.slice(0));}
		normalizedSpan = span_.asNormalizedFor(this, invalidSpanAction__);
		return this.newInstance(__within(this, normalizedSpan));
	};
	
	List_prototype.emptyCopy = function () {return this.newInstance();};
	
	List_prototype.copyWithFirst = function (element) {return this.copy().addFirst(element);};
	
	List_prototype.copyWithLast = function (element) {return this.copy().addLast(element);};
	
	List_prototype.copyWithAllFirst = function (elements) {
		return this.copy().addAllFirst(elements);
	};
	
	List_prototype.copyWithAllLast = function (elements) {
		return this.copy().addAllLast(elements);
	};
	
	List_prototype.copyWith = function (element, indexer_, outOfRangeAction__) {
		if (indexer_ === undefined) {return this.copyWithLast(element);}
		return this.copy().replaceWith(element, indexer_, outOfRangeAction__);
	};

	List_prototype.copyWithAll = function (elements, indexer_, outOfRangeAction__) {
		if (indexer_ === undefined) {return this.copyWithAllLast(elements);}
		return this.copy().replaceWithAll(elements, indexer_, outOfRangeAction__);
	};
	
});


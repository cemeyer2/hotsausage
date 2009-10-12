/** 
 * List
 * @author Maurice Rabb
 */

"use strict";

addIntoModule(function (module) {
	var inc = module.Span.inc;
	var isSpan = module.Span.isSpan;
	var EntireSpan = module.Span.entire();
	var Array_push = Array.prototype.push;
	var Array_splice = Array.prototype.splice;
	var Array_unshift = Array.prototype.unshift;
	var isNumber = module.Util.isNumber;
	
	var List = function (array) {
		this._elements = array || [];
		// this._iterators = [];  // Add dependent iterators when necessary.
	};

	var _arrayForEach_ = function (array, action) {
		var limit = array.length, 
			index;
		for (index = 0; index < limit; index += 1) {
			action(array[index], index);
		}
	};
		
	var _arrayForEach_within_ = function (array, action, span) {
		var match,
			index = span.start,
			limit = span.end,
			wraps = span.wraps;
			
		if (span.direction >= 0) {
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

	var __fromTo = function (targetArray, start, end, wraps) {
		var elements1, elements2;
		if (wraps) {
			elements1 = targetArray.slice(start, targetArray.length);
			elements2 = targetArray.slice(0, end);
			Array_push.apply(elements1, elements2);
			return elements1;
		} else if (start === end) {
			return [];
		} else {
			return targetArray.slice(start, end);
		}
	};

	var _within_ = function (list, span) {
		var elements = list._elements,
			subelements;
		if (span.direction >= 0) {
			subelements = __fromTo(elements, span.start, span.end, span.wraps);
		} else {
			subelements = __fromTo(elements, span.end, span.start, span.wraps);
			subelements.reverse();
		}
		return subelements;
	};

	var _asArray = function (elements) {
		return (elements instanceof List) ? elements._elements : elements;
	};

	var __replaceFromTo = function (list, replacements, start, end) {
		var elements = list._elements,
			size = elements.length,
			removed = [],
			spanSize, offset, fill, spliceParams;
		if (start >= size) {
			if (replacements.length > 0) {
				offset = start - size;
				elements.length += offset;
				Array_push.apply(elements, replacements);
			}
		} else if (end === size) {
			if (start === 0) {
				removed = elements;
				list._elements = replacements.slice();
			} else {
				spanSize = end - start;
				removed = elements.splice(start, spanSize);
				Array_push.apply(elements, replacements);
			}
		} else if (end <= 0) {
			if (replacements.length > 0) {
				if (end === 0) {
					fill = replacements;
				} else {
					offset = end + size;
					fill = replacements.slice();
					fill.length -= offset;
				}
				Array_unshift.apply(elements, fill);
			}
		} else {
			spanSize = end - start;
			if (spanSize > 0) {
				spliceParams = [start, spanSize];
				Array_push.apply(spliceParams, replacements);
				removed = Array_splice.apply(elements, spliceParams);
			}
		}
		return removed;
	};

	var __wrapReplaceFromTo = function (list, upperFill, lowerFill, start, end) {
		var elements = list._elements,
			removed1 = elements.splice(start, elements.length - start),
			removed2,
			spliceParams = [0, end];
		Array_push.apply(spliceParams, lowerFill);
		removed2 = Array_splice.apply(elements, spliceParams);
		Array_push.apply(elements, upperFill);
		Array_push.apply(removed1, removed2);
		return removed1;
	};
	
	var __wrapReplace = function (list, replacements, span, isReversed) {
		var size = list.size(),
			replacementsSize = replacements.length,
			start = span.start,
			end = span.end,
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
	
	var _replaceWithArray_within_ = function (list, replacements, span) {
		var isReversed = span.direction < 0,
			reverse, removed;       
		if (span.wraps) {
			return __wrapReplace(list, replacements, span, isReversed);
		}  
		if (isReversed) {
			reverse = replacements.slice().reverse();
			removed = __replaceFromTo(list, reverse, span.end, span.start);
			return removed.reverse();
		}
		return __replaceFromTo(list, replacements, span.start, span.end);
	};

	var _removeAtIndex_ = function (list, index) {
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
		return new List(removed);
	};

	var __newElementMatchAction = function (_matchElment) {
		return function (element) {return element === _matchElment;};
	};

	var __match = function (list, conditionAction, absentAction_, span_, invalidSpanAction__) {
		var _answer, matchAction;

		matchAction = function (each, index) {
			if (conditionAction(each, index)) {
				throw (_answer = {element: each, index: index});
			}
		};
		try {
			list.forEach(matchAction, span_, invalidSpanAction__);
		} catch (ex) {
			if (ex === _answer) {return _answer;}
			throw ex;
		}
		return absentAction_ && absentAction_();
	};


	var _behavior = List.prototype;
	
	module.List = List;
	
	List.isList = function (target) {return (target instanceof List);};
	


	// ACCESSING
	
	_behavior.at = function (indexer, outOfRangeAction_) {	// index|span|list
		var elements;
		if (isSpan(indexer)) {
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
	
	_behavior.first = function (count_, outOfRangeAction_) {
		var span, 
			elements = this._elements;
		if (isNumber(count_)) {
			span = inc(0, count_);
			return this.within(span, outOfRangeAction_);
		} else if (elements.length === 0) {
			return outOfRangeAction_ && outOfRangeAction_();
		} 
		return elements[0];
	};
	
	_behavior.last = function (count_, outOfRangeAction_) {
		var span,
			elements = this._elements,
			size = elements.length;
		if (isNumber(count_)) {
			span = inc(size - count_, size);
			return this.within(span, outOfRangeAction_);
		} else if (elements.length === 0) {
			return outOfRangeAction_ && outOfRangeAction_();
		} 
		return elements[size - 1];
	};
		
	_behavior.within = function (edgeOrSpan, invalidSpanAction_) {	// edge|span
		var subelements,
			span = isNumber(edgeOrSpan) ? inc(edgeOrSpan) : edgeOrSpan;
		span = span.asNormalizedFor(this, invalidSpanAction_);
		subelements = _within_(this, span);
		return new List(subelements);
	};
	
	_behavior.indexOf = function (element, absentAction_, span_, invalidSpanAction__) {
		var matchAction = __newElementMatchAction(element);
		return this.indexOfSatisfying(
			matchAction, absentAction_, span_, invalidSpanAction__
		);
	};
	
	_behavior.elementSatisfying = function (conditionAction, absentAction_, span_, invalidSpanAction__) {
		var match = __match(
				this, conditionAction, absentAction_, span_, invalidSpanAction__
			);
		return match.element;
	};
	
	_behavior.indexOfSatisfying = function (conditionAction, absentAction_, span_, invalidSpanAction__) {
		var match = __match(
				this, conditionAction, absentAction_, span_, invalidSpanAction__
			);
		return match.index;
	};
	
	_behavior.everySatisfying = function (conditionAction, span_, invalidSpanAction__) {
		var _answer = [],
			matchAction = function (each, index) {
				if (conditionAction(each, index)) {_answer.push(each);}
			};
		this.forEach(matchAction, span_, invalidSpanAction__);
		return new List(_answer);
	};

	_behavior.indexOfEverySatisfying = function (conditionAction, span_, invalidSpanAction__) {
		var _answer = [],
			matchAction = function (each, index) {
				if (conditionAction(each, index)) {_answer.push(index);}
			};
		this.forEach(matchAction, span_, invalidSpanAction__);
		return new List(_answer);		
	};
		
	_behavior.indexOfEvery = function (element, span_, invalidSpanAction__) {
		var matchAction = __newElementMatchAction(element);
		return this.indexOfEverySatisfying(matchAction, span_, invalidSpanAction__);
	};
	
	_behavior.size = function () {
		return this._elements.length;
	};

	// TESTING
	
	_behavior.isList = function () {return true;};
	
	_behavior.isEmpty = function () {return (this._elements.length === 0);};
	
	_behavior.notEmpty = function () {return (this._elements.length > 0);};

	// ENUMERATING
	
	_behavior.forEach = function (action, span_, invalidSpanAction__) {
		var span;
		if (!span_) {
			_arrayForEach_(this._elements, action);
		} else {
			span = span_.asNormalizedFor(this, invalidSpanAction__);
			_arrayForEach_within_(this._elements, action, span);
		}
	};
	
	_behavior.map = function (action, span_, invalidSpanAction__) {
		var _answer = [],
			mapAction = function (each, index) {
				_answer.push(action(each, index));
			};
		this.forEach(mapAction, span_, invalidSpanAction__);
		return new List(_answer);
	};
	
	_behavior.remap = function (action, span_, invalidSpanAction__) {
		var _elements = this._elements,
			mapAction = function (each, index) {
				_elements[index] = action(each, index);
			};
		this.forEach(mapAction, span_, invalidSpanAction__);
		return this;
	};

	// ADDING
	
	_behavior.addFirst = function (element) {
		this._elements.unshift(element);
	};
	
	_behavior.addLast = function (element) {
		this._elements.push(element);
	};
	
	_behavior.addFirstAll = function (elements) {
		Array_unshift.apply(this._elements, _asArray(elements));
	};
	
	_behavior.addLastAll = function (elements) {
		Array_push.apply(this._elements, _asArray(elements));
	};
	
	_behavior.add = function (element, indexer_, invalidSpanAction__) {
		if (arguments.length === 1) {
			this.addLast(element);
		} else {
			this.replaceWith(element, indexer_, invalidSpanAction__);
		}
	};
	
	_behavior.addAll = function (elements, span_, invalidSpanAction__) {
		var span;if (arguments.length === 1) {
			this.addLastAll(elements);
		} else {
			span = span_.asNormalizedFor(this, invalidSpanAction__);
			_replaceWithArray_within_(this, _asArray(elements), span);
		}
	};

	// REMOVING
	
	_behavior.removeAt = function (indexer, outOfRangeAction_) {
		if (isSpan(indexer)) {
			return this.removeWithin(indexer, outOfRangeAction_);
		}
		if (indexer < 0 || indexer >= this._elements.length) {
			return outOfRangeAction_ && outOfRangeAction_(indexer);
		}
		return _removeAtIndex_(this, indexer);
	};
	
	_behavior.removeFirst = function (count_, outOfRangeAction_) {
		var elements = this._elements;
		if (isNumber(count_)) {
			return __removeCount(this, true, count_, outOfRangeAction_);
		} else if (elements.length === 0) {
			return outOfRangeAction_ && outOfRangeAction_();
		}
		return elements.shift();
	};
	
	_behavior.removeLast = function (count_, outOfRangeAction_) {
		var elements = this._elements;
		if (isNumber(count_)) {
			return __removeCount(this, false, count_, outOfRangeAction_);
		} else if (elements.length === 0) {
			return outOfRangeAction_ && outOfRangeAction_();
		} 
		return elements.pop();
	};
	
	_behavior.removeWithin = function (span, invalidSpanAction_) {
		var removed,
			normalizedSpan = span.asNormalizedFor(this, invalidSpanAction_);
		removed = _replaceWithArray_within_(this, [], normalizedSpan);
		return new List(removed);
	};
	
	_behavior.remove = function (element, absentAction_, span_, invalidSpanAction__) {
		var matchAction = __newElementMatchAction(element);
		return this.removeSatisfying(
			matchAction, absentAction_, span_, invalidSpanAction__
		);
	};

	_behavior.removeEverySatisfying = function (conditionAction, span_, invalidSpanAction__) {
		var _indexes = [],
			_removed = [],
			matchAction = function (each, index) {
				if (conditionAction(each, index)) {_indexes.push(index);}
			},
			removeAction = function (eachIndex) {
				_removed.push(_removeAtIndex_(this, eachIndex));
			};
		try {
			this.forEach(matchAction, span_, invalidSpanAction__);		
		} catch (ex) {
			throw ex;
		} finally {
			_arrayForEach_(_indexes, removeAction);
		}
		return new List(_removed);
	};
	
	_behavior.removeEvery = function (element, span_, invalidSpanAction__) {
		var matchAction = __newElementMatchAction(element);
		return this.removeEverySatisfying(matchAction, span_, invalidSpanAction__);
	};
	
	_behavior.removeSatisfying = function (conditionAction, absentAction_, span_, invalidSpanAction__) {
		var index = this.indexOfSatisfying(conditionAction, absentAction_, span_, invalidSpanAction__);
		return _removeAtIndex_(this, index);
	};

	// REPLACING	
	
	_behavior.replaceWith = function (replacement, indexer, outOfRangeAction_) {
		var elements, size, startEdge,
			replacements = [replacement];
		if (isSpan(indexer)) {
			return this.replaceWithAll(
				replacements, indexer, outOfRangeAction_
			);
		}
		elements = this._elements;
		size = elements.length;
		if (indexer >= size) {
			if (outOfRangeAction_) {return outOfRangeAction_(indexer);}
			startEdge = indexer;
		} else if (indexer < 0) {
			if (outOfRangeAction_) {return outOfRangeAction_(indexer);}
			startEdge = indexer - size;
		}
		return __replaceFromTo(this, replacements, startEdge, startEdge + 1)[0];
	};
	
	_behavior.replaceWithAll = function (elements, span_, invalidSpanAction__) {
		var span = span_ ? 
				span_.asNormalizedFor(this, invalidSpanAction__) : EntireSpan,
			removed = _replaceWithArray_within_(this, _asArray(elements), span);
		return new List(removed);
	};
})();

/*
	removeOver
	replaceWithAllOver
	spanOver
	replaceWithOver

	removeOverEvery
	replaceWithAllOverEvery
	spanOverEvery
	replaceWithOverEvery
*/
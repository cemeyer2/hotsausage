"use strict";

/*jslint undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */

HotSausage.Collections.extend(function (Collections, _Collections_HS) {
	// var HS = Collections.module();
	var _direction = _Collections_HS.direction;
	var _isNumber = _Collections_HS.isNumber;

	var ORIGINAL_IS_OK = _Collections_HS.newObject();
	var ORIGINAL_MUST_BE_REPLACED = _Collections_HS.newObject();
	var ORIGINAL_IS_AN_EDGE = _Collections_HS.newObject();
	var POSTSPAN = "postspan";
	var PRESPAN = "prespan";
	
	// If the direction is undefined or 0, 
	//  the span can be either wrapping or nonwrapping
	// If the direction is 1 (i.e. increasing)
	//  if the startEdge < endEdge it is nonwrapping, 
	//  if the startEdge >= endEdge it is wrapping
	// If the direction is -1 (i.e. decreasing)
	//  if the startEdge > endEdge it is nonwrapping, 
	//  if the startEdge <= endEdge it is wrapping
	var _Span = function (direction, startEdge, endEdge, wraps) {
		this.direction = direction;
		this.start = startEdge;
		this.end = endEdge;
		this.wraps = wraps;
	};
	
	var _edgeToEdgeDirection = function (startEdge, endEdge) {
		var startDirection = _direction(startEdge);
		var endDirection = _direction(endEdge);
		if (startDirection !== endDirection) {return undefined;}
		if (startEdge === endEdge) {return 0;}
		return (startEdge < endEdge) ? 1 : -1;
	};
	
	var _newDirectionalSpan = function (spanDirection, startEdge_, endEdge__, wrapIfNecessary__) {
		var startEdge = startEdge_ || 0;
		var endEdge, wraps, basicDirection;
		if (_isNumber(endEdge__)) {
			basicDirection = _edgeToEdgeDirection(startEdge, endEdge__);
			if (wrapIfNecessary__) {
				wraps = (basicDirection !== spanDirection);
				endEdge = endEdge__;
			} else {
				wraps = false;
				endEdge = (basicDirection * spanDirection === -1) ? startEdge : endEdge__;
			}
		} else {
			endEdge = startEdge;
			wraps = !! endEdge__;
		}
		return new _Span(spanDirection, startEdge, endEdge, wraps);
	};
		
	var inc = function (startEdge_, endEdge__, wrapIfNecessary__) {
		return _newDirectionalSpan(1, startEdge_, endEdge__, wrapIfNecessary__);
	};

	var dec = function (startEdge_, endEdge__, wrapIfNecessary__) {
		return _newDirectionalSpan(-1, startEdge_, endEdge__, wrapIfNecessary__);
	};

	var _theEmptySpan = new _Span(0, 0, 0, false);
	
	var basic = function Span(startEdge_, endEdge__) {
		var endEdge, derivedDirection;
		if (arguments.length === 0) {return _theEmptySpan;}
		endEdge = endEdge__ || startEdge_;
		derivedDirection = _edgeToEdgeDirection(startEdge_, endEdge);
		return new _Span(derivedDirection, startEdge_, endEdge, false);
	};

	var _isSpan = function () {return true;};
	
	var Span = basic;
	
	Collections.Span = Span;
	
	Span.empty = _Collections_HS.createConstantAccessor(_theEmptySpan);
	Span.allForward = _Collections_HS.createConstantAccessor(inc(0, true));	
	Span.allBackward = _Collections_HS.createConstantAccessor(dec(0, true));	
	
	Span.basic = basic;
	Span.inc = inc;
	Span.dec = dec;
	
	Span.isSpan = function (target) {return (target.isSpan === _isSpan);};
	
	Span.prototype.isSpan = function () {return true;};
	
	Span.prototype.size = function () {
		var direction = this.direction;
		if (direction === undefined || this.wraps) {return undefined;}
		return this.direction * (this.end - this.start);
	};
	
	Span.prototype.asNormalizedFor = function (sizeOrList, outOfBoundsAction_) {
		var size = (_isNumber(sizeOrList)) ? sizeOrList : sizeOrList.size(),
			normalizedSpan = this, status = ORIGINAL_IS_OK,
			outfBounds, problems = {},
			upperEdge = size, lowerEdge = -upperEdge,
			start = this.start, end = this.end, 
			wraps = this.wraps, direction = this.direction,
			hasNegativeStart = _direction(start) < 0,
			hasNegativeEnd = _direction(end) < 0,
			normalizedStart = start, normalizedEnd = end,
			linearStart = start, linearEnd = end;
		
		if (start > upperEdge) {
			problems.start = (outfBounds = POSTSPAN);
			normalizedStart = size;
			status = ORIGINAL_MUST_BE_REPLACED;
		} else if (hasNegativeStart) {
			linearStart = start + size;
			if (start < lowerEdge) {
				problems.start = (outfBounds = PRESPAN);
				normalizedStart = 0;
			} else {
				normalizedStart = linearStart;
			}
			status = ORIGINAL_MUST_BE_REPLACED;
		}
		if (end > upperEdge) {
			problems.end = (outfBounds = POSTSPAN);
			normalizedEnd = size;
			status = ORIGINAL_MUST_BE_REPLACED;
		} else if (hasNegativeEnd) {
			linearEnd = end + size;
			if (end < lowerEdge) {
				problems.end = (outfBounds = PRESPAN);
				normalizedEnd = 0;
			} else {
				normalizedEnd = linearEnd;
			}
			status = ORIGINAL_MUST_BE_REPLACED;
		}
		if (!wraps) {
			if (direction === undefined) {
				direction = (linearEnd - linearStart) >= 0 ? 1 : -1;
				// Implicit status = ORIGINAL_MUST_BE_REPLACED because an undefined   
				// direction is only possible with a negative start or negative end value.
			} else if (outfBounds) {
				// If allowing an out-of-bounds span, it must be compressed to an edge.
				if (start === end) {status = ORIGINAL_IS_AN_EDGE;}
				else if (direction >= 0) {
					if (end < lowerEdge) {normalizedStart = normalizedEnd = end;} 
					else if (start > upperEdge) {normalizedStart = normalizedEnd = start;}
				} else {
					if (start < lowerEdge) {normalizedStart = normalizedEnd = start;} 
					else if (end > upperEdge) {normalizedStart = normalizedEnd = end;}
				}
			}
		}
		if (status === ORIGINAL_IS_OK) {return this;}
		if (status === ORIGINAL_MUST_BE_REPLACED) {
			normalizedSpan = new _Span(direction, normalizedStart, normalizedEnd, wraps);
		}
		if (outfBounds && outOfBoundsAction_) {return outOfBoundsAction_(normalizedSpan, problems);}
		return normalizedSpan;
	};
});	
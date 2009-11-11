"use strict";

/*jslint undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */

HotSausage.Collections.extend(function (Collections, _Collections_HS) {
	// var HS = Collections.module();
	var _direction = _Collections_HS.direction;
	var _isNumber = _Collections_HS.isNumber;
	var createConstantAccessor = _Collections_HS.createConstantAccessor;

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
		// this.wrapIfNecessary = wrapIfNecessary_;
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
	
	var basic = function basicSpan(startEdge_, endEdge__) {
		var endEdge, derivedDirection;
		if (arguments.length === 0) {return _theEmptySpan;}
		endEdge = endEdge__ || startEdge_;
		derivedDirection = _edgeToEdgeDirection(startEdge_, endEdge);
		return new _Span(derivedDirection, startEdge_, endEdge, false);
	};

	var _isSpan = function () {return true;};
	
	var Span = basic;
	var SpanBehavior = Span.prototype;
	
	Collections.Span = Span;
	
	Span.empty = createConstantAccessor(_theEmptySpan);
	Span.allForward = createConstantAccessor(inc(0, true));	
	Span.allBackward = createConstantAccessor(dec(0, true));	
	
	Span.basic = basic;
	Span.inc = inc;
	Span.dec = dec;
	
	Span.isSpan = function (target) {return (target.isSpan === _isSpan);};
	
	SpanBehavior.isSpan = function () {return true;};
	
	SpanBehavior.size = function () {
		var direction = this.direction;
		if (direction === undefined || this.wraps) {return undefined;}
		return this.direction * (this.end - this.start);
	};
	
	SpanBehavior.asNormalizedFor = function (sizeOrList, outOfBoundsAction_) {
		var size = (_isNumber(sizeOrList)) ? sizeOrList : sizeOrList.size(),
			newSpan = this, createNewSpan, 
			problems = {}, outfBounds,
			upperEdge = size, lowerEdge = -upperEdge,
			start = this.start, end = this.end, 
			wraps = this.wraps, direction = this.direction,
			newStart, newEnd, linearStart, linearEnd;
	
		if (createNewSpan = (_direction(start) < 0)) {
			linearStart = start + size;
			if (start < lowerEdge) {
				problems.start = (outfBounds = PRESPAN);
				if (!wraps && direction <= 0) {newStart = newEnd = start;} 
				else {newStart = 0;}
			} else {
				newStart = linearStart;
			}
		} else {
			linearStart = start;
			if (createNewSpan = (start > upperEdge)) {
				problems.start = (outfBounds = POSTSPAN);
				if (!wraps && direction >= 0) {newStart = newEnd = start;} 
				else {newStart = size;} 
			} else {
				newStart = start;
			}
		}
		if (start === end) {newEnd = newStart;}
		if (newEnd !== undefined) {
			newSpan = (newEnd === end) ? this : new _Span(direction, newStart, newEnd, false);
		} else {
			if (createNewSpan = (_direction(end) < 0)) {
				linearEnd = end + size;
				if (end < lowerEdge) {
					problems.end = (outfBounds = PRESPAN);
					if (!wraps && direction >= 0) {newStart = newEnd = end;}
					else {newEnd = 0;} 
				} else {
					newEnd = linearEnd;
				}
			} else {
				linearEnd = end;
				if (createNewSpan = (end > upperEdge)) {
					problems.end = (outfBounds = POSTSPAN);
					if (!wraps && direction <= 0) {newStart = newEnd = end;}
					else {newEnd = size;}
				} else {
					newEnd = end;
				}
			}
			if (direction === undefined) {direction = (linearEnd - linearStart) >= 0 ? 1 : -1;}
			newSpan = (createNewSpan) ? 
				new _Span(direction, newStart || start, newEnd || end, wraps) : this;
		}
		return (outfBounds && outOfBoundsAction_) ? outOfBoundsAction_(newSpan, problems) : newSpan;
	};
});	
"use strict";

/*jslint undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */

HotSausage.Collections.extend(function (Collections, _Collections_HS) {
	// var HS = Collections.module();
	var _signValue = _Collections_HS.signValue;
	var _equalValues = _Collections_HS.equalValues;
	var _isNumber = _Collections_HS.isNumber;
	var createConstantAccessor = _Collections_HS.createConstantAccessor;

	var POSTSPAN = "postspan";
	var PRESPAN = "prespan";
	var FORWARD = 1;
	var BACKWARD = -1;
	
	// If the direction is undefined or 0, 
	//  the span can be either wrapping or nonwrapping
	// If the direction is 1 (i.e. increasing)
	//  if the startEdge < endEdge it is nonwrapping, 
	//  if the startEdge >= endEdge it is wrapping
	// If the direction is -1 (i.e. decreasing)
	//  if the startEdge > endEdge it is nonwrapping, 
	//  if the startEdge <= endEdge it is wrapping
	var Span = function (direction, startEdge, endEdge, wraps) {
		this.direction = direction;
		this.start = startEdge;
		this.end = endEdge;
		this.wraps = wraps;
		// this.wrapIfNecessary = wrapIfNecessary_;
	};
	
	var _theDefaultSpan = new Span(FORWARD, 0, 0, false);
	
	var _impliedDirectionFrom = function (startEdge, endEdge) {
		var startIsNegativeZero = true;
		if (startEdge === 0) {
			if (1 / value > 0) {return 1;} // (+0 -> ±0 | ±N)
			// startEdge is -0
			if (endEdge === 0) {
				if (1 / value < 0) {return 1;} // (-0 -> -0)
			}
			return -1; // (-0 -> +0 | ±N)
		}
		if (endEdge === 0) {return (1 / value > 0) ? -1 : 1;} // (±N -> +0) and (±N -> -0)
		// direction is undefined if the edges are of opposite sign
		if ((startEdge > 0) !== (endEdge > 0)) {return undefined;}
		return (startEdge <= endEdge) ? 1 : -1;
	};
	
	var _newSpan = function (declaredDirection, startEdge_, endEdge__, wrapIfNecessary__) {
		var startEdge, endEdge, wraps, basicDirection;
		if (_isNumber(endEdge__)) {
			startEdge = startEdge_;
			endEdge = endEdge__;
			wraps = wrapIfNecessary__ || false;
		} else {
			startEdge = startEdge_ || 0;
			endEdge = startEdge;
			wraps = endEdge__ || false;
		}
		impliedDirection = _impliedDirectionFrom(startEdge, endEdge);
		if (impliedDirection && startEdge === endEdge) {
			direction = declaredDirection || FORWARD;
			return new Span(direction, startEdge, endEdge, wraps);
			// Note: If edges are 0 and -0, further checks below need to be done. 
			// Fortunately, checking if basicDirection is undefined preventing this early out.
		}
		if (declaredDirection) {
			if (wraps) {
				// No need for wraps = true, if it is impossible for the span to wrap 
				wraps = (impliedDirection !== declaredDirection);
				// Note: wraps is never true if declaredDirection = undefined.
			} else {
				// Nonwrapping spans have endEdge clamped to startEdge if unreachable.
				if (impliedDirection * declaredDirection === -1) {endEdge = startEdge;}
				// declared implied action comment
				//    1       1      none   ok. the edge match the direction of the span
				//    1      -1      clamp  endEdge will never be reached, so clamp it
				//    1       ?      none   keep and clamp later at normalization, if necessary
			}
			direction = declaredDirection;
		} else {
			direction = impliedDirection;
		}
		return new Span(direction, startEdge, endEdge, wraps);
	};
		
	// This method is a convenience for performance
	var _newEdgeSpan = function (direction, edgeValue_, wraps__) {
		var edgeValue = edgeValue || 0;
		var wraps = wraps__ || false;
		return new Span(direction, edgeValue, edgeValue, wraps);
	};

	var edge = function (edgeValue) {
		return _newEdgeSpan(FORWARD, edgeValue, false);
	};

	var span = function basicSpan(startEdge_, endEdge__, directionSign___, wrapIfNecessary____) {
		return (arguments.length === 0) ? 
			_theDefaultSpan : (directionSign___, startEdge_, endEdge_, wrapIfNecessary____);
	};

	var inc = function (startEdge_, endEdge__, wrapIfNecessary__) {
		return (arguments.length <= 1) ?
			_newEdgeSpan(FORWARD, startEdge_, wrapIfNecessary__) : 
			_newSpan(FORWARD, startEdge_, endEdge__, wrapIfNecessary__);
	};

	var dec = function (startEdge_, endEdge__, wrapIfNecessary__) {
		return (arguments.length <= 1) ?
			_newEdgeSpan(BACKWARD, startEdge_, wrapIfNecessary__) : 
			_newSpan(BACKWARD, startEdge_, endEdge__, wrapIfNecessary__);
	};
		
	var basic = function basicSpan(startEdge_, endEdge__) {
		return _newSpan(undefined, startEdge_, endEdge__, false);
	};

	var _isSpan = function () {return true;};
	
	var Collections_Span, Span_prototype;
	
	
	Collections.edge = edge;
	Collections.span = span;
	Collections.Span = span;
	Collections_Span = Collections.Span;
	
	Collections_Span.edge = edge;
	Collections_Span.basic = basic;
	Collections_Span.inc = inc;
	Collections_Span.dec = dec;
	
	Collections_Span.empty = createConstantAccessor(_theDefaultSpan);
	Collections_Span.allForward = createConstantAccessor(inc(0, true));	
	Collections_Span.allBackward = createConstantAccessor(dec(0, true));	
	
	Collections_Span.isSpan = function (target) {return (target.isSpan === _isSpan);};
	
	
	Span_prototype = Span.prototype;
	
	Span_prototype.isSpan = _isSpan;
	
	Span_prototype.isSameAs = function (that) {
		var thisStart = this.start, thisEnd = this.end; 
		var thatStart = that.start, thatEnd = that.end; 
		return (this === that) ||
			(_equalValues(thisStart, thatStart) && (_equalValues(thisEnd, thatEnd)) &&
			(this.direction === that.direction) && (this.wraps === that.wraps));
	};
	
	Span_prototype.size = function () {
		var direction = this.direction;
		if (direction === undefined || this.wraps) {return undefined;}
		return this.direction * (this.end - this.start);
	};
	
	Span_prototype.asNormalizedFor = function (measure, outOfBoundsAction_) {
		var size = _isNumber(measure) ? measure : measure.size(),
			newSpan, needsNewSpan, 
			problems = {}, outfBounds,
			upperEdge = size, lowerEdge = -upperEdge,
			start = this.start, end = this.end, 
			wraps = this.wraps, direction = this.direction,
			newStart, newEnd, linearStart, linearEnd,
			notWrapping = !wraps, isEdge = (start === end);
	
		if (needsNewSpan = (_signValue(start) < 0)) {
			linearStart = start + size;
			if (start < lowerEdge) {
				problems.start = (outfBounds = PRESPAN);
				if (notWrapping && (isEdge || direction < 0)) {newStart = newEnd = start;} 
				else {newStart = 0;}
			} else {
				newStart = linearStart;
			}
		} else {
			linearStart = start;
			if (needsNewSpan = (start > upperEdge)) {
				problems.start = (outfBounds = POSTSPAN);
				if (notWrapping && (isEdge || direction > 0)) {newStart = newEnd = start;} 
				else {newStart = size;} 
			} else {
				newStart = start;
			}
		}
		if (isEdge) {newEnd = newStart;}
		if (newEnd !== undefined) {
			newSpan = (newEnd === end) ? this : new Span(direction, newStart, newEnd, false);
		} else {
			if (needsNewSpan = (_signValue(end) < 0)) {
				linearEnd = end + size;
				if (end < lowerEdge) {
					problems.end = (outfBounds = PRESPAN);
					if (notWrapping && direction > 0) {newStart = newEnd = end;}
					else {newEnd = 0;} 
				} else {
					newEnd = linearEnd;
				}
			} else {
				linearEnd = end;
				if (needsNewSpan = (end > upperEdge)) {
					problems.end = (outfBounds = POSTSPAN);
					if (notWrapping && direction < 0) {newStart = newEnd = end;}
					else {newEnd = size;}
				} else {
					newEnd = end;
				}
			}
			if (notWrapping) {
				
			}
			if (needsNewSpan) {
				if (direction === undefined) {
					direction = (linearEnd - linearStart) >= 0 ? FORWARD : BACKWARD;
				}
				newSpan = new Span(direction, newStart, newEnd, wraps);
			} else {
				newSpan = this;
			}
		}
		return (outfBounds && outOfBoundsAction_) ? outOfBoundsAction_(newSpan, problems) : newSpan;
	};
});	
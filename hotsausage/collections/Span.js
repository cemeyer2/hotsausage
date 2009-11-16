"use strict";

/*jslint undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */

HotSausage.Collections.extend(function (Collections, _Collections_HS) {
	// var HS = Collections.module();
	var _signValue = _Collections_HS.signValue;
	var _equalValues = _Collections_HS.equalValues;
	var _isNumber = _Collections_HS.isNumber;
	var createConstantAccessor = _Collections_HS.createConstantAccessor;

	var undefined;
	var POSTSPAN = "postspan";
	var PRESPAN = "prespan";
	var FORWARD = 1;
	var BACKWARD = -1;
	var NONDIRECTIONAL = 0;
	var UNDEFINED;
	
	// If the direction is UNDEFINED or NONDIRECTIONAL, 
	//  the span can be either wrapping or nonwrapping
	// If the direction is FORWARD
	//  if the startEdge < endEdge it is nonwrapping, 
	//  if the startEdge >= endEdge it is wrapping
	// If the direction is BACKWARD
	//  if the startEdge > endEdge it is nonwrapping, 
	//  if the startEdge <= endEdge it is wrapping
	var Span = function (direction, impliedDirection, startEdge, endEdge, wraps) {
		this.direction = direction;
		this.impliedDirection = impliedDirection;
		this.start = startEdge;
		this.end = endEdge;
		this.wraps = wraps;
		// this.wrapIfNecessary = wrapIfNecessary_;
	};
	
	var _theDefaultSpan = new Span(NONDIRECTIONAL, NONDIRECTIONAL, 0, 0, false);
		
	var _impliedDirectionFrom = function (startEdge, endEdge) {
		var zeroEndEdge, endSignValue;
		// c1     +0  ->  +0          NONDIRECTIONAL
		// c2 c3  +0  ->  -0 | ±N     FORWARD
		// c4     -0  ->  -0          NONDIRECTIONAL
		// c5 c6  -0  ->  +0 | ±N     BACKWARD
		// c7     ±N  ->  +0          BACKWARD
		// c8     ±N  ->  -0          FORWARD
		// c9      n  ->   n          NONDIRECTIONAL
		// c10    +N  ->  -N          UNDEFINED
		// c11    -N  ->  +N          UNDEFINED
		// c12     m  ->   n          FORWARD
		// c13     n  ->   n          BACKWARD
		zeroEndEdge = (endEdge === 0);
		if (startEdge === 0) {
			endSignValue = 1 / endEdge;
			return (1 / startEdge > 0) ?
				( (zeroEndEdge && (endSignValue > 0)) ? NONDIRECTIONAL : FORWARD ) : // c1,c2,c3
				( (zeroEndEdge && (endSignValue < 0)) ? NONDIRECTIONAL : BACKWARD ); // c4,c5,c6
		}
		if (zeroEndEdge) {
			endSignValue = 1 / endEdge;
			return (endSignValue > 0) ? BACKWARD : FORWARD; // c7,c8
		}
		if (startEdge === endEdge) {return NONDIRECTIONAL;} // c9
		if ((startEdge > 0) !== (endEdge > 0)) {return UNDEFINED;} // c10,c11
		return (startEdge < endEdge) ? FORWARD : BACKWARD; // c12,c13
	};
	
	var _newSpan = function (declaredDirection, startEdge_, endEdge__, wrapIfNecessary__) {
		var startEdge, endEdge, wraps, impliedDirection, direction;
		if (_isNumber(endEdge__)) {
			startEdge = startEdge_;
			endEdge = endEdge__;
			wraps = wrapIfNecessary__ || false;
		} else {
			startEdge = _isNumber(startEdge_) ? startEdge_ : 0;
			endEdge = startEdge;
			wraps = endEdge__ || false;
		}
		impliedDirection = _impliedDirectionFrom(startEdge, endEdge); // FWD | BWD | NON | UND 
		if (declaredDirection === UNDEFINED) {
			direction = impliedDirection;
			wraps = false;
		} else {
			direction = declaredDirection; // FORWARD | BACKWARD | NONDIRECTIONAL
			if (wraps) {
				// No need for wraps to be true, if it is impossible for the span to wrap 
				wraps = (impliedDirection !== declaredDirection);

			// declared implied action comment
			//   FWD     FWD     none   Ok. the edge match the direction of the span
			//   FWD     BWD     clamp  The endEdge will never be reached, so clamp it
			//   FWD     NONDIR  none   The span itself is an edge, so it already "clamped"
			//   FWD     UDEF    delay  Keep and clamp later at normalization, if necessary
			} else if (impliedDirection * declaredDirection === -1) { // if opposite directions
				// Nonwrapping spans have endEdge clamped to startEdge if unreachable.
				endEdge = startEdge;
				impliedDirection = NONDIRECTIONAL;
			}
		}
		return new Span(direction, impliedDirection, startEdge, endEdge, wraps);
	};
		
	// This method is a convenience for performance
	var _newEdgeSpan = function (direction, edgeValue_, wraps__) {
		var edgeValue = _isNumber(edgeValue_) ? edgeValue_ : 0;
		var wraps = wraps__ || false;
		return new Span(direction, NONDIRECTIONAL, edgeValue, edgeValue, wraps);
	};

	var edge = function (edgeValue) {
		return _newEdgeSpan(NONDIRECTIONAL, edgeValue, false);
	};

	var span = function basicSpan(startEdge_, endEdge__, directionSign___, wrapIfNecessary____) {
		return (arguments.length === 0) ? 
			_theDefaultSpan : 
			_newSpan(directionSign___, startEdge_, endEdge__, wrapIfNecessary____);
	};

	var inc = function (startEdge_, endEdge__, wrapIfNecessary__) {
		return (arguments.length <= 1) ?
			_newEdgeSpan(FORWARD, startEdge_, false) : 
			_newSpan(FORWARD, startEdge_, endEdge__, wrapIfNecessary__);
	};

	var dec = function (startEdge_, endEdge__, wrapIfNecessary__) {
		return (arguments.length <= 1) ?
			_newEdgeSpan(BACKWARD, startEdge_, false) : 
			_newSpan(BACKWARD, startEdge_, endEdge__, wrapIfNecessary__);
	};
		
	var basic = function basicSpan(startEdge_, endEdge__) {
		return span.apply(null, arguments);
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
			((this.direction === that.direction) && (this.wraps === that.wraps) &&
			(this.impliedDirection === that.impliedDirection) &&
			_equalValues(thisStart, thatStart) && _equalValues(thisEnd, thatEnd));
	};
	
	Span_prototype.size = function () {
		var direction = this.direction;
		if (direction === UNDEFINED || this.wraps) {return undefined;}
		return this.direction * (this.end - this.start);
	};
	
	Span_prototype.asNormalizedFor = function (measure, outOfBoundsAction_) {
		var size = _isNumber(measure) ? measure : measure.size(),
			normalizeSpan, needsNewSpan, 
			problems = {}, outOfBounds,
			upperEdge = size, lowerEdge = -upperEdge,
			start = this.start, end = this.end, 
			wraps = this.wraps, nonwrapping = !wraps,
			direction = this.direction, observedDirection,
			impliedDirection = this.impliedDirection,
			newStart, newEnd, normalizedStart, normalizedEnd;
	
		if (needsNewSpan = (_signValue(start) < 0)) {
			normalizedStart = start + size;
			if (start < lowerEdge) {
				problems.start = (outOfBounds = PRESPAN);
				if (nonwrapping && impliedDirection <= NONDIRECTIONAL) {
					newStart = newEnd = start; // BACKWARD || NONDIRECTIONAL
				} else {newStart = 0;}         // FORWARD || UNDEFINED
			} else {newStart = normalizedStart;}
		} else {
			normalizedStart = start;
			if (needsNewSpan = (start > upperEdge)) {
				problems.start = (outOfBounds = POSTSPAN);
				if (nonwrapping && impliedDirection >= NONDIRECTIONAL) {
					newStart = newEnd = start; // FORWARD || NONDIRECTIONAL
				} else {newStart = size;}      // BACKWARD || UNDEFINED
			} else {newStart = normalizedStart;}
		} 
		if (start === end) {newEnd = newStart;}
		if (newEnd !== undefined) {
			normalizeSpan = (newEnd === end) ? 
				this : new Span(direction, NONDIRECTIONAL, newStart, newEnd, wraps);
		} else {
		// From this point forward, direction & impliedDirection will never be NONDIRECTIONAL.
			if (needsNewSpan = (_signValue(end) < 0)) {
				normalizedEnd = end + size;
				if (end < lowerEdge) {
					problems.end = (outOfBounds = PRESPAN);
					if (nonwrapping && impliedDirection === FORWARD) {newStart = newEnd = end;}
					else {newEnd = 0;} // BACKWARD || UNDEFINED
				} else {newEnd = normalizedEnd;}
			} else {
				newEnd = normalizedEnd = end;
				if (needsNewSpan = (end > upperEdge)) {
					problems.end = (outOfBounds = POSTSPAN);
					if (nonwrapping && impliedDirection === BACKWARD) {newStart = newEnd = end;}
					else {newEnd = size;} // FORWARD || UNDEFINED
				} else {newEnd = normalizedEnd;}
			}
			
			if (impliedDirection) {observedDirection = impliedDirection;}
			else { // impliedDirection === UNDEFINED
				// Note: needsNewSpan is implicitly set since an UNDEFINED impliedDirection 
				// is only possible when one edge is negative, and the other positive.
				observedDirection = (normalizedStart === normalizedEnd) ? 
					NONDIRECTIONAL : ((normalizedStart < normalizedEnd) ? FORWARD : BACKWARD);
				if (wraps) {wraps = (observedDirection !== direction);} 
				else {
					if (direction === UNDEFINED) {direction = observedDirection;}
					else if (observedDirection !== direction) { // if opposite directions
						newEnd = newStart;
						observedDirection = NONDIRECTIONAL;
					}
				}
			}
			normalizeSpan = (needsNewSpan) ? 
				new Span(direction, observedDirection, newStart, newEnd, wraps) : this;
		}
		return (outOfBounds && outOfBoundsAction_) ? 
			outOfBoundsAction_(normalizeSpan, problems, this) : normalizeSpan;
	};
});
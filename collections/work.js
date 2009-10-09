
/*
	spanOver(matchElements, span_, invalidRangeAction_)
	replaceWithOver(replacement, matchElements, span_, invalidRangeAction_)
	replaceWithAllOver(replacements, matchElements, span_, invalidRangeAction_)
	removeOver(matchElements, span_, invalidRangeAction_)

	spanAcrossSatisfying(width, matchAction, absentAction_, span_, invalidRangeAction_)
	replaceWithAcrossSatisfying(replacement, width, matchAction, absentAction_, span_, invalidRangeAction_)
	replaceWithAllAcrossSatisfying(replacements, width, matchAction, absentAction_, span_, invalidRangeAction_)
	removeAcrossSatisfying(width, matchAction, absentAction_, span_, invalidRangeAction_)

	spanOverEvery(matchElements, span_, invalidRangeAction_, allowOverlaps_)
	replaceWithOverEvery(replacement, matchElements, span_, invalidRangeAction_)
	replaceWithAllOverEvery(replacements, matchElements, span_, invalidRangeAction_)
	removeOverEvery(matchElements, span_, invalidRangeAction_)

	spanAcrossEverySatisfying(width, matchAction, span_, invalidRangeAction_, allowOverlaps_)
	replaceWithAcrossEverySatisfying(replacement, width, matchAction, span_, invalidRangeAction_)
	replaceWithAllAcrossEverySatisfying(replacements, width, matchAction, span_, invalidRangeAction_)
	removeAcrossEverySatisfying(width, matchAction, span_, invalidRangeAction_)
*/

spanAcrossEverySatisfying(width, matchAction, span_, invalidRangeAction_, allowOverlaps_)
replaceWithAllAcrossEverySatisfying(replacements, width, matchAction, span_, invalidRangeAction_)

var _arrayDo_ = function (array, action) {
	var limit = array.length, 
		index;
	for (index = 0; index < limit; index += 1) {
		action(array[index], index);
	}
};
	
var _within_arrayDo_ = function (array, span, action) {
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

_behavior.elementsDo = function (action, acrossWidth_, span_, invalidSpanAction__) {
	var span;
	if (acrossWidth_ === undefined) {
		return _arrayDo_(this._elements, action); 
	} else {
		if (isSpan(acrossWidth_)) {
			span = acrossWidth_;
			invalidSpanAction = span_;
		} else if (acrossWidth_ === 1) {
			if (span_ === undefined) {
				return _arrayDo_(this._elements, action); 
			}
			span = span_;
			invalidSpanAction = invalidSpanAction__;
		}
		span = span.asNormalizedFor(this, invalidSpanAction);
		return _within_arrayDo_(this._elements, span, action);
	}
	_across_within_arrayDo_(this._elements, acrossWidth_, span, action);
};

	Iterator
		originalSpan
		span
		currentEdge
		target
		isDependent
	
	peek(count_, outOfRangeAction_)
	peekUpToEnd()
-	skip(count_, outOfRangeAction_)
-	next(count_, outOfRangeAction_)
	nextUpToEnd()
	skipTo(element)
	skipToOver(elements)
	peekFor(element)
	peekForOver(element)
	upTo(element)
	upToOver(elements)
-	position()
-	setPosition(edge, outOfRangeAction_)
-	reset()
-	atEnd()
-	nextPut(element, outOfRangeAction_)
-	nextPutAll(elements, outOfRangeAction_)
	decouple()
	isDecoupled()
	collection()/target()
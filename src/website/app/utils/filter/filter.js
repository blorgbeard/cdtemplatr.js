'use strict';


// given a list of strings implicitly joined by spaces and an index into the joined string,
// return an index into the list and an index into the indexed string.
function deconstructIndex(ix, list) {
  let indexIntoItem = ix;
  let itemIndex = 0;
  while (itemIndex < list.length && indexIntoItem >= list[itemIndex].length) {
    indexIntoItem -= (list[itemIndex].length + 1);  // the +1 is for the space
    itemIndex++;
  }
  return {itemIndex: itemIndex, indexIntoItem: indexIntoItem};
}

// given ix1 and ix2, and a list of strings implicitly joined by space characters,
// return a list of (sub)strings that are between ix1 and ix2
function chopFieldList(ix1, ix2, list) {
  if (ix1 > ix2) return [];
  
  let result = {};  
  let index1 = deconstructIndex(ix1, list);
  let index2 = deconstructIndex(ix2, list);

  // if both indexes are in the same string, this becomes very simple
  if (index1.itemIndex === index2.itemIndex) {
    result[index1.itemIndex] = list[index1.itemIndex].slice(Math.max(0, index1.indexIntoItem), index2.indexIntoItem + 1);
    return result;
  }

  // add strings up until the string of the second index
  while (index1.itemIndex < index2.itemIndex) {
    // if we're "before" a word here, we take the whole word (as if we were on char 0)
    result[index1.itemIndex] = list[index1.itemIndex].slice(Math.max(0, index1.indexIntoItem));
    index1.itemIndex++;
    index1.indexIntoItem = 0;    
  }

  // add the final string, if there is one (of non-zero-length)
  if (index2.itemIndex < list.length && index2.indexIntoItem >= 0) {  
    result[index2.itemIndex] = list[index2.itemIndex].slice(0, index2.indexIntoItem + 1); 
  }
  
  return result;
}


module.exports = {
  deconstructIndex: deconstructIndex,
  chopFieldList: chopFieldList,

  apply: function(filter, haystackFields) {

    if (filter.trim() === "") {
      // match anything, no highlight
      return haystackFields.map(t=>({text:t}));
    }

    filter = filter.toLowerCase();
    const haystack = haystackFields.join(' ').toLowerCase();
 
    // if it's not a substring, strip all spaces
    filter = filter.replace(/\s/g,"");

    let stack = [{
      ixFilter: 0,
      ixHaystack: 0,
      ixHaystackIncrement: 0,
      result: haystackFields.map(t => [])
    }];

    const cloneState = (state, ixHaystackIncrement) => ({
      ixFilter: state.ixFilter,
      ixHaystack: state.ixHaystack,
      ixHaystackIncrement: ixHaystackIncrement || 0,
      result: state.result.map(field => field.map(t => {
        let x = {};
        if (t.text) x.text = t.text;
        if (t.match) x.match = t.match;
        return x;
      }))
    });

    while (stack.length > 0) {
      let state = stack.pop();
      
      while (state.ixHaystack < haystack.length && state.ixFilter < filter.length) {

        // we need the next filter character to be at the start of a word
        let regex = `(^|[^a-z0-9])${filter[state.ixFilter]}`;
        let match = haystack.slice(state.ixHaystack + state.ixHaystackIncrement).match(regex);
        if (!match) break;
        
        // ok, found it
        let offset = match.index + (match[0].length-1) + state.ixHaystackIncrement;
        state.ixHaystackIncrement = 0;

        // before we process the match from this position, checkpoint the *next* position,
        // so we can come back and find the *next* match if this one is a dead end.  
        stack.push(cloneState(state, offset+1));        

        // add text section(s) before it
        let texts = chopFieldList(state.ixHaystack, state.ixHaystack + offset-1, haystackFields);
        for (let ix in texts) {
          state.result[ix].push({text: texts[ix]});
        }
        
        // add the new highlighted section
        state.ixHaystack += offset;
        let ixHaystackDeconstructed = deconstructIndex(state.ixHaystack, haystackFields);
        let ixMatchWord = ixHaystackDeconstructed.itemIndex;
        const matchWord = haystackFields[ixMatchWord];
        const matchChar = matchWord[ixHaystackDeconstructed.indexIntoItem];
        state.result[ixMatchWord].push({match: matchChar});

        // increment search position for next character
        state.ixHaystack++;
        state.ixFilter++;
                
        // are there more consecutive chars that match?
        while ((state.ixFilter < filter.length) && (state.ixHaystack < haystack.length) && (haystack[state.ixHaystack] === filter[state.ixFilter])) {
          // yes. but before we continue, do a checkpoint again
          stack.push(cloneState(state));

          let ixNextChar = deconstructIndex(state.ixHaystack, haystackFields);
          if (ixNextChar.itemIndex === ixMatchWord) {
            const nextWord = haystackFields[ixMatchWord];
            const nextChar = matchWord[ixNextChar.indexIntoItem];
            state.result[ixMatchWord][state.result[ixMatchWord].length-1].match += nextChar;
          } else {
            // we hit a word boundary. ixNextChar.indexIntoItem should be -1 here (representing the space between words)
            ixMatchWord = ixNextChar.itemIndex;        
            const nextWord = haystackFields[ixMatchWord];
            const nextChar = matchWord[ixNextChar.indexIntoItem + 1]; 
            state.result[ixMatchWord].push({match: nextChar});
            state.ixFilter++; // skip the space
          }
            
          state.ixHaystack++;
          state.ixFilter++;
        }
        // end of this part of the match

        // look for the next match at the start of a word - i.e. loop.
      }

      if (state.ixFilter == filter.length) {
        // we made it to the end of the filter
        // we've matched it, but we need to add the rest of the text to the result
        let texts = chopFieldList(state.ixHaystack, haystack.length-1, haystackFields);
        for (let ix in texts) {
          state.result[ix].push({text: texts[ix]});
        }
        return state.result;
      }

      // didn't match the entire filter - try to backtrack and continue      
    } 

    // we exhausted all possibilities - there just ain't no matchr
    return false;
  }
};